/* ============================================================
   shared/config.js

   The only file you edit by hand. Game updates never replace it.
   ============================================================ */

/* ---- 1. Firebase -------------------------------------------------------
   Firebase console -> Project settings -> General -> Your apps -> SDK setup.
   Paste your seven values in here.                                      */
export const FIREBASE = {
  apiKey:            "",
  authDomain:        "",
  databaseURL:       "https://lobby-claim-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "",
  storageBucket:     "",
  messagingSenderId: "",
  appId:             ""
};

/* ---- 2. Where the Twitch login stores the user ------------------------ */
export const USER_KEY = "twitchUser";

/* ---- 3. Every game's settings and copy --------------------------------
   One block per game. The block name (reaction, aim, ...) is also the
   folder name and the database node name, so it can never clash.
   To add a game later, add a new block down here.                       */
export const GAMES = {

  reaction: {
    /* "max" is the slowest average that still counts as that tier.
       Fastest first. The last one must stay Infinity. */
    tiers: [
      { max: 220,      title: "WOW!",   body: "Damn, you're fast, congrats!" },
      { max: 300,      title: "OK",     body: "You did fine, you're right in the middle!" },
      { max: Infinity, title: "EHM...", body: "So slow... I would just go again." }
    ],
    /* Shown when someone clicks before the sign appears. */
    voided: {
      title: "Too fast!",
      early: "The sign wasn't up yet — that round doesn't count.",
      floor: "Nobody reacts that quickly — that round doesn't count."
    }
  },

  aim: {
    targets: 20,
    title: "Before you order",
    steps: [
      "Click Start.",
      "Click pizza slices as quickly as you can. There are 20, showing up one by one.",
      "When you finish, the time it took to click all 20 targets will be shown."
    ]
  },

  caption: {
    /* Seconds people get to type a caption once the image appears. */
    submitSeconds: 30,
    /* How many random captions get drawn for the streamer to choose from. */
    finalists: 5,
    /* Longest caption allowed, in characters. */
    maxLength: 100,

    /* Your image pack. Upload the files to games/caption/images/
       and list the filenames here. */
    images: [
      "01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.jpg",
      "06.jpg", "07.jpg", "08.jpg", "09.jpg", "10.jpg"
    ],

    /* Submissions containing any of these words are silently rejected.
       Add slurs and anything you never want on the overlay. Case is ignored.
       Fill this in before going live with an audience. */
    blocklist: []
  }

};
