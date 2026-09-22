/* ============================================================
   shared/config.js

   The only file you edit by hand. Game updates never replace it.
   ============================================================ */

/* ---- 1. Firebase -------------------------------------------------------
   Firebase console -> Project settings -> General -> Your apps -> SDK setup.
   Filled in from the tournament admin — same project. These are safe to be public;
   the database rules are what protect your data.                                      */
export const FIREBASE = {
  apiKey:            "AIzaSyAdx6UIx2mHwqbK4KPKnXolbgmUcCR1Wvg",
  authDomain:        "lobby-claim.firebaseapp.com",
  databaseURL:       "https://lobby-claim-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "lobby-claim",
  storageBucket:     "lobby-claim.firebasestorage.app",
  messagingSenderId: "41913061647",
  appId:             "1:41913061647:web:4eac52a2ddbb5ec2696e7a"
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

  sequence: {
    /* Level 30 = win. */
    maxLevel: 30,
    /* true  = each level repeats the same sequence plus one new leaf (standard)
       false = a brand-new random sequence every level (harder) */
    extend: true,
    /* How long each leaf stays lit, and the pause between leaves, in ms. */
    flashMs: 450,
    gapMs: 180,
    title: "Before your walk",
    steps: [
      "Click Start.",
      "Watch the leaves light up, then click them in the same order.",
      "Each round adds one more leaf. Make it to 30 to finish the walk."
    ]
  },

  typing: {
    title: "Before you race",
    steps: [
      "Pick a level: Easy, Medium or Hard.",
      "Type the passage exactly as shown. Mistakes turn red and must be fixed before you finish.",
      "The clock starts on your first key. Your words per minute go on that level's leaderboard."
    ],
    /* One random passage per race. Add more lines to any level for variety. */
    levels: {
      easy: {
        label: "Easy",
        passages: [
          "The sun was hot and the sand was soft at the beach. We swam in the blue sea and ate cold fruit in the shade of a tree. A kangaroo hopped past the car park as the sun went down.",
          "At the zoo we saw a sleepy koala up in a gum tree. It held on with strong claws and chewed a leaf slowly. Next to it a wombat dug a hole in the dirt while kids watched and laughed.",
          "Our family drove for hours on a red road in the outback. There were no shops and no towns for miles. At night the sky was full of bright stars and we could hear a dingo howl in the dark."
        ]
      },
      medium: {
        label: "Medium",
        passages: [
          "We rocked up to the servo this arvo to grab a cold drink and a pie for the road. Dazza reckons the esky is full of snags for the barbie, so no worries there. Chuck on your thongs and sunnies, mate, because the beach will be heaps busy by three.",
          "Brekkie was avo on toast and a flat white at the little cafe down the road. Shaz was stoked because the footy was on tonight and her team was finally winning. After that we stopped at the bottle-o, filled the ute with firewood and headed off for a long weekend.",
          "The tradie showed up late, carrying a cuppa and a sausage roll from the bakery. He reckoned the job would be a piece of cake, but by lunchtime the whole kitchen was a mess. Fair dinkum, it was a total shambles, although nobody could stay cranky at him for long."
        ]
      },
      hard: {
        label: "Hard",
        passages: [
          "Strewth, the campsite beside the billabong was absolutely chockablock by Saturday, crammed with larrikins, exhausted tradies and one spectacularly unprepared bogan who'd forgotten every tent peg. Despite the oppressive humidity and relentless mozzies, everyone agreed it was a ripper of a weekend, although nobody could adequately explain why the drongo insisted on wearing budgie smugglers to the pub for dinner.",
          "Melbourne's notoriously unpredictable weather delivered four seasons in one day: blistering sunshine at breakfast, a ferocious hailstorm by lunchtime and bone-chilling wind throughout the evening. Unperturbed, the locals grabbed a cardigan, found a laneway cafe and ordered another coffee. She'll be right, they reckoned, ignoring the ominous thunderclouds over the bay while the tourists scrambled for shelter under an awning.",
          "After an exhausting fortnight working on a remote cattle station, Bazza was flat out like a lizard drinking and desperately needed a holiday. Unfortunately, his dilapidated ute carked it halfway to Darwin, leaving him stranded beside a corrugated dirt road with nothing but a stubby holder, a battered swag and an extraordinarily curious emu that refused to leave him alone."
        ]
      }
    }
  },

  wordwlw: {
    guesses: 6,
    title: "How to play",
    steps: [
      "Guess the 5-letter word in 6 tries.",
      "Green = right letter, right spot. Yellow = in the word, wrong spot. Grey = not in the word.",
      "Win or lose, hit New word to roll another one."
    ],
    /* Every answer must be exactly 5 letters. Anything else is skipped automatically.
       ("couple" was left out — it has 6.) */
    words: [
      "queer", "femme", "women", "pride", "girls", "dykes", "butch", "honey",
      "babes", "chats", "carol", "video", "emote", "gifts", "vlogs", "audio",
      "clips", "setup", "views", "badge", "amber", "wives", "miami", "beers",
      "uhaul"
    ]
  },

  bingo: {
    /* Change this (e.g. "subathon-2027") to give everyone a fresh, empty card.
       Old cards stay saved under the old name. */
    cardId: "subathon-2026",
    title: "Subathon Bingo",
    steps: [
      "Spot something from a square on stream? Click it to cross it off.",
      "Clicked by mistake? Click again to undo.",
      "Your card is saved to your Twitch name, so it's still there after you reload, close the tab or log in on another device."
    ],
    /* 24 squares, read left to right, top to bottom. The middle is the free space.
         1   2   3   4   5
         6   7   8   9  10
        11  12  **  13  14
        15  16  17  18  19
        20  21  22  23  24
       Leave a square as "" and it shows its number on the card. */
    squares: [
      /*  1 */ "",
      /*  2 */ "",
      /*  3 */ "",
      /*  4 */ "",
      /*  5 */ "",
      /*  6 */ "",
      /*  7 */ "",
      /*  8 */ "",
      /*  9 */ "",
      /* 10 */ "",
      /* 11 */ "",
      /* 12 */ "",
      /* 13 */ "",
      /* 14 */ "",
      /* 15 */ "",
      /* 16 */ "",
      /* 17 */ "",
      /* 18 */ "",
      /* 19 */ "",
      /* 20 */ "",
      /* 21 */ "",
      /* 22 */ "",
      /* 23 */ "",
      /* 24 */ ""
    ]
  },

  caption: {
    /* Images live in games/caption/images/ and are shown IN THIS ORDER.
       The first one is the example round; the rest are Round 1, Round 2, ... */
    images: [
      "01.png", "02.png", "03.png", "04.png", "05.png",
      "06.png", "07.png", "08.png", "09.png", "10.png"
    ],
    /* Shown under the typing box during the example round. */
    exampleCaption: "When I hear someone is ordering McDonalds",

    submitSeconds: 30,      // typing time once you press START
    finalists: 8,           // answers shown on screen
    maxLength: 100,         // longest caption allowed

    /* ---- automatic picking ---- */
    similarity: 0.60,       // 60%+ alike = the same joke, only the first one counts
    minScore: 60,           // answers below this are only used if there aren't 8 better ones
    minWords: 3,            // anything shorter is dropped

    /* Whole words only (plurals included) — "ring" blocks "rings" but not "bring". */
    blocklist: [
      "nigga", "nigger", "ex", "lag", "lagging", "trump", "israel",
      "palestine", "engagement", "ring", "birthday", "gift"
    ],
    /* These are also caught when disguised: n1gga, n i g g a, n.i.g.g.a ... */
    slurs: [ "nigga", "nigger" ]
  }


};
