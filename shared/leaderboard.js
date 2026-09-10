/* ============================================================
   shared/leaderboard.js
   One leaderboard for every game on the site.

     import { initLeaderboard, watchBoard, submitScore } from "../shared/leaderboard.js";
     await initLeaderboard(FIREBASE_CONFIG);
     watchBoard({ game:"reaction", onData: rows => ... });
     await submitScore({ game:"reaction", name:"caroline", score:284 });

   Data lives at  leaderboards/<game>/<twitch-name>
   ============================================================ */

const CDN = "https://www.gstatic.com/firebasejs/10.12.0/";

let fbdb = null, db = null, boot = null;

/** Lowest-wins for timing games, highest-wins for sequence memory. */
export const RANGES = {
  reaction: { min: 100, max: 5000, order: "asc"  },
  aim:      { min: 100, max: 5000, order: "asc"  },
  sequence: { min: 1,   max: 100,  order: "desc" }
};

/** Twitch names are a-z 0-9 _ only, so they're already safe as database keys. */
export const cleanName = n => String(n).trim().replace(/[^a-zA-Z0-9_]/g, "").slice(0, 25);

export function initLeaderboard(config){
  if (boot) return boot;
  boot = (async () => {
    if (!config?.databaseURL) throw new Error("Firebase config is missing databaseURL");
    const [appMod, dbMod] = await Promise.all([
      import(CDN + "firebase-app.js"),
      import(CDN + "firebase-database.js")
    ]);
    fbdb = dbMod;
    db = dbMod.getDatabase(appMod.initializeApp(config, "site"));
  })();
  return boot;
}

export const isReady = () => !!db;

/** Live top scores. Returns an unsubscribe function. */
export function watchBoard({ game, limit = 10, onData, onError }){
  if (!db) throw new Error("initLeaderboard() must finish first");
  const order = RANGES[game]?.order ?? "asc";
  const base = fbdb.ref(db, `leaderboards/${game}`);
  const q = order === "asc"
    ? fbdb.query(base, fbdb.orderByChild("score"), fbdb.limitToFirst(limit))
    : fbdb.query(base, fbdb.orderByChild("score"), fbdb.limitToLast(limit));

  return fbdb.onValue(q, snap => {
    const rows = [];
    snap.forEach(c => rows.push({ name: c.key, ...c.val() }));
    rows.sort((a, b) => order === "asc" ? a.score - b.score : b.score - a.score);
    onData(rows);
  }, err => onError?.(err));
}

/** Write a score, keeping whichever run is better. → { saved, kept } */
export async function submitScore({ game, name, score, extra = null }){
  if (!db) throw new Error("Leaderboard isn't connected");
  const cfg = RANGES[game];
  const key = cleanName(name);
  if (!key) throw new Error("No Twitch name to save under");
  if (cfg && (score < cfg.min || score > cfg.max))
    throw new Error(`${score} is outside the range this leaderboard accepts`);

  const asc = (cfg?.order ?? "asc") === "asc";
  const res = await fbdb.runTransaction(
    fbdb.ref(db, `leaderboards/${game}/${key}`),
    cur => (cur && (asc ? cur.score <= score : cur.score >= score))
      ? cur
      : { score, extra: extra || null, updatedAt: Date.now() }
  );
  const kept = res.snapshot.val();
  return { saved: kept.score === score, kept };
}
