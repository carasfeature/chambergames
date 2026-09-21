/* ============================================================
   shared/caption.js
   Shared state handling for Caption This.
   Both the viewer page and the host panel talk to Firebase
   through here, so they can never disagree about the round shape.

   Data layout:
     captionGame/current                 the round everyone is watching
     captionGame/submissions/<roundId>/<twitchName>
   ============================================================ */

const CDN = "https://www.gstatic.com/firebasejs/10.12.0/";
let fbdb = null, db = null, boot = null;

export function initCaption(config){
  if (boot) return boot;
  boot = (async () => {
    if (!config?.databaseURL) throw new Error("Firebase config is missing databaseURL");
    const [appMod, dbMod] = await Promise.all([
      import(CDN + "firebase-app.js"),
      import(CDN + "firebase-database.js")
    ]);
    fbdb = dbMod;
    // Own app name: leaderboard.js already registers "site", and Firebase
    // refuses two apps with the same name on one page.
    const app = appMod.getApps().find(a => a.name === "caption")
             || appMod.initializeApp(config, "caption");
    db = dbMod.getDatabase(app);
  })();
  return boot;
}

/* ---------- reading ---------- */

/** Watch the live round. Fires immediately and on every change. */
export function watchRound(onChange, onError){
  return fbdb.onValue(fbdb.ref(db, "captionGame/current"),
    s => onChange(s.val() || { phase: "idle" }),
    e => onError?.(e));
}

/** Watch submissions for one round (host only needs this). */
export function watchSubmissions(roundId, onChange, onError){
  return fbdb.onValue(fbdb.ref(db, `captionGame/submissions/${roundId}`),
    s => {
      const out = [];
      s.forEach(c => out.push({ name: c.key, ...c.val() }));
      onChange(out);
    },
    e => onError?.(e));
}

/* ---------- writing: viewers ---------- */

/** Normalised form used for duplicate detection. */
export const normalise = t =>
  String(t).toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

/**
 * Submit a caption. Rejects blocked words, over-length text and
 * anything already said by someone else this round.
 * The database rule also blocks a second write from the same name.
 */
export async function submitCaption({ roundId, name, text, maxLength, blocklist, existing }){
  const clean = String(text).trim().replace(/\s+/g, " ");
  if (!clean) throw new Error("Type something first.");
  if (clean.length > maxLength) throw new Error(`Keep it under ${maxLength} characters.`);

  const low = clean.toLowerCase();
  if ((blocklist || []).some(w => w && low.includes(String(w).toLowerCase())))
    throw new Error("That one didn't make it through the filter.");

  const norm = normalise(clean);
  if ((existing || []).some(e => normalise(e.text) === norm))
    throw new Error("Someone already said that one.");

  await fbdb.set(fbdb.ref(db, `captionGame/submissions/${roundId}/${name}`),
                 { text: clean, at: Date.now() });
}

/* ---------- writing: host ---------- */

export async function openRound({ image, seconds }){
  const roundId = "r" + Date.now();
  await fbdb.set(fbdb.ref(db, "captionGame/current"), {
    roundId, image,
    phase: "submitting",
    endsAt: Date.now() + seconds * 1000
  });
  return roundId;
}

export async function closeRound(round){
  await fbdb.update(fbdb.ref(db, "captionGame/current"), { phase: "closed" });
}

/** Pick N at random from the pool and show them to everyone. */
export async function drawFinalists(round, pool, count){
  const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  await fbdb.update(fbdb.ref(db, "captionGame/current"), {
    phase: "judging",
    finalists: picked.map(p => ({ name: p.name, text: p.text }))
  });
  return picked;
}

export async function setWinner(round, finalist){
  await fbdb.update(fbdb.ref(db, "captionGame/current"), {
    phase: "winner",
    winner: { name: finalist.name, text: finalist.text }
  });
}

export async function resetGame(){
  await fbdb.set(fbdb.ref(db, "captionGame/current"), { phase: "idle" });
}
