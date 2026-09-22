/* ============================================================
   shared/caption.js — the Caption This engine
   Used by games/caption/index.html (viewers) and admin.html (you).

   Database:
     captionGame/current                      the round everyone is watching
     captionGame/submissions/<roundId>/<name> { text, display, at }
   ============================================================ */

const CDN = "https://www.gstatic.com/firebasejs/10.12.0/";
let appMod, fbdb, db, app, boot = null, offset = 0;

export function initCaption(config){
  if (boot) return boot;
  boot = (async () => {
    if (!config?.databaseURL) throw new Error("Firebase config is missing databaseURL");
    [appMod, fbdb] = await Promise.all([ import(CDN+"firebase-app.js"), import(CDN+"firebase-database.js") ]);
    // own app name: other shared modules register their own, Firebase refuses duplicates
    app = appMod.getApps().find(a => a.name === "caption") || appMod.initializeApp(config, "caption");
    db  = fbdb.getDatabase(app);
    // server clock correction, so everyone's countdown agrees
    fbdb.onValue(fbdb.ref(db, ".info/serverTimeOffset"), s => { offset = s.val() || 0; });
  })();
  return boot;
}
export const serverNow = () => Date.now() + offset;

/* ---------- admin login (email + password, same as the tournament admin) ---------- */
let authMod = null, auth = null;
async function getAuthApi(){
  if (!auth){ authMod = await import(CDN+"firebase-auth.js"); auth = authMod.getAuth(app); }
  return authMod;
}
export async function onAdmin(cb){ const a = await getAuthApi(); return a.onAuthStateChanged(auth, cb); }
export async function adminSignIn(email, password){ const a = await getAuthApi(); return a.signInWithEmailAndPassword(auth, email, password); }
export async function adminSignOut(){ const a = await getAuthApi(); return a.signOut(auth); }

/* ---------- reading ---------- */
export function watchRound(onChange, onError){
  return fbdb.onValue(fbdb.ref(db, "captionGame/current"),
    s => onChange(s.val() || { phase: "idle" }), e => onError?.(e));
}
/** captionGame/winners/{round} -> display name of whoever won that round. */
export function watchWinners(onChange, onError){
  return fbdb.onValue(fbdb.ref(db, "captionGame/winners"),
    s => onChange(s.val() || {}), e => onError?.(e));
}
export function watchSubmissions(roundId, onChange, onError){
  return fbdb.onValue(fbdb.ref(db, `captionGame/submissions/${roundId}`), s => {
    const out = []; s.forEach(c => { out.push({ name: c.key, ...c.val() }); }); onChange(out);
  }, e => onError?.(e));
}

/* ============================================================
   JUNK FILTER — returns a reason string, or null if it's fine
   ============================================================ */
const deLeet = t => t.toLowerCase()
  .replace(/[1!|]/g,"i").replace(/3/g,"e").replace(/[4@]/g,"a").replace(/0/g,"o").replace(/\$/g,"s");
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function junkReason(text, cfg){
  const t = String(text||"").trim();
  if (!t) return "empty";
  if (t.length > cfg.maxLength) return "too long";
  if (/(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|gg|tv|ly|io|co|me|app|xyz)\b)/i.test(t)) return "link";
  if (!/[a-z]/i.test(t)) return "emoji";
  const words = t.toLowerCase().match(/[a-z0-9']+/g) || [];
  if (words.length < cfg.minWords) return "short";
  // blocklist: whole words, plus plurals / possessives
  const w = deLeet(t).replace(/[^a-z ]/g," ").split(/\s+/).filter(Boolean);
  for (const b of cfg.blocklist || []){
    const re = new RegExp(`^${esc(String(b).toLowerCase())}(s|es|'s)?$`);
    if (w.some(x => re.test(x))) return "blocked";
  }
  // slurs: also caught spaced out or disguised (n i g g a, n.1.g.g.a)
  const squashed = deLeet(t).replace(/[^a-z]/g,"");
  for (const s of cfg.slurs || []) if (squashed.includes(String(s).toLowerCase())) return "blocked";
  return null;
}
/* what the viewer is told — never says which word was blocked */
export const junkMessage = r => ({
  short:"Needs at least 3 words.", emoji:"Use words, not just emojis.", link:"No links, sorry.",
  blocked:"That one can't be used — try another.", "too long":"That's too long.", empty:"Type something first."
}[r] || "That one can't be used.");

/* ============================================================
   AUTOMATIC PICKING — junk out, same jokes grouped, scored, 8 drawn
   ============================================================ */
const FILLER = new Set(["lol","lmao","xd","haha","omg","lmfao"]);
const NEG = /\b(don t|dont|not|never|no|isn t|isnt|can t|cant|won t|wont|didn t|didnt|doesn t|doesnt)\b/;
export const normalise = t => String(t).toLowerCase().replace(/[^a-z0-9 ]/g," ")
  .split(/\s+/).filter(w => w && !FILLER.has(w)).join(" ");
const chunks = t => { const s=" "+t+" ", c=new Set(); for(let i=0;i<s.length-2;i++) c.add(s.slice(i,i+3)); return c; };
export function similarity(a, b){
  const A = chunks(a), B = chunks(b); let n = 0;
  for (const x of A) if (B.has(x)) n++;
  return (A.size + B.size) ? 2*n/(A.size + B.size) : 0;
}
const sameJoke = (a, b, cfg) => similarity(a, b) >= cfg.similarity && NEG.test(a) === NEG.test(b);

function scoreGroup(g, cfg){
  const raw = g.first.text, words = g.first.norm.split(" ").length;
  let s = 100;
  s -= g.others.length * 12;                                  // obvious joke lots of people had
  if (words < 4) s -= 15;
  if (words > 15) s -= (words - 15) * 4;                      // sweet spot 4-15 words
  if (/(.)\1{3,}/i.test(raw)) s -= 20;                        // "hahahaha", "!!!!!"
  const letters = raw.replace(/[^A-Za-z]/g,"");
  if (letters.length > 8 && letters === letters.toUpperCase()) s -= 15;   // SHOUTING
  if (cfg.exampleCaption && similarity(g.first.norm, normalise(cfg.exampleCaption)) >= 0.5) s -= 40;
  return s;
}

/** entries: [{name, display, text, at}]  ->  { finalists, stats, groups } */
export function pickFinalists(entries, cfg, rand = Math.random){
  const sorted = [...entries].sort((a,b) => (a.at||0) - (b.at||0));   // first to submit wins ties
  let junk = 0; const clean = [];
  for (const e of sorted){
    if (junkReason(e.text, cfg)) { junk++; continue; }
    clean.push({ ...e, norm: normalise(e.text) });
  }
  const groups = [];
  for (const e of clean){
    const g = groups.find(g => sameJoke(e.norm, g.first.norm, cfg));
    g ? g.others.push(e.name) : groups.push({ first: e, others: [] });
  }
  for (const g of groups) g.score = scoreGroup(g, cfg);
  groups.sort((a,b) => b.score - a.score);

  let pool = groups.filter(g => g.score >= cfg.minScore).slice(0, cfg.finalists * 2);
  if (pool.length < cfg.finalists) pool = groups.slice(0, Math.max(cfg.finalists, pool.length));
  const shuffled = pool.map(g => [rand(), g]).sort((a,b) => a[0]-b[0]).map(x => x[1]);
  const finalists = shuffled.slice(0, cfg.finalists).map(g => ({
    name: g.first.name, display: g.first.display || g.first.name, text: g.first.text, also: g.others.length
  }));
  return { finalists, groups, stats: { entries: entries.length, junk, unique: groups.length } };
}

/* ============================================================
   VIEWER
   ============================================================ */
export async function submitCaption({ round, name, display, text, cfg }){
  const r = junkReason(text, cfg);
  if (r) throw new Error(junkMessage(r));
  if (round.phase !== "submitting" || serverNow() > round.endsAt) throw new Error("Too late — time's up.");
  const clean = String(text).trim().replace(/\s+/g," ");
  try{
    await fbdb.set(fbdb.ref(db, `captionGame/submissions/${round.roundId}/${name}`),
                   { text: clean, display: String(display||name).slice(0,25), at: fbdb.serverTimestamp() });
  }catch(e){
    if (/permission/i.test(e.message||"")) throw new Error("You've already sent one this round.");
    throw e;
  }
}

/* ============================================================
   ADMIN — each step of the show
   ============================================================ */
const cur = () => fbdb.ref(db, "captionGame/current");
const roundOf = i => i >= 1 ? i : null;              // image 0 = example, 1 = Round 1 ...

/** Reads whatever round is on screen right now, so moving on can reveal it. */
async function readCurrent(){
  return new Promise((res, rej) => {
    let off;                                  // declared before use — onValue can fire synchronously
    off = fbdb.onValue(cur(), s => { off?.(); res(s.val() || {}); }, rej);
  });
}

export async function showImage(index, cfg){
  const leaving = await readCurrent();               // the round we're moving away from
  const example = index === 0;
  await fbdb.set(cur(), {
    phase: example ? "example" : "ready",
    index, image: cfg.images[index], round: roundOf(index),
    roundId: example ? null : "r" + Date.now() + "_" + index
  });
  // whatever round was just left behind becomes visible on the winners list —
  // stored as its own counter so it survives idle/reset states cleanly
  if (leaving.round){
    await fbdb.runTransaction(fbdb.ref(db, "captionGame/revealed"),
      n => Math.max(n || 0, leaving.round));
  }
}
/** Round r's winner is safe to show once the game has moved past it. */
export function watchRevealed(onChange, onError){
  return fbdb.onValue(fbdb.ref(db, "captionGame/revealed"),
    s => onChange(s.val() || 0), e => onError?.(e));
}
export function startRound(round, cfg){
  return fbdb.update(cur(), { phase: "submitting", endsAt: serverNow() + cfg.submitSeconds*1000 });
}
export async function closeAndPick(round, entries, cfg){
  const { finalists, stats } = pickFinalists(entries, cfg);
  await fbdb.update(cur(), { phase: "judging", finalists, stats });
  return { finalists, stats };
}
export async function crownWinner(finalist, round){
  await fbdb.update(cur(), { phase: "winner",
    winner: { name: finalist.name, display: finalist.display, text: finalist.text } });
  if (round?.round) await fbdb.set(fbdb.ref(db, `captionGame/winners/${round.round}`), finalist.display || finalist.name);
}
export function resetGame(){ return fbdb.set(cur(), { phase: "idle" }); }
/** Wipes the Round 1-9 winners board too — a fresh subathon, not just the current round. */
export function resetWinners(){
  return Promise.all([
    fbdb.set(fbdb.ref(db, "captionGame/winners"), null),
    fbdb.set(fbdb.ref(db, "captionGame/revealed"), null)
  ]);
}
