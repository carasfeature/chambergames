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
  // reaction: average of 5 rounds, in ms
  reaction: { min: 100,  max: 5000,   order: "asc"  },
  // aim: total time to clear all 20 targets, in ms (roughly 8-25s in practice)
  aim:      { min: 3000, max: 300000, order: "asc"  },
  // sequence: highest level reached
  sequence: { min: 1,    max: 100,    order: "desc" },
  // caption: number of rounds won
  caption:  { min: 1,    max: 1000,   order: "desc" },
  // typing: words per minute, one leaderboard per level
  typing_easy:   { min: 5, max: 250, order: "desc" },
  typing_medium: { min: 5, max: 250, order: "desc" },
  typing_hard:   { min: 5, max: 250, order: "desc" }
};

/** Twitch names are a-z 0-9 _ only, so they're already safe as database keys. */
export const cleanName = n => String(n).trim().replace(/[^a-zA-Z0-9_]/g, "").slice(0, 25);

export function initLeaderboard(config){
  if (db) return Promise.resolve();
  if (boot) return boot;
  boot = (async () => {
    if (!config?.databaseURL) throw new Error("Firebase config is missing databaseURL");
    const [appMod, dbMod] = await Promise.all([
      import(CDN + "firebase-app.js"),
      import(CDN + "firebase-database.js")
    ]);
    fbdb = dbMod;
    const app = appMod.getApps().find(a => a.name === "site") || appMod.initializeApp(config, "site");
    db = dbMod.getDatabase(app);
  })().catch(error => {
    boot = null;
    throw error;
  });
  return boot;
}

export const isReady = () => !!db;

/**
 * Live top scores. Returns an unsubscribe function.
 *
 * Deliberately does NOT use orderByChild/limitTo. A plain read of the node
 * avoids needing an .indexOn rule and avoids Firebase's stricter permission
 * checks on queried reads — both of which fail silently and are painful to
 * debug. Sorting a few hundred rows in JS costs nothing.
 */
export function watchBoard({ game, limit = 20, player = null, onData, onError }){
  if (!db) throw new Error("initLeaderboard() must finish first");
  const order = RANGES[game]?.order ?? "asc";

  return fbdb.onValue(fbdb.ref(db, `leaderboards/${game}`), snap => {
    const rows = [];
    snap.forEach(c => {
      const v = c.val();
      if (v && typeof v.score === "number") rows.push({ name: c.key, ...v });
    });
    rows.sort((a, b) => {
      const scoreDifference = order === "asc" ? a.score - b.score : b.score - a.score;
      return scoreDifference || a.name.localeCompare(b.name);
    });
    const playerKey = cleanName(player || "").toLowerCase();
    const playerIndex = playerKey
      ? rows.findIndex(row => row.name.toLowerCase() === playerKey)
      : -1;
    const playerRank = playerIndex < 0 ? null : { ...rows[playerIndex], rank: playerIndex + 1 };
    onData(rows.slice(0, limit), playerRank);
  }, err => {
    console.error(`[leaderboard] read failed on leaderboards/${game}:`, err);
    onError?.(err);
  });
}

/** Keep a live board subscribed across temporary Firebase startup/read failures. */
export function watchBoardWithRetry({ config, onStatus, ...options }){
  let stopped = false, unsubscribe = null, retryTimer = null, delay = 1000;
  let resolveReady, readyResolved = false;
  const ready = new Promise(resolve => { resolveReady = resolve; });

  const retry = error => {
    unsubscribe?.();
    unsubscribe = null;
    options.onError?.(error);
    if (stopped || retryTimer) return;
    onStatus?.("retrying", error);
    retryTimer = setTimeout(() => {
      retryTimer = null;
      connect();
    }, delay);
    delay = Math.min(delay * 2, 30000);
  };

  const connect = async () => {
    if (stopped) return;
    onStatus?.("connecting");
    try{
      await initLeaderboard(config);
      if (stopped) return;
      unsubscribe = watchBoard({
        ...options,
        onData: (...args) => {
          delay = 1000;
          options.onData?.(...args);
          onStatus?.("connected");
          if (!readyResolved){ readyResolved = true; resolveReady(); }
        },
        onError: retry
      });
    }catch(error){
      retry(error);
    }
  };

  connect();
  return {
    ready,
    stop(){
      stopped = true;
      clearTimeout(retryTimer);
      unsubscribe?.();
      unsubscribe = null;
    }
  };
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
      ? undefined
      : { score, extra: extra || null, updatedAt: fbdb.serverTimestamp() }
  );
  const kept = res.snapshot.val();
  return { saved: res.committed, kept };
}

/** Add to a running total (used for win counts rather than best-score games). */
export async function bumpScore({ game, name, by = 1 }){
  if (!db) throw new Error("Leaderboard isn't connected");
  const key = cleanName(name);
  if (!key) throw new Error("No Twitch name to save under");
  const res = await fbdb.runTransaction(
    fbdb.ref(db, `leaderboards/${game}/${key}`),
    cur => ({ score: ((cur && cur.score) || 0) + by, updatedAt: fbdb.serverTimestamp() })
  );
  return res.snapshot.val();
}
