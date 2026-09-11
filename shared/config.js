/* ============================================================
   shared/config.js

   Fill this in ONCE. Nothing else on the site holds these values,
   so replacing a game file can never wipe them again.
   ============================================================ */

/* Firebase console -> Project settings -> General -> Your apps -> SDK setup.
   Copy the whole firebaseConfig object over the one below. */
export const FIREBASE = {
  apiKey:            "",
  authDomain:        "",
  databaseURL:       "https://lobby-claim-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "",
  storageBucket:     "",
  messagingSenderId: "",
  appId:             ""
};

/* The localStorage key your Twitch login writes the user to.
   To find it: log in on the live site, open DevTools console,
   run  Object.keys(localStorage)  and use whichever key holds the user. */
export const USER_KEY = "twitchUser";

/* ============================================================
   GAME COPY
   Edit freely — this file is never replaced when a game updates.
   ============================================================ */

/* Reaction Speed result tiers.
   "max" is the highest average (in ms) that still falls in that tier.
   Order matters: fastest first, and the last one must stay Infinity. */
export const REACTION_TIERS = [
  { max: 220,      title: "WOW!",   body: "Damn, you're fast, congrats!" },
  { max: 300,      title: "OK",     body: "You did fine, you're right in the middle!" },
  { max: Infinity, title: "EHM...", body: "So slow... I would just go again." }
];

/* Shown when someone clicks before the sign appears, or under FLOOR ms
   after it. That round is voided and replayed. */
export const REACTION_VOID = {
  title: "Too fast!",
  early: "The sign wasn't up yet — that round doesn't count.",
  floor: "Nobody reacts that quickly — that round doesn't count."
};
