import * as THREE from "three";
const game = document.getElementById("game");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const winScreen = document.getElementById("winScreen");
const startBtn = document.getElementById("startBtn");

const loraxedDesktopOnly =
  window.matchMedia("(pointer: coarse)").matches ||
  window.matchMedia("(hover: none)").matches ||
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

if (loraxedDesktopOnly) {
  const desktopOnlyScreen = document.createElement("section");
  desktopOnlyScreen.id = "desktopOnlyScreen";
  desktopOnlyScreen.className = "screen";
  desktopOnlyScreen.innerHTML = `
    <div class="panel desktop-only-panel">
      <div class="eyebrow">CHAMBER: LORAXED</div>
      <h1>DESKTOP ONLY</h1>
      <p>THIS GAME REQUIRES A KEYBOARD &amp; MOUSE.</p>
      <small>COME BACK ON A COMPUTER TO PLAY.</small>
    </div>
  `;

  const desktopOnlyStyle = document.createElement("style");
  desktopOnlyStyle.textContent = `
    #desktopOnlyScreen{
      position:absolute;
      inset:0;
      z-index:9999;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#000;
      text-align:center;
    }
    #desktopOnlyScreen .desktop-only-panel{
      width:min(620px,90vw);
      padding:32px 24px;
    }
    #desktopOnlyScreen h1{
      margin:8px 0 18px;
      color:#c58a27;
      font-family:"Gruesome",sans-serif;
      font-size:clamp(48px,10vw,100px);
      letter-spacing:4px;
    }
    #desktopOnlyScreen p{
      margin:0 0 12px;
      font-family:monospace;
      font-size:14px;
      letter-spacing:3px;
      color:#eee;
    }
    #desktopOnlyScreen small{
      display:block;
      font-family:monospace;
      font-size:10px;
      letter-spacing:2px;
      color:rgba(255,255,255,.5);
    }
  `;

  document.head.appendChild(desktopOnlyStyle);
  game.appendChild(desktopOnlyScreen);
}

const retryBtn = document.getElementById("retryBtn");
const timerEl = document.getElementById("timer");
const finalTimeEl = document.getElementById("finalTime");
const winTimeEl = document.getElementById("winTime");
const playAgainBtn = document.getElementById("playAgainBtn");
const tryHardBtn = document.createElement("button");
tryHardBtn.id = "tryHardBtn";
tryHardBtn.type = "button";
tryHardBtn.textContent = "TRY HARD MODE";

const winMenuBtn = document.createElement("button");
winMenuBtn.id = "winMenuBtn";
winMenuBtn.type = "button";
winMenuBtn.textContent = "MAIN MENU";

playAgainBtn.insertAdjacentElement("afterend", tryHardBtn);
tryHardBtn.insertAdjacentElement("afterend", winMenuBtn);
const hud = document.getElementById("hud");
const crosshair = document.getElementById("crosshair");
const sprintFill = document.getElementById("sprintFill");
const lockMessage = document.getElementById("lockMessage");
const dangerEl = document.getElementById("danger");
const tutorialScreen = document.getElementById("tutorialScreen");
const tutorialStartBtn = document.getElementById("tutorialStartBtn");
// ===== REAL GAME LOADING SCREEN =====

const loadingScreen = document.createElement("section");
loadingScreen.id = "loadingScreen";
loadingScreen.className = "screen hidden";

loadingScreen.innerHTML = `
  <div class="loraxed-loading">
    <h1>ENTERING THE MAZE...</h1>

    <div class="loading-track">
      <div id="loadingFill"></div>
    </div>

    <div id="loadingPercent">0%</div>

    <div class="loading-warning">
      DON'T LET THEM CATCH YOU.
    </div>

    <button id="loadingRetryBtn" class="hidden" type="button">
      RETRY
    </button>
  </div>
`;

game.appendChild(loadingScreen);

const loadingStyle = document.createElement("style");

loadingStyle.textContent = `
#loadingScreen{
  position:absolute;
  inset:0;
  z-index:9998;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#000;
}

#loadingScreen.hidden{
  display:none;
}

.loraxed-loading{
  width:min(620px,82vw);
  text-align:center;
}

.loraxed-loading h1{
  margin:0 0 38px;
  color:#c58a27;
  font-family:"Gruesome",sans-serif;
  font-size:clamp(42px,7vw,82px);
  letter-spacing:6px;
  font-weight:normal;
}

.loading-track{
  width:100%;
  height:5px;
  background:rgba(197,138,39,.16);
  border:1px solid rgba(197,138,39,.38);
  overflow:hidden;
}

#loadingFill{
  width:0%;
  height:100%;
  background:#c58a27;
  transition:width .15s ease;
}

#loadingPercent{
  margin-top:14px;
  color:#c58a27;
  font-family:monospace;
  font-size:12px;
  letter-spacing:4px;
}

.loading-warning{
  margin-top:34px;
  color:rgba(255,255,255,.38);
  font-family:monospace;
  font-size:10px;
  letter-spacing:4px;
}

#loadingRetryBtn{
  margin:28px auto 0;
  min-width:150px;
}

#loadingRetryBtn.hidden{
  display:none;
}
`;

document.head.appendChild(loadingStyle);

const loadingFill =
  loadingScreen.querySelector("#loadingFill");

const loadingPercent =
  loadingScreen.querySelector("#loadingPercent");

const loadingRetryBtn =
  loadingScreen.querySelector("#loadingRetryBtn");


const GAME_ASSETS = [

  // MONSTERS
  "assets/characters/monster.png",
  "assets/characters/monster2.png",

  // ENVIRONMENT
  "assets/environment/door.png",
  "assets/environment/key.png",

  // FLOOR
  "assets/textures/floor/floor_diffuse.jpg",
  "assets/textures/floor/floor_normal.png",
  "assets/textures/floor/floor_roughness.png",

  // CEILING
  "assets/textures/ceiling/ceiling_diffuse.jpg",
  "assets/textures/ceiling/ceiling_normal.png",
  "assets/textures/ceiling/ceiling_roughness.jpg",

  // WALLS
  "assets/textures/wall/wall_diffuse.png",
  "assets/textures/wall/wall_normal.jpg",
  "assets/textures/wall/wall_roughness.jpg",

  // POSTERS
  "assets/posters/poster1.png",
  "assets/posters/poster2.png",
  "assets/posters/poster3.png",
  "assets/posters/poster4.png",
  "assets/posters/poster5.png",
  "assets/posters/poster6.png",
  "assets/posters/poster7.png",
  "assets/posters/poster8.png",
  "assets/posters/poster9.png",
  "assets/posters/poster10.png",
  "assets/posters/poster11.png",
  "assets/posters/poster12.png",
  "assets/posters/poster13.png",
  "assets/posters/poster14.png",
  "assets/posters/poster15.png",
  "assets/posters/poster16.png",

  // SOUNDS CREATED IN GAME.JS
  "assets/sounds/jumpscare.mp3",
  "assets/sounds/door.mp3",
  "assets/sounds/scare.mp3"
];


let gameAssetsLoaded = false;


function updateLoadingProgress(done, total) {

  const percent =
    Math.round((done / total) * 100);

  loadingFill.style.width =
    `${percent}%`;

  loadingPercent.textContent =
    `${percent}%`;
}


function preloadFile(url) {

  return fetch(url, {
    cache: "force-cache"
  }).then(response => {

    if (!response.ok) {
      throw new Error(
        `${url} returned ${response.status}`
      );
    }

    return response.blob();
  });
}


function waitForAudio(audio) {

  return new Promise((resolve, reject) => {

    if (!audio) {
      resolve();
      return;
    }

    if (audio.readyState >= 3) {
      resolve();
      return;
    }

    const loaded = () => {
      cleanup();
      resolve();
    };

    const failed = () => {
      cleanup();
      reject(
        new Error(
          `Audio failed: ${audio.currentSrc || audio.src}`
        )
      );
    };

    const cleanup = () => {
      audio.removeEventListener(
        "canplay",
        loaded
      );

      audio.removeEventListener(
        "error",
        failed
      );
    };

    audio.addEventListener(
      "canplay",
      loaded,
      { once:true }
    );

    audio.addEventListener(
      "error",
      failed,
      { once:true }
    );

    audio.load();
  });
}


async function loadGameAssets() {

  if (gameAssetsLoaded) {
    updateLoadingProgress(1, 1);
    return;
  }

  loadingRetryBtn.classList.add("hidden");

  loadingPercent.textContent = "0%";
  loadingFill.style.width = "0%";

  const tasks = [];


  // Files referenced directly in game.js
  for (const url of GAME_ASSETS) {

    tasks.push(() =>
      preloadFile(url)
    );
  }


  // Audio elements from index.html
  document
    .querySelectorAll("audio")
    .forEach(audio => {

      tasks.push(() =>
        waitForAudio(audio)
      );

    });


  // Wait for the browser fonts too
  if (document.fonts?.ready) {

    tasks.push(() =>
      document.fonts.ready
    );

  }


  let completed = 0;

  updateLoadingProgress(
    completed,
    tasks.length
  );


  await Promise.all(

    tasks.map(async task => {

      await task();

      completed++;

      updateLoadingProgress(
        completed,
        tasks.length
      );

    })

  );


  gameAssetsLoaded = true;

  updateLoadingProgress(1, 1);
}


async function startGameWithLoading() {

  loadingScreen.classList.remove("hidden");

  try {

    await loadGameAssets();

    loadingPercent.textContent = "100%";
    loadingFill.style.width = "100%";

    await new Promise(resolve =>
      setTimeout(resolve, 250)
    );

    loadingScreen.classList.add("hidden");

    beginGame();

  }

  catch (error) {

    console.error(
      "[LORAXED] ASSET LOAD FAILED:",
      error
    );

    loadingPercent.textContent =
      "LOAD FAILED";

    loadingRetryBtn.classList.remove(
      "hidden"
    );

  }
}


loadingRetryBtn.addEventListener(
  "click",
  () => {

    startGameWithLoading();

  }
);

// ===== END REAL GAME LOADING SCREEN =====
const pauseScreen = document.createElement("section");
pauseScreen.id = "pauseScreen";
pauseScreen.className = "screen hidden";
pauseScreen.innerHTML = `
\<div class="panel pause-panel">
\<div class="eyebrow">WHY'D YOU PAUSE?</div>
\<h1>PAUSED\</h1>
\<div class="pause-actions">
\<button id="resumeBtn" type="button">RESUME\</button>
\<button id="restartBtn" type="button">RESTART\</button>
\<button id="mainMenuBtn" type="button">MAIN MENU\</button>
\</div>
\<small>ESC — RESUME\</small>
\</div>
`;
game.appendChild(pauseScreen);
const pauseStyle = document.createElement("style");
pauseStyle.textContent = `
#pauseScreen { background: radial-gradient(circle at center, rgba(12,12,12,.62), rgba(0,0,0,.94)); }
#pauseScreen .pause-panel { width: min(560px, 92vw); padding: 24px; }
#pauseScreen h1 { font-size: clamp(62px, 10vw, 120px); margin: 0 0 28px; letter-spacing: -5px; }
#pauseScreen .eyebrow { margin-bottom: 12px; }
#pauseScreen .pause-actions { display: flex; flex-direction: column; align-items: center; gap: 10px; }
#pauseScreen .pause-actions button { width: 210px; }
#pauseScreen small { margin-top: 22px; }
`;
document.head.appendChild(pauseStyle);
const resumeBtn = pauseScreen.querySelector("#resumeBtn");
const restartBtn = pauseScreen.querySelector("#restartBtn");
const mainMenuBtn = pauseScreen.querySelector("#mainMenuBtn");
const startPanel = startScreen?.querySelector(".panel");
const creditsBtn = document.createElement("button");
creditsBtn.id = "creditsBtn";
creditsBtn.type = "button";
creditsBtn.textContent = "CREDITS";
if (startPanel) {
const madeBy = startPanel.querySelector(".made-by");
if (madeBy) {
madeBy.insertAdjacentElement("beforebegin", creditsBtn);
} else {
startPanel.appendChild(creditsBtn);
}
}
const creditsScreen = document.createElement("section");
creditsScreen.id = "creditsScreen";
creditsScreen.className = "screen hidden";
creditsScreen.innerHTML = `
<div class="panel credits-panel">
<div class="eyebrow">CHAMBER: LORAXED</div>
<h2>CREDITS</h2>
<div class="credit-section">
<div class="credit-title">CREATED BY</div>
<div class="credit-name">KRISPY</div>
</div>
<div class="credit-section">
<div class="credit-title">FEATURING</div>
<div class="credit-name">CHRISTINA &amp; AMBER</div>
</div>
<div class="credit-section">
<div class="credit-title">SPECIAL THANKS</div>
<div class="credit-name">My cat</div>
<div class="credit-name">car0lyke</div>
<div class="credit-name">britt_banana — for all the posters</div>
<div class="credit-name">sweetshay1331 &amp; eloiseed3</div>
<div class="credit-name">Tori416</div>
<div class="credit-name">Sandlook1</div>
<div class="credit-name">bulldawg1319</div>
</div>
<div class="credit-section credit-you">
<div class="credit-title">AND YOU</div>
<div class="credit-name">for playing the game&lt;3</div>
</div>
<button id="creditsBackBtn" type="button">BACK</button>
</div>
`;
game.appendChild(creditsScreen);
const creditsStyle = document.createElement("style");
creditsStyle.textContent = `
#creditsBtn{
display:block;
margin:12px auto 0;
min-width:150px;
}
#creditsScreen{
z-index:98;
background:radial-gradient(circle at center,rgba(14,12,9,.78),rgba(0,0,0,.97));
}
#creditsScreen .credits-panel{
width:min(620px,92vw);
max-height:88vh;
overflow:auto;
text-align:center;
padding:34px 30px;
}
#creditsScreen h2{
font-family:"Gruesome",sans-serif;
margin:7px 0 26px;
color:#c58a27;
letter-spacing:6px;
font-size:clamp(36px,6vw,62px);
}
#creditsScreen .credit-section{
margin:0 0 23px;
}
#creditsScreen .credit-title{
font-family:monospace;
color:#c58a27;
font-size:10px;
letter-spacing:4px;
margin-bottom:8px;
}
#creditsScreen .credit-name{
color:#eee;
font-size:15px;
line-height:1.65;
letter-spacing:1px;
}
#creditsScreen .credit-you{
margin-top:29px;
}
#creditsBackBtn{
min-width:150px;
margin-top:4px;
}
`;
document.head.appendChild(creditsStyle);
const creditsBackBtn = creditsScreen.querySelector("#creditsBackBtn");
creditsBtn.addEventListener("click", () => {
startScreen.classList.add("hidden");
creditsScreen.classList.remove("hidden");
});
creditsBackBtn.addEventListener("click", () => {
creditsScreen.classList.add("hidden");
startScreen.classList.remove("hidden");
});
// ===== LORAXED LEADERBOARD =====
const SUPABASE_REST_URL = "https://sqqmdnamtnszarfdafgo.supabase.co/rest/v1";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_CbAVFAAByPDAbDxBCF1hCg_jG0Tyv_j";
let lastWinTimeMs = null;
let scoreSubmittedForRun = false;

const leaderboardBtn = document.createElement("button");
leaderboardBtn.id = "leaderboardBtn";
leaderboardBtn.type = "button";
leaderboardBtn.textContent = "LEADERBOARD";
if (startPanel) creditsBtn.insertAdjacentElement("beforebegin", leaderboardBtn);

const leaderboardScreen = document.createElement("section");
leaderboardScreen.id = "leaderboardScreen";
leaderboardScreen.className = "screen hidden";
leaderboardScreen.innerHTML = `
<div class="panel leaderboard-panel">
  <div class="eyebrow">CHAMBER: LORAXED</div>
  <h2>LEADERBOARD</h2>
  <div class="leaderboard-tabs">
    <button class="lb-tab active" data-mode="easy" type="button">EASY</button>
    <button class="lb-tab" data-mode="hard" type="button">HARD</button>
  </div>
  <div id="leaderboardStatus">LOADING...</div>
  <div id="leaderboardRows"></div>
  <button id="leaderboardBackBtn" type="button">BACK</button>
</div>`;
game.appendChild(leaderboardScreen);

const leaderboardStyle = document.createElement("style");
leaderboardStyle.textContent = `
#leaderboardBtn{display:block;margin:12px auto 0;min-width:150px}
#leaderboardScreen{z-index:98;background:radial-gradient(circle at center,rgba(14,12,9,.82),rgba(0,0,0,.98))}
#leaderboardScreen .leaderboard-panel{width:min(650px,94vw);max-height:88vh;overflow:auto;text-align:center;padding:30px}
#leaderboardScreen h2{font-family:"Gruesome",sans-serif;margin:7px 0 20px;color:#c58a27;letter-spacing:5px;font-size:clamp(34px,6vw,58px)}
.leaderboard-tabs{display:flex;justify-content:center;gap:10px;margin-bottom:18px}.leaderboard-tabs button{min-width:120px}.leaderboard-tabs .active{color:#c58a27;border-color:#c58a27}
#leaderboardStatus{font-family:monospace;font-size:11px;letter-spacing:2px;color:#888;margin:14px 0}
.lb-row{display:grid;grid-template-columns:52px 1fr auto;gap:12px;align-items:center;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.09);font-family:monospace;text-align:left}
.lb-rank{color:#c58a27}.lb-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#eee}.lb-time{color:#eee;font-variant-numeric:tabular-nums}
#leaderboardBackBtn{min-width:150px;margin-top:22px}
`;
document.head.appendChild(leaderboardStyle);

const leaderboardRows = leaderboardScreen.querySelector("#leaderboardRows");
const leaderboardStatus = leaderboardScreen.querySelector("#leaderboardStatus");
let leaderboardMode = "easy";

function apiHeaders(extra={}) { return { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`, ...extra }; }
function formatLeaderboardTime(ms){
  const min=Math.floor(ms/60000), sec=Math.floor((ms%60000)/1000), milli=Math.floor(ms%1000);
  return `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}.${String(milli).padStart(3,"0")}`;
}
async function loadLeaderboard(mode=leaderboardMode){
  leaderboardMode=mode; leaderboardRows.innerHTML=""; leaderboardStatus.textContent="LOADING...";
  leaderboardScreen.querySelectorAll(".lb-tab").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
  try{
    const url=`${SUPABASE_REST_URL}/loraxed_scores?select=player_name,time_ms,difficulty&difficulty=eq.${encodeURIComponent(mode)}&order=time_ms.asc&limit=1000`;
    const res=await fetch(url,{headers:apiHeaders()});
    if(!res.ok) throw new Error(await res.text());
    const data=await res.json();
    const best=new Map();
    for(const row of data){
      const name=String(row.player_name||"").trim(); const time=Number(row.time_ms);
      if(!name||!Number.isFinite(time)) continue;
      const key=name.toLowerCase(); if(!best.has(key)||time<best.get(key).time_ms) best.set(key,{player_name:name,time_ms:time});
    }
    const rows=[...best.values()].sort((a,b)=>a.time_ms-b.time_ms).slice(0,20);
    leaderboardStatus.textContent=rows.length?`${mode.toUpperCase()} — FASTEST ESCAPES`:"NO ESCAPES YET";
    rows.forEach((row,i)=>{
      const el=document.createElement("div"); el.className="lb-row";
      const rank=document.createElement("span"), name=document.createElement("span"), time=document.createElement("span");
      rank.className="lb-rank"; name.className="lb-name"; time.className="lb-time";
      rank.textContent=`#${i+1}`; name.textContent=row.player_name; time.textContent=formatLeaderboardTime(row.time_ms);
      el.append(rank,name,time); leaderboardRows.appendChild(el);
    });
  }catch(err){ console.error("Leaderboard load failed:",err); leaderboardStatus.textContent="COULDN'T LOAD LEADERBOARD"; }
}
leaderboardBtn.addEventListener("click",()=>{startScreen.classList.add("hidden");leaderboardScreen.classList.remove("hidden");loadLeaderboard("easy");});
leaderboardScreen.querySelector("#leaderboardBackBtn").addEventListener("click",()=>{leaderboardScreen.classList.add("hidden");startScreen.classList.remove("hidden");});
leaderboardScreen.querySelectorAll(".lb-tab").forEach(btn=>btn.addEventListener("click",()=>loadLeaderboard(btn.dataset.mode)));

function getSavedTwitchUser(){
  try{return JSON.parse(localStorage.getItem("twitchUser")||"null");}
  catch{return null;}
}

function getLoraxedPlayer(){
  const user=getSavedTwitchUser();
  if(!user)return null;

  const twitch_login=String(user.login||user.twitch_login||"").trim().toLowerCase();
  const display_name=String(user.display_name||user.displayName||twitch_login).trim();
  const twitch_id=String(user.id||user.twitch_id||twitch_login).trim();

  if(!twitch_id||!twitch_login)return null;
  return {twitch_id,twitch_login,display_name};
}

async function autoSubmitLoraxedScore() {
  if (scoreSubmittedForRun || lastWinTimeMs === null) return;

  const player = getLoraxedPlayer();

  if (!player) {
    console.warn("[loraxed] No saved Twitch user found. Score not sent.");
    return;
  }

  scoreSubmittedForRun = true;

  try {
    const res = await fetch(
      `${SUPABASE_REST_URL}/rpc/submit_loraxed_score`,
      {
        method: "POST",
        headers: apiHeaders({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          p_player_name: player.display_name,
          p_time_ms: Math.round(lastWinTimeMs),
          p_difficulty: gameMode,
          p_twitch_id: player.twitch_id,
          p_twitch_login: player.twitch_login
        })
      }
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    console.log(
      `[loraxed] ${gameMode.toUpperCase()} score checked/saved.`
    );

  } catch (err) {
    scoreSubmittedForRun = false;
    console.error("[loraxed] Score save failed:", err);
  }
}

// ===== END LEADERBOARD =====

const fxLayer = document.createElement("div");
fxLayer.id = "fxLayer";
fxLayer.innerHTML = `
<div id="objectiveCard" class="fx-card hidden">FIND THE DOOR</div>
<div id="escapeFade" class="fx-fade hidden"></div>
<div id="scareFlash" class="fx-flash hidden"></div>
<div id="jumpScare" class="fx-jumpscare hidden"><img src="assets/characters/monster.png" alt=""></div>
`;
game.appendChild(fxLayer);
const fxStyle = document.createElement("style");
fxStyle.textContent = `
#fxLayer{position:absolute;inset:0;z-index:90;pointer-events:none;overflow:hidden}
.fx-card{ font-family:"Gruesome",sans-serif; position:absolute;inset:0;display:flex; align-items:center;justify-content:center;background:#000;color:#c58a27;font-size:clamp(34px,6vw,82px);font-weight:900;letter-spacing:8px;text-align:center}
.fx-fade{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .75s ease}
.fx-fade.active{opacity:1}
.fx-flash{position:absolute;inset:0;background:#000;opacity:.92}
.fx-jumpscare{
position:absolute;
inset:0;
overflow:hidden;
background:#000;
}
.fx-jumpscare img{
position:absolute;
left:50%;
top:50%;
height:100%;
width:auto;
max-width:none;
transform-origin:50% 22%;
animation:loraxFaceSlam .65s cubic-bezier(.12,.8,.18,1) forwards;
}
.fx-jumpscare.shake{
animation:screenShake .055s infinite;
}
@keyframes loraxFaceSlam{
  0%{
    transform:translate(-50%,-50%) scale(.35);
    filter:blur(8px);
  }
  35%{
    transform:translate(-50%,-50%) scale(1.45);
    filter:blur(2px);
  }
  100%{
    transform:translate(-50%,-31%) scale(4.8);
    filter:blur(0);
  }
    
} @keyframes screenShake{0%{transform:translate(0,0)}25%{transform:translate(-10px,7px)}50%{transform:translate(8px,-6px)}75%{transform:translate(-6px,-8px)}100%{transform:translate(7px,6px)}}
`;
document.head.appendChild(fxStyle);
const objectiveCard = document.getElementById("objectiveCard");
const escapeFade = document.getElementById("escapeFade");
const scareFlash = document.getElementById("scareFlash");
const jumpScare = document.getElementById("jumpScare");
const jumpscareAudio = new Audio("assets/sounds/jumpscare.mp3");
const doorAudio = new Audio("assets/sounds/door.mp3");
const scareAudio = new Audio("assets/sounds/scare.mp3");
jumpscareAudio.volume = 0.95;
doorAudio.volume = 0.75;
scareAudio.volume = 0.55;
let endingSequence = false;
let randomScareTimer = 15 + Math.random() * 12;
function resetFX(){
endingSequence = false;
objectiveCard.classList.add("hidden");
escapeFade.classList.add("hidden");
escapeFade.classList.remove("active");
scareFlash.classList.add("hidden");
jumpScare.classList.add("hidden");
jumpScare.classList.remove("shake");
renderer.domElement.style.transform = "";
randomScareTimer = 12 + Math.random() * 16;
}
function triggerRandomScare(){
scareAudio.currentTime = 0;
scareAudio.play().catch(() => {});
scareFlash.classList.remove("hidden");
for (const data of mazeLights) data.light.intensity = 0.02;
setTimeout(() => scareFlash.classList.add("hidden"), 110);
setTimeout(() => { if (running && !paused) for (const data of mazeLights) data.light.intensity = data.baseIntensity; }, 380);
}
const ambienceAudio =
document.getElementById("ambienceAudio");
const monsterAudio =
document.getElementById("monsterAudio");
const breathingAudio =
document.getElementById("breathingAudio");
ambienceAudio.volume = 0.22;
monsterAudio.volume = 0;
breathingAudio.volume = 0;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101010);
scene.fog = new THREE.FogExp2(
0x101010,
0.022
);
const camera = new THREE.PerspectiveCamera(
75,
innerWidth / innerHeight,
0.1,
150
);
camera.rotation.order = "YXZ";
const renderer = new THREE.WebGLRenderer({
antialias: true
});
renderer.setPixelRatio(
Math.min(devicePixelRatio, 2)
);
renderer.setSize(
innerWidth,
innerHeight
);
renderer.shadowMap.enabled = true;
game.prepend(renderer.domElement);
const horrorFilter = document.createElement("div");
horrorFilter.id = "horrorFilter";
horrorFilter.className = "hidden";
horrorFilter.innerHTML = `
<div class="horror-vignette"></div>
<div class="horror-scanlines"></div>
<div class="horror-grain"></div>
`;
game.appendChild(horrorFilter);
const horrorFilterStyle = document.createElement("style");
horrorFilterStyle.textContent = `
#horrorFilter{
position:absolute;
inset:0;
z-index:64;
pointer-events:none;
overflow:hidden;
opacity:1;
}
#horrorFilter .horror-vignette,
#horrorFilter .horror-scanlines,
#horrorFilter .horror-grain{
position:absolute;
inset:0;
pointer-events:none;
}
#horrorFilter .horror-vignette{
  background:
    radial-gradient(
      ellipse at center,
      rgba(0,0,0,0) 42%,
      rgba(0,0,0,.10) 66%,
      rgba(0,0,0,.46) 100%
    );
}
#horrorFilter .horror-scanlines{
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(0,0,0,0) 0px,
      rgba(0,0,0,0) 3px,
      rgba(0,0,0,.13) 4px
    );
  opacity:.16;
  mix-blend-mode:multiply;
}
#horrorFilter .horror-grain{
  inset:-45%;
  width:190%;
  height:190%;
  opacity:.075;

  background-image:
    url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E");

  animation:horrorGrainMove .12s steps(2) infinite;
  mix-blend-mode:soft-light;
}
@keyframes horrorGrainMove{
0%   { transform:translate(0,0); }
20%  { transform:translate(-3%,2%); }
40%  { transform:translate(2%,-4%); }
60%  { transform:translate(4%,3%); }
80%  { transform:translate(-4%,-2%); }
100% { transform:translate(1%,4%); }
}
#game canvas{
  filter:saturate(.90) contrast(1.04) brightness(1.08) sepia(.02);
}
`;
document.head.appendChild(horrorFilterStyle);
function updateHorrorFilter() {
horrorFilter.classList.toggle("hidden", !running || paused);
}
const survivalHUD = document.createElement("div");
survivalHUD.id = "survivalHUD";
survivalHUD.innerHTML = `
<div class="survival-label">SPRINT</div>
<div class="survival-sprint-track">
<div id="survivalSprintFill"></div>
</div>
<div class="survival-key-row">
<span>KEY</span>
<span id="keyStatus">NOT FOUND</span>
<img id="keyHudIcon" src="assets/environment/key.png" alt="" />
</div>
`;
game.appendChild(survivalHUD);
const survivalHUDStyle = document.createElement("style");
survivalHUDStyle.textContent = `
#survivalHUD{
position:absolute;
top:24px;
left:24px;
z-index:65;
width:190px;
pointer-events:none;
font-family:monospace;
color:#eee;
text-shadow:0 2px 5px #000;
}
#survivalHUD .survival-label{
font-size:11px;
letter-spacing:3px;
margin-bottom:7px;
color:rgba(255,255,255,.72);
}
#survivalHUD .survival-sprint-track{
width:190px;
height:8px;
border:1px solid rgba(255,255,255,.32);
background:rgba(0,0,0,.58);
overflow:hidden;
}
#survivalSprintFill{
width:100%;
height:100%;
transform-origin:left center;
transform:scaleX(1);
background:#49b85a;
}
#survivalHUD .survival-key-row{
margin-top:13px;
display:flex;
justify-content:space-between;
align-items:center;
font-size:11px;
letter-spacing:2px;
color:rgba(255,255,255,.66);
}
#keyStatus{
color:rgba(255,255,255,.38);
}
#keyStatus.found{
display:none;
}
#keyHudIcon{
display:none;
width:28px;
height:28px;
object-fit:contain;
filter:brightness(.68);
transform:rotate(90deg);
}
#keyHudIcon.found{
display:block;
}
`;
document.head.appendChild(survivalHUDStyle);
const survivalSprintFill = document.getElementById("survivalSprintFill");
const keyStatus = document.getElementById("keyStatus");
const keyHudIcon = document.getElementById("keyHudIcon");
if (sprintFill?.parentElement) {
sprintFill.parentElement.style.display = "none";
}
const survivalHUDObserver = new MutationObserver(() => {
survivalHUD.classList.toggle("hidden", hud.classList.contains("hidden"));
});
survivalHUDObserver.observe(hud, { attributes: true, attributeFilter: ["class"] });
survivalHUD.classList.toggle("hidden", hud.classList.contains("hidden"));
let gameMode = "easy";
const modeScreen = document.createElement("section");
modeScreen.id = "modeScreen";
modeScreen.className = "screen hidden";
modeScreen.innerHTML = `
<div class="panel mode-panel">
<div class="eyebrow">CHOOSE YOUR RUN</div>
<h2>DIFFICULTY</h2>
<div class="mode-buttons">
<button id="easyModeBtn" type="button">
<span class="mode-name">LWK HARD</span>
<span class="mode-desc">FIND THE EXIT</span>
</button>
<button id="hardModeBtn" type="button">
<span class="mode-name">HARD</span>
<span class="mode-desc">FIND THE KEY THEN FIND THE EXIT</span>
</button>
</div>
</div>
`;
game.appendChild(modeScreen);
const modeStyle = document.createElement("style");
modeStyle.textContent = `
#modeScreen{z-index:95}
#modeScreen .mode-panel{max-width:650px;text-align:center }
#modeScreen h2{
  margin:8px 0 26px;
  color:#c58a27;
  letter-spacing:5px;
  font-family:"Gruesome",sans-serif;
  font-size:42px;
}
#modeScreen .mode-buttons{display:flex;gap:18px;justify-content:center;flex-wrap:wrap}
#modeScreen .mode-buttons button{
width:250px;
min-height:120px;
padding:18px 16px;
border:1px solid rgba(255,255,255,.22);
background:rgba(7,7,7,.88);
color:#eee;
cursor:pointer;
transition:transform .15s ease,border-color .15s ease,background .15s ease;
}

#modeScreen .mode-buttons button:hover{
transform:translateY(-3px);
border-color:#c58a27;
background:rgba(24,18,10,.94);
}
#modeScreen .mode-name{
display:block;
font-size:22px;
letter-spacing:5px;
margin-bottom:12px;
}

#modeScreen .mode-desc{
display:block;
font-family:monospace;
font-size:10px;
line-height:1.6;
letter-spacing:2px;
color:rgba(255,255,255,.52);
}
`;
document.head.appendChild(modeStyle);
const easyModeBtn = modeScreen.querySelector("#easyModeBtn");
const hardModeBtn = modeScreen.querySelector("#hardModeBtn");
function applyModeHUD() {
const keyRow = survivalHUD.querySelector(".survival-key-row");
if (keyRow) keyRow.style.display = gameMode === "hard" ? "flex" : "none";
}
scene.add(
new THREE.HemisphereLight(
0x8a8a8a,
0x202020,
1.15
)
);
const playerLight = new THREE.PointLight(
0xffe2b8,
3.5,
18,
1.7
);
camera.add(playerLight);
scene.add(camera);
const CELL = 3.35;
const WALL_H = 3.2;
const MAP = [
"11111111111111111111111",
"10001000000010100000001",
"11101011101010101011101",
"10101000100000000010001",
"10101110101111101011101",
"10100010100010001000001",
"10111010111010111111101",
"10001010001000001000101",
"11101011111011100010101",
"10000000100000101010001",
"10101110101110101011111",
"10000000101000101000001",
"10101101101011101011101",
"10001000001000100010001",
"10111010111110111010101",
"10100010001000100010001",
"10101011101011101110111",
"10000010001000100010001",
"11111110111110101010101",
"10001000100000101000001",
"10101010101111101011101",
"10000010000000001000001",
"11111111111111111111111"
];
const ROWS = MAP.length;
const COLS = MAP[0].length;
const WORLD_W = COLS * CELL;
const WORLD_D = ROWS * CELL;
function cellToWorld(col, row) {
return {
x:
col * CELL -
WORLD_W / 2 +
CELL / 2,
z:
row * CELL -
WORLD_D / 2 +
CELL / 2
};
}
function worldToCell(x, z) {
const col = Math.floor(
(x + WORLD_W / 2) / CELL
);
const row = Math.floor(
(z + WORLD_D / 2) / CELL
);
return {
col:
THREE.MathUtils.clamp(
col,
0,
COLS - 1
),
row:
THREE.MathUtils.clamp(
row,
0,
ROWS - 1
)
};
}
const floorTextureLoader = new THREE.TextureLoader();
const floorDiffuse = floorTextureLoader.load(
"assets/textures/floor/floor_diffuse.jpg"
);
const floorNormal = floorTextureLoader.load(
"assets/textures/floor/floor_normal.png"
);
const floorRoughness = floorTextureLoader.load(
"assets/textures/floor/floor_roughness.png"
);
floorDiffuse.colorSpace = THREE.SRGBColorSpace;
for (const texture of [floorDiffuse, floorNormal, floorRoughness]) {
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(COLS / 2.8, ROWS / 2.8);
texture.anisotropy = Math.min(
8,
renderer.capabilities.getMaxAnisotropy()
);
}
const floorMaterial = new THREE.MeshStandardMaterial({
map: floorDiffuse,
normalMap: floorNormal,
roughnessMap: floorRoughness,
color: 0x777777,
roughness: 1,
metalness: 0,
normalScale: new THREE.Vector2(0.55, 0.55)
});
const floor = new THREE.Mesh(
new THREE.PlaneGeometry(
WORLD_W,
WORLD_D
),
floorMaterial
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);
const ceilingTextureLoader = new THREE.TextureLoader();
const ceilingDiffuse = ceilingTextureLoader.load(
"assets/textures/ceiling/ceiling_diffuse.jpg"
);
const ceilingNormal = ceilingTextureLoader.load(
"assets/textures/ceiling/ceiling_normal.png"
);
const ceilingRoughness = ceilingTextureLoader.load(
"assets/textures/ceiling/ceiling_roughness.jpg"
);
ceilingDiffuse.colorSpace = THREE.SRGBColorSpace;
for (const texture of [ceilingDiffuse, ceilingNormal, ceilingRoughness]) {
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(COLS / 2.8, ROWS / 2.8);
texture.anisotropy = Math.min(
8,
renderer.capabilities.getMaxAnisotropy()
);
}
const ceilingMaterial = new THREE.MeshStandardMaterial({
map: ceilingDiffuse,
normalMap: ceilingNormal,
roughnessMap: ceilingRoughness,
color: 0x5f5b56,
roughness: 1,
metalness: 0,
normalScale: new THREE.Vector2(0.55, 0.55),
side: THREE.DoubleSide
});
const ceiling = new THREE.Mesh(
new THREE.PlaneGeometry(
WORLD_W,
WORLD_D
),
ceilingMaterial
);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = WALL_H;
ceiling.receiveShadow = true;
scene.add(ceiling);
const wallTextureLoader = new THREE.TextureLoader();
const wallDiffuse = wallTextureLoader.load(
"assets/textures/wall/wall_diffuse.png"
);
const wallNormal = wallTextureLoader.load(
"assets/textures/wall/wall_normal.jpg"
);
const wallRoughness = wallTextureLoader.load(
"assets/textures/wall/wall_roughness.jpg"
);
wallDiffuse.colorSpace = THREE.SRGBColorSpace;
for (const texture of [wallDiffuse, wallNormal, wallRoughness]) {
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(1.0, 1.0);
texture.anisotropy = Math.min(
8,
renderer.capabilities.getMaxAnisotropy()
);
}
const wallMaterial =
new THREE.MeshStandardMaterial({
map: wallDiffuse,
normalMap: wallNormal,
roughnessMap: wallRoughness,
color: 0x77716b,
roughness: 1,
metalness: 0,
normalScale: new THREE.Vector2(0.7, 0.7)
});
const wallGeometry =
new THREE.BoxGeometry(
CELL,
WALL_H,
CELL
);
const wallBoxes = [];
for (let r = 0; r < ROWS; r++) {
for (let c = 0; c < COLS; c++) {
if (MAP[r][c] !== "1") {
continue;
}
const p = cellToWorld(
c,
r
);
const wall = new THREE.Mesh(
wallGeometry,
wallMaterial
);
wall.position.set(
p.x,
WALL_H / 2,
p.z
);
wall.castShadow = true;
wall.receiveShadow = true;
scene.add(wall);
wallBoxes.push({
minX:
p.x - CELL / 2,
maxX:
p.x + CELL / 2,
minZ:
p.z - CELL / 2,
maxZ:
p.z + CELL / 2
});
}
}
const decorGroup = new THREE.Group();
scene.add(decorGroup);
const darkMetalMaterial = new THREE.MeshStandardMaterial({
color: 0x171717,
roughness: 0.72,
metalness: 0.55
});
const pipeMaterial = new THREE.MeshStandardMaterial({
color: 0x242321,
roughness: 0.65,
metalness: 0.65
});
const trimMaterial = new THREE.MeshStandardMaterial({
color: 0x151413,
roughness: 0.9
});
const ventMaterial = new THREE.MeshStandardMaterial({
color: 0x252525,
roughness: 0.7,
metalness: 0.5
});
const stainMaterial = new THREE.MeshBasicMaterial({
color: 0x090807,
transparent: true,
opacity: 0.24,
depthWrite: false
});
const baseTrimGeometry = new THREE.BoxGeometry(
CELL,
0.22,
0.09
);
for (let r = 0; r < ROWS; r++) {
for (let c = 0; c < COLS; c++) {
if (MAP[r][c] !== "0") continue;
const p = cellToWorld(c, r);
if (r > 0 && MAP[r - 1][c] === "1") {
const trim = new THREE.Mesh(
baseTrimGeometry,
trimMaterial
);
trim.position.set(
p.x,
0.11,
p.z - CELL / 2 + 0.04
);
decorGroup.add(trim);
}
if (r < ROWS - 1 && MAP[r + 1][c] === "1") {
const trim = new THREE.Mesh(
baseTrimGeometry,
trimMaterial
);
trim.position.set(
p.x,
0.11,
p.z + CELL / 2 - 0.04
);
decorGroup.add(trim);
}
if (c > 0 && MAP[r][c - 1] === "1") {
const trim = new THREE.Mesh(
baseTrimGeometry,
trimMaterial
);
trim.rotation.y = Math.PI / 2;
trim.position.set(
p.x - CELL / 2 + 0.04,
0.11,
p.z
);
decorGroup.add(trim);
}
if (c < COLS - 1 && MAP[r][c + 1] === "1") {
const trim = new THREE.Mesh(
baseTrimGeometry,
trimMaterial
);
trim.rotation.y = Math.PI / 2;
trim.position.set(
p.x + CELL / 2 - 0.04,
0.11,
p.z
);
decorGroup.add(trim);
}
}
}
const beamGeometry = new THREE.BoxGeometry(
CELL * 0.9,
0.16,
0.16
);
for (let r = 1; r < ROWS - 1; r++) {
for (let c = 1; c < COLS - 1; c++) {
if (MAP[r][c] !== "0") continue;
if ((r + c) % 4 !== 0) continue;
const p = cellToWorld(c, r);
const beam = new THREE.Mesh(
beamGeometry,
darkMetalMaterial
);
beam.position.set(
p.x,
WALL_H - 0.12,
p.z
);
if ((r + c) % 2 === 0) {
beam.rotation.y = Math.PI / 2;
}
decorGroup.add(beam);
}
}
const pipeGeometry = new THREE.CylinderGeometry(
0.055,
0.055,
CELL * 0.92,
8
);
for (let r = 1; r < ROWS - 1; r++) {
for (let c = 1; c < COLS - 1; c++) {
if (MAP[r][c] !== "0") continue;
if ((r * 3 + c) % 7 !== 0) continue;
const p = cellToWorld(c, r);
const pipe = new THREE.Mesh(
pipeGeometry,
pipeMaterial
);
pipe.position.set(
p.x + 0.65,
WALL_H - 0.28,
p.z
);
pipe.rotation.z = Math.PI / 2;
if ((r + c) % 2 === 0) {
pipe.rotation.z = 0;
pipe.rotation.x = Math.PI / 2;
}
decorGroup.add(pipe);
}
}
const ventGeometry = new THREE.BoxGeometry(
0.85,
0.52,
0.07
);
let ventCount = 0;
for (let r = 1; r < ROWS - 1; r++) {
for (let c = 1; c < COLS - 1; c++) {
if (MAP[r][c] !== "0") continue;
if (ventCount >= 14) break;
if ((r * 5 + c * 3) % 11 !== 0) continue;
const p = cellToWorld(c, r);
let vent = null;
if (MAP[r - 1]?.[c] === "1") {
vent = new THREE.Mesh(
ventGeometry,
ventMaterial
);
vent.position.set(
p.x,
2.05,
p.z - CELL / 2 + 0.035
);
}
else if (MAP[r + 1]?.[c] === "1") {
vent = new THREE.Mesh(
ventGeometry,
ventMaterial
);
vent.position.set(
p.x,
2.05,
p.z + CELL / 2 - 0.035
);
}
else if (MAP[r]?.[c - 1] === "1") {
vent = new THREE.Mesh(
ventGeometry,
ventMaterial
);
vent.rotation.y = Math.PI / 2;
vent.position.set(
p.x - CELL / 2 + 0.035,
2.05,
p.z
);
}
else if (MAP[r]?.[c + 1] === "1") {
vent = new THREE.Mesh(
ventGeometry,
ventMaterial
);
vent.rotation.y = Math.PI / 2;
vent.position.set(
p.x + CELL / 2 - 0.035,
2.05,
p.z
);
}
if (vent) {
decorGroup.add(vent);
ventCount++;
}
}
}
const stainGeometry = new THREE.CircleGeometry(
0.7,
16
);
for (let r = 1; r < ROWS - 1; r++) {
for (let c = 1; c < COLS - 1; c++) {
if (MAP[r][c] !== "0") continue;
if ((r * 7 + c * 5) % 13 !== 0) continue;
const p = cellToWorld(c, r);
const stain = new THREE.Mesh(
stainGeometry,
stainMaterial
);
stain.rotation.x = -Math.PI / 2;
stain.position.set(
p.x + Math.sin(c * 8.2) * 0.7,
0.008,
p.z + Math.cos(r * 5.7) * 0.7
);
const scale =
0.6 +
Math.abs(Math.sin(r * c)) * 0.8;
stain.scale.set(
scale,
scale * 0.55,
1
);
decorGroup.add(stain);
}
}
const dragMarkMaterial = new THREE.MeshBasicMaterial({
color: 0x35100d,
transparent: true,
opacity: 0.42,
depthWrite: false
});
const dirtDragMaterial = new THREE.MeshBasicMaterial({
color: 0x0b0907,
transparent: true,
opacity: 0.34,
depthWrite: false
});
const dragMarkSpots = [
{ col: 3, row: 5, rot: 0.18, length: 2.8 },
{ col: 11, row: 13, rot: -0.42, length: 3.25 },
{ col: 5, row: 15, rot: 0.62, length: 2.45 }
];
for (let n = 0; n < dragMarkSpots.length; n++) {
const spot = dragMarkSpots[n];
if (MAP[spot.row]?.[spot.col] !== "0") continue;
const p = cellToWorld(spot.col, spot.row);
const group = new THREE.Group();
for (let i = 0; i < 5; i++) {
const streak = new THREE.Mesh(
new THREE.PlaneGeometry(
spot.length * (0.72 + Math.abs(Math.sin(i * 2.1)) * 0.28),
0.045 + (i % 2) * 0.025
),
i === 4 ? dirtDragMaterial : dragMarkMaterial
);
streak.rotation.x = -Math.PI / 2;
streak.position.set(
(Math.sin(i * 3.7) * 0.16),
0.021 + i * 0.0004,
-0.22 + i * 0.105
);
group.add(streak);
}
for (let i = 0; i < 4; i++) {
const patch = new THREE.Mesh(
new THREE.CircleGeometry(0.11 + (i % 2) * 0.06, 10),
i % 3 === 0 ? dirtDragMaterial : dragMarkMaterial
);
patch.rotation.x = -Math.PI / 2;
patch.scale.set(1.8, 0.65, 1);
patch.position.set(
-spot.length * 0.34 + i * (spot.length * 0.22),
0.023,
Math.sin(i * 5.1) * 0.22
);
group.add(patch);
}
group.position.set(p.x, 0, p.z);
group.rotation.y = spot.rot;
decorGroup.add(group);
}
function makeSprayTextTexture(text, color = "#7b1714") {
const canvas = document.createElement("canvas");
canvas.width = 1024;
canvas.height = 256;
const ctx = canvas.getContext("2d");
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.font = "900 150px Arial Black, Impact, sans-serif";
ctx.globalAlpha = 0.72;
ctx.fillStyle = color;
ctx.fillText(text, 512, 132);
ctx.globalAlpha = 0.17;
ctx.fillText(text, 505, 126);
ctx.fillText(text, 520, 139);
ctx.globalCompositeOperation = "destination-out";
for (let i = 0; i < 150; i++) {
const x = (i * 83) % 900 + 62;
const y = (i * 47) % 170 + 42;
const radius = 1 + ((i * 7) % 5);
ctx.beginPath();
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fill();
}
ctx.globalCompositeOperation = "source-over";
const texture = new THREE.CanvasTexture(canvas);
texture.colorSpace = THREE.SRGBColorSpace;
texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
texture.needsUpdate = true;
return texture;
}
const floorWriting = [
{ text: "RUN", col: 7, row: 1, rot: -0.08, color: "#7b1714", w: 3.1 },
{ text: "WRONG WAY", col: 3, row: 7, rot: 0.12, color: "#6d1714", w: 3.7 },
{ text: "IT HEARS YOU", col: 11, row: 11, rot: -0.16, color: "#6f1b16", w: 3.9 },
{ text: "DON'T LOOK BACK", col: 3, row: 13, rot: 0.08, color: "#741814", w: 4.2 },
{ text: "EXIT ->", col: 13, row: 15, rot: -0.22, color: "#6b1713", w: 3.4 },
{ text: "HIDE", col: 1, row: 9, rot: 0.18, color: "#5f1714", w: 2.8 }
];
for (const writing of floorWriting) {
if (MAP[writing.row]?.[writing.col] !== "0") continue;
const p = cellToWorld(writing.col, writing.row);
const texture = makeSprayTextTexture(writing.text, writing.color);
const material = new THREE.MeshBasicMaterial({
map: texture,
transparent: true,
opacity: 0.68,
depthWrite: false,
side: THREE.DoubleSide
});
const writingMesh = new THREE.Mesh(
new THREE.PlaneGeometry(writing.w, 0.95),
material
);
writingMesh.rotation.x = -Math.PI / 2;
writingMesh.rotation.z = writing.rot;
writingMesh.position.set(p.x, 0.026, p.z);
decorGroup.add(writingMesh);
}
const crackMaterial = new THREE.MeshBasicMaterial({
color: 0x030303,
transparent: true,
opacity: 0.7
});
for (let r = 1; r < ROWS - 1; r++) {
for (let c = 1; c < COLS - 1; c++) {
if (MAP[r][c] !== "0")
continue;
if ((r * 9 + c * 4) % 17 !== 0)
continue;
const p = cellToWorld(c, r);
const crackAmount =
2 + ((r + c) % 3);
for (let i = 0; i < crackAmount; i++) {
const crack = new THREE.Mesh(
new THREE.PlaneGeometry(
0.7 + i * 0.22,
0.018
),
crackMaterial
);
crack.rotation.x =
-Math.PI / 2;
crack.rotation.z =
((i * 1.7) + c) % Math.PI;
crack.position.set(
p.x +
Math.sin(i * 4.7 + c) * 0.5,
0.017,
p.z +
Math.cos(i * 3.2 + r) * 0.5
);
decorGroup.add(crack);
}
}
}
const ceilingSeamMaterial =
new THREE.MeshBasicMaterial({
color: 0x020202,
transparent: true,
opacity: 0.7
});
for (let r = 1; r < ROWS - 1; r++) {
for (let c = 1; c < COLS - 1; c++) {
if (MAP[r][c] !== "0")
continue;
if ((r + c) % 2 !== 0)
continue;
const p = cellToWorld(c, r);
const ceilingPanel =
new THREE.Mesh(
new THREE.PlaneGeometry(
CELL * 0.88,
CELL * 0.88
),
new THREE.MeshStandardMaterial({
color:
(r + c) % 4 === 0
? 0x11100f
: 0x0d0d0d,
roughness: 1,
side: THREE.DoubleSide
})
);
ceilingPanel.rotation.x =
Math.PI / 2;
ceilingPanel.position.set(
p.x,
WALL_H - 0.018,
p.z
);
}
}
const propGroup = new THREE.Group();
decorGroup.add(propGroup);
const electricalMaterial = new THREE.MeshStandardMaterial({
color: 0x343431,
roughness: 0.72,
metalness: 0.55
});
const electricalDarkMaterial = new THREE.MeshStandardMaterial({
color: 0x111111,
roughness: 0.8,
metalness: 0.35
});
const cableMaterial = new THREE.MeshStandardMaterial({
color: 0x080808,
roughness: 0.85
});
const warningMaterial = new THREE.MeshStandardMaterial({
color: 0x9b7a24,
roughness: 0.9
});
const debrisMaterial = new THREE.MeshStandardMaterial({
color: 0x242220,
roughness: 1
});
function addElectricalBox(p, side) {
const box = new THREE.Group();
const body = new THREE.Mesh(
new THREE.BoxGeometry(
0.62,
0.82,
0.13
),
electricalMaterial
);
box.add(body);
const panel = new THREE.Mesh(
new THREE.BoxGeometry(
0.36,
0.24,
0.025
),
electricalDarkMaterial
);
panel.position.z = 0.077;
box.add(panel);
const warning = new THREE.Mesh(
new THREE.BoxGeometry(
0.18,
0.13,
0.02
),
warningMaterial
);
warning.position.set(
0,
-0.22,
0.083
);
box.add(warning);
if (side === "N") {
box.position.set(
p.x,
1.35,
p.z - CELL / 2 + 0.09
);
}
if (side === "S") {
box.position.set(
p.x,
1.35,
p.z + CELL / 2 - 0.09
);
box.rotation.y = Math.PI;
}
if (side === "W") {
box.position.set(
p.x - CELL / 2 + 0.09,
1.35,
p.z
);
box.rotation.y = Math.PI / 2;
}
if (side === "E") {
box.position.set(
p.x + CELL / 2 - 0.09,
1.35,
p.z
);
box.rotation.y = -Math.PI / 2;
}
propGroup.add(box);
}
let electricalCount = 0;
for (let r = 1; r < ROWS - 1; r++) {
for (let c = 1; c < COLS - 1; c++) {
if (MAP[r][c] !== "0")
continue;
if (electricalCount >= 8)
break;
if ((r * 13 + c * 7) % 19 !== 0)
continue;
const p = cellToWorld(c, r);
if (MAP[r - 1]?.[c] === "1") {
addElectricalBox(
p,
"N"
);
electricalCount++;
}
else if (MAP[r + 1]?.[c] === "1") {
addElectricalBox(
p,
"S"
);
electricalCount++;
}
else if (MAP[r]?.[c - 1] === "1") {
addElectricalBox(
p,
"W"
);
electricalCount++;
}
else if (MAP[r]?.[c + 1] === "1") {
addElectricalBox(
p,
"E"
);
electricalCount++;
}
}
}
const cableGeometry =
new THREE.CylinderGeometry(
0.025,
0.025,
1.35,
6
);
for (let r = 1; r < ROWS - 1; r++) {
for (let c = 1; c < COLS - 1; c++) {
if (MAP[r][c] !== "0")
continue;
if ((r * 11 + c * 3) % 23 !== 0)
continue;
const p = cellToWorld(c, r);
const cable =
new THREE.Mesh(
cableGeometry,
cableMaterial
);
cable.position.set(
p.x + 0.75,
WALL_H - 0.62,
p.z - 0.55
);
cable.rotation.z =
0.08 +
Math.sin(c + r) * 0.16;
propGroup.add(cable);
}
}
for (let r = 1; r < ROWS - 1; r++) {
for (let c = 1; c < COLS - 1; c++) {
if (MAP[r][c] !== "0")
continue;
if ((r * 5 + c * 9) % 29 !== 0)
continue;
const p = cellToWorld(c, r);
const amount =
2 + ((r + c) % 3);
for (let i = 0; i < amount; i++) {
const debris =
new THREE.Mesh(
new THREE.BoxGeometry(
0.12 + i * 0.045,
0.05 + i * 0.018,
0.2 + i * 0.05
),
debrisMaterial
);
const edgeDirection =
(c + r) % 2 === 0
? 1
: -1;
debris.position.set(
p.x +
edgeDirection *
(1.15 + i * 0.12),
0.04,
p.z +
Math.sin(
i * 4 + r
) * 0.45
);
debris.rotation.y =
(r + c + i) * 0.73;
debris.rotation.z =
Math.sin(
r * c + i
) * 0.12;
propGroup.add(
debris
);
}
}
}
const lightCells = [
[2, 1],
[7, 3],
[15, 3],
[20, 5],
[3, 8],
[11, 9],
[18, 11],
[5, 14],
[11, 15],
[19, 17],
[6, 19],
[15, 20]
];
const mazeLights = [];
for (const [c, r] of lightCells) {
const p = cellToWorld(
c,
r
);
const light =
new THREE.PointLight(
0xd9c7aa,
1.3,
10,
2
);
light.position.set(
p.x,
2.7,
p.z
);
scene.add(light);
const fixture = new THREE.Group();
const housing = new THREE.Mesh(
new THREE.BoxGeometry(2.25, 0.12, 0.42),
new THREE.MeshStandardMaterial({
color: 0x292929,
roughness: 0.72,
metalness: 0.45
})
);
fixture.add(housing);
const tubeMaterial = new THREE.MeshStandardMaterial({
color: 0xe8dfc8,
emissive: 0xd8ccb0,
emissiveIntensity: 1.8,
roughness: 0.35
});
const tube = new THREE.Mesh(
new THREE.BoxGeometry(1.9, 0.055, 0.16),
tubeMaterial
);
tube.position.y = -0.075;
fixture.add(tube);
const capMaterial = new THREE.MeshStandardMaterial({
color: 0x161616,
roughness: 0.9
});
const leftCap = new THREE.Mesh(
new THREE.BoxGeometry(0.14, 0.09, 0.25),
capMaterial
);
leftCap.position.set(
-1.02,
-0.055,
0
);
fixture.add(leftCap);
const rightCap = leftCap.clone();
rightCap.position.x = 1.02;
fixture.add(rightCap);
fixture.position.set(
p.x,
WALL_H - 0.08,
p.z
);
if ((c + r) % 2 === 0) {
fixture.rotation.y = Math.PI / 2;
}
scene.add(fixture);
const lightRoll = Math.random();
let lightState = "normal";
let baseIntensity = 1.15 + Math.random() * 0.35;
if (lightRoll < 0.17) {
lightState = "dead";
baseIntensity = 0;
} else if (lightRoll < 0.42) {
lightState = "dim";
baseIntensity = 0.28 + Math.random() * 0.32;
} else if (lightRoll < 0.58) {
lightState = "unstable";
baseIntensity = 0.85 + Math.random() * 0.35;
}
if (lightState === "dead") {
light.intensity = 0;
tubeMaterial.emissiveIntensity = 0.015;
tubeMaterial.color.setHex(0x4a4740);
} else {
light.intensity = baseIntensity;
tubeMaterial.emissiveIntensity = baseIntensity * 1.35;
}
mazeLights.push({
light: light,
tube: tube,
tubeMaterial: tubeMaterial,
fixture: fixture,
position: p.clone ? p.clone() : { x: p.x, z: p.z },
state: lightState,
baseIntensity: baseIntensity,
flickerOffset: Math.random() * 100,
nextFlicker: 0.25 + Math.random() * 5,
burstTimer: 0,
burstStrength: 0
});
}
const wallPanelMaterial = new THREE.MeshStandardMaterial({
color: 0x312f2d,
roughness: 0.96,
metalness: 0
});
const wallSeamMaterial = new THREE.MeshStandardMaterial({
color: 0x11100f,
roughness: 1
});
const wallGrimeMaterial = new THREE.MeshBasicMaterial({
color: 0x080706,
transparent: true,
opacity: 0.3,
depthWrite: false
});
function decorateWallFace(
p,
side,
c,
r
) {
const panel = new THREE.Mesh(
new THREE.PlaneGeometry(
CELL * 0.88,
WALL_H * 0.82
),
wallPanelMaterial
);
panel.position.y = WALL_H * 0.48;
if (side === "N") {
panel.position.set(
p.x,
WALL_H * 0.48,
p.z - CELL / 2 + 0.012
);
}
if (side === "S") {
panel.position.set(
p.x,
WALL_H * 0.48,
p.z + CELL / 2 - 0.012
);
panel.rotation.y = Math.PI;
}
if (side === "W") {
panel.position.set(
p.x - CELL / 2 + 0.012,
WALL_H * 0.48,
p.z
);
panel.rotation.y =
Math.PI / 2;
}
if (side === "E") {
panel.position.set(
p.x + CELL / 2 - 0.012,
WALL_H * 0.48,
p.z
);
panel.rotation.y =
-Math.PI / 2;
}
for (const offset of [-1.25, 1.25]) {
const seam = new THREE.Mesh(
new THREE.BoxGeometry(
0.025,
WALL_H * 0.78,
0.025
),
wallSeamMaterial
);
seam.position.y =
WALL_H * 0.48;
if (
side === "N" ||
side === "S"
) {
seam.position.x =
p.x + offset;
seam.position.z =
side === "N"
? p.z - CELL / 2 + 0.02
: p.z + CELL / 2 - 0.02;
} else {
seam.position.x =
side === "W"
? p.x - CELL / 2 + 0.02
: p.x + CELL / 2 - 0.02;
seam.position.z =
p.z + offset;
}
}
if ((c * 7 + r * 11) % 5 === 0) {
const grime = new THREE.Mesh(
new THREE.PlaneGeometry(
0.7 + ((c + r) % 3) * 0.25,
1.1
),
wallGrimeMaterial
);
grime.position.copy(
panel.position
);
grime.rotation.copy(
panel.rotation
);
grime.position.y =
0.65 + ((c + r) % 4) * 0.22;
if (side === "N")
grime.position.z += 0.008;
if (side === "S")
grime.position.z -= 0.008;
if (side === "W")
grime.position.x += 0.008;
if (side === "E")
grime.position.x -= 0.008;
grime.scale.x =
0.7 +
((c * r) % 4) * 0.13;
decorGroup.add(grime);
}
}
for (let r = 1; r < ROWS - 1; r++) {
for (let c = 1; c < COLS - 1; c++) {
if (MAP[r][c] !== "0")
continue;
const p =
cellToWorld(c, r);
if (MAP[r - 1]?.[c] === "1")
decorateWallFace(
p,
"N",
c,
r
);
if (MAP[r + 1]?.[c] === "1")
decorateWallFace(
p,
"S",
c,
r
);
if (MAP[r]?.[c - 1] === "1")
decorateWallFace(
p,
"W",
c,
r
);
if (MAP[r]?.[c + 1] === "1")
decorateWallFace(
p,
"E",
c,
r
);
}
}
// Never put wall art on any possible exit wall.
const RESERVED_EXIT_WALLS = new Set([
  "13,5,N",
  "11,7,W",
  "9,9,W",
  "7,11,E",
  "9,11,W",
  "7,13,N",
  "13,13,E",
  "7,15,W",
  "15,15,N"
]);

function isExitWall(col, row, side) {
  return RESERVED_EXIT_WALLS.has(`${col},${row},${side}`);
}
const posterGroup = new THREE.Group();
decorGroup.add(posterGroup);
const posterTextureLoader = new THREE.TextureLoader();
const posterPaperMaterial = new THREE.MeshStandardMaterial({
color: 0xe7e2d6,
roughness: 1,
metalness: 0,
side: THREE.DoubleSide
});
function createWallPoster({ image, col, row, side, width = 1.15, height = 1.55, tilt = 0 }) {
if (MAP[row]?.[col] !== "0") return;
if (isExitWall(col, row, side)) return;
const p = cellToWorld(col, row);
const texture = posterTextureLoader.load(image);
texture.colorSpace = THREE.SRGBColorSpace;
texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
const artMaterial = new THREE.MeshStandardMaterial({
map: texture,
roughness: 0.92,
metalness: 0,
transparent: true,
side: THREE.DoubleSide
});
const poster = new THREE.Group();
const paper = new THREE.Mesh(
new THREE.PlaneGeometry(width + 0.13, height + 0.13),
posterPaperMaterial
);
const artwork = new THREE.Mesh(
new THREE.PlaneGeometry(width, height),
artMaterial
);
artwork.position.z = 0.012;
poster.add(paper, artwork);
poster.rotation.z = tilt;
const wallInset = 0.10;
const y = 1.62;
if (side === "N" && MAP[row - 1]?.[col] === "1") {
poster.position.set(p.x, y, p.z - CELL / 2 + wallInset);
poster.rotation.y = 0;
} else if (side === "S" && MAP[row + 1]?.[col] === "1") {
poster.position.set(p.x, y, p.z + CELL / 2 - wallInset);
poster.rotation.y = Math.PI;
} else if (side === "W" && MAP[row]?.[col - 1] === "1") {
poster.position.set(p.x - CELL / 2 + wallInset, y, p.z);
poster.rotation.y = Math.PI / 2;
} else if (side === "E" && MAP[row]?.[col + 1] === "1") {
poster.position.set(p.x + CELL / 2 - wallInset, y, p.z);
poster.rotation.y = -Math.PI / 2;
} else {
return;
}
posterGroup.add(poster);
}
const POSTERS = [
{ image: "assets/posters/poster1.png", col: 3, row: 3, side: "W", tilt: -0.025 },
{ image: "assets/posters/poster2.png", col: 11, row: 3, side: "S", tilt: 0.018 },
{ image: "assets/posters/poster3.png", col: 19, row: 3, side: "N", tilt: -0.032 },
{ image: "assets/posters/poster4.png", col: 4, row: 9, side: "N", tilt: 0.022 },
{ image: "assets/posters/poster5.png", col: 12, row: 9, side: "N", tilt: -0.018 },
{ image: "assets/posters/poster6.png", col: 19, row: 11, side: "N", tilt: 0.030 },
{ image: "assets/posters/poster7.png", col: 5, row: 17, side: "S", tilt: -0.020 },
{ image: "assets/posters/poster8.png", col: 12, row: 19, side: "N", tilt: 0.026 },
{ image: "assets/posters/poster9.png", col: 19, row: 19, side: "S", tilt: -0.015 },
{ image: "assets/posters/poster10.png", col: 6, row: 1, side: "N", tilt: 0.021 },
{ image: "assets/posters/poster11.png", col: 15, row: 4, side: "E", tilt: -0.019 },
{ image: "assets/posters/poster12.png", col: 2, row: 7, side: "N", tilt: 0.028 },
{ image: "assets/posters/poster13.png", col: 16, row: 8, side: "N", tilt: -0.024 },
{ image: "assets/posters/poster14.png", col: 6, row: 13, side: "S", tilt: 0.017 },
{ image: "assets/posters/poster15.png", col: 20, row: 15, side: "N", tilt: -0.027 },
{ image: "assets/posters/poster16.png", col: 9, row: 21, side: "S", tilt: 0.020 }
];
for (const poster of POSTERS) createWallPoster(poster);
const graffitiGroup = new THREE.Group();
decorGroup.add(graffitiGroup);
const GRAFFITI_QUOTES = [
"KRISPY UR FIRED",
"ELOISE GO TO SLEEP",
"ban em",
"we out",
"WHO TF IS CHRISTINA AND AMBER",
"AMBURRR",
"I WILL BUG OUT",
"where is my summer fridays",
"NASTYYY",
"SCHMECK",
"YO SOY GAYYY",
"good shot daddy",
"i was looking at the nudes ur mother sent me",
"give me that puss!",
"octopuuuuusy",
"whats the closest planet to the sun?? MOON",
"i got the dyke nails, were going hard tonight",
"i cant wait to eat that kitty kitty kitty",
"she just said bend over and i listened",
"chicken",
"axs",
"Disney knees","I JUST DONT LIKE THE FEELING OF WETNESS",
"ARE YOU SISTERS???"
];
const GRAFFITI_COLORS = [
"#8f211c",
"#b9b2a5",
"#741a17",
"#aaa397",
"#9b2820"
];
function makeGraffitiTexture(text, color) {
const canvas = document.createElement("canvas");
canvas.width = 1600;
canvas.height = 420;
const ctx = canvas.getContext("2d");
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.textAlign = "center";
ctx.textBaseline = "middle";
let fontSize = 235;
ctx.font = `${fontSize}px "WisterGraffiti"`;
while (ctx.measureText(text).width > 1450 && fontSize > 88) {
fontSize -= 7;
ctx.font = `${fontSize}px "WisterGraffiti"`;
}
ctx.globalAlpha = 1;
ctx.fillStyle = color;
ctx.fillText(text, 800, 210);
const texture = new THREE.CanvasTexture(canvas);
texture.colorSpace = THREE.SRGBColorSpace;
texture.anisotropy = Math.min(
8,
renderer.capabilities.getMaxAnisotropy()
);
texture.needsUpdate = true;
return texture;
}
function getVisibleGraffitiFaces() {
const faces = [];
for (let r = 1; r < ROWS - 1; r++) {
for (let c = 1; c < COLS - 1; c++) {
if (MAP[r][c] !== "0") continue;
if (isExitWall(c, r, "N") && MAP[r - 1]?.[c] === "1") {
  // north wall is reserved for an exit
} else if (MAP[r - 1]?.[c] === "1") {
  faces.push({ col: c, row: r, side: "N" });
}

if (isExitWall(c, r, "S") && MAP[r + 1]?.[c] === "1") {
  // south wall is reserved for an exit
} else if (MAP[r + 1]?.[c] === "1") {
  faces.push({ col: c, row: r, side: "S" });
}

if (isExitWall(c, r, "W") && MAP[r]?.[c - 1] === "1") {
  // west wall is reserved for an exit
} else if (MAP[r]?.[c - 1] === "1") {
  faces.push({ col: c, row: r, side: "W" });
}

if (isExitWall(c, r, "E") && MAP[r]?.[c + 1] === "1") {
  // east wall is reserved for an exit
} else if (MAP[r]?.[c + 1] === "1") {
  faces.push({ col: c, row: r, side: "E" });
}
}
}
return faces;
}
function createWallGraffiti(face, text, index) {
const p = cellToWorld(face.col, face.row);
const color = GRAFFITI_COLORS[index % GRAFFITI_COLORS.length];
const texture = makeGraffitiTexture(text, color);
const material = new THREE.MeshBasicMaterial({
map: texture,
transparent: true,
opacity: 1,
depthWrite: false,
side: THREE.DoubleSide,
polygonOffset: true,
polygonOffsetFactor: -2,
polygonOffsetUnits: -2
});
const longQuote = text.length > 20;
const width = longQuote
? 2.72 + ((index % 3) * 0.12)
: 1.75 + ((index % 5) * 0.18);
const height = longQuote ? 0.82 : 0.72 + ((index % 3) * 0.08);
const y = 1.22 + ((index * 29) % 85) / 100;
const tilt = -0.075 + ((index * 13) % 15) / 100;
const mesh = new THREE.Mesh(
new THREE.PlaneGeometry(width, height),
material
);
mesh.rotation.z = tilt;
const wallInset = 0.10;
if (face.side === "N") {
mesh.position.set(p.x, y, p.z - CELL / 2 + wallInset);
mesh.rotation.y = 0;
} else if (face.side === "S") {
mesh.position.set(p.x, y, p.z + CELL / 2 - wallInset);
mesh.rotation.y = Math.PI;
} else if (face.side === "W") {
mesh.position.set(p.x - CELL / 2 + wallInset, y, p.z);
mesh.rotation.y = Math.PI / 2;
} else {
mesh.position.set(p.x + CELL / 2 - wallInset, y, p.z);
mesh.rotation.y = -Math.PI / 2;
}
graffitiGroup.add(mesh);
}
function buildChamberGraffiti() {
const allFaces = getVisibleGraffitiFaces();
const TARGET_GRAFFITI = 24;
const selected = [];
const usedCells = new Set();
let cursor = 7;
const step = 17;
for (let attempts = 0; attempts < allFaces.length * 4 && selected.length < TARGET_GRAFFITI; attempts++) {
cursor = (cursor + step) % allFaces.length;
const face = allFaces[cursor];
const cellKey = `${face.col},${face.row}`;
if (usedCells.has(cellKey)) continue;
const posterConflict = POSTERS.some(poster => {
if (poster.side !== face.side) return false;
const colGap = Math.abs(poster.col - face.col);
const rowGap = Math.abs(poster.row - face.row);
return colGap <= 1 && rowGap <= 1;
});
if (posterConflict) continue;
usedCells.add(cellKey);
selected.push(face);
}
for (let i = 0; i < selected.length; i++) {
const quote = GRAFFITI_QUOTES[i % GRAFFITI_QUOTES.length];
createWallGraffiti(selected[i], quote, i);
}
}
const graffitiFont = new FontFace(
"WisterGraffiti",
'url("assets/fonts/WisterGraffiti.woff2")'
);
graffitiFont.load()
.then(font => {
document.fonts.add(font);
buildChamberGraffiti();
})
.catch(error => {
console.warn("Graffiti font failed to load:", error);
});
const maintenanceGroup = new THREE.Group();
decorGroup.add(maintenanceGroup);
const maintenanceCells = new Set([
"17,18",
"19,18",
"18,19",
"17,17",
"19,17",
"17,19",
"19,19",
"19,16",
"16,17",
"20,17",
"20,19",
"17,20"
]);
const maintenancePipeMaterial = new THREE.MeshStandardMaterial({
color: 0x332d27,
roughness: 0.58,
metalness: 0.72
});
const maintenanceBracketMaterial = new THREE.MeshStandardMaterial({
color: 0x151515,
roughness: 0.75,
metalness: 0.65
});
for (const key of maintenanceCells) {
const [c, r] = key.split(",").map(Number);
if (MAP[r]?.[c] !== "0") continue;
const p = cellToWorld(c, r);
for (const offset of [-0.62, 0.62]) {
const pipe = new THREE.Mesh(
new THREE.CylinderGeometry(0.085, 0.085, CELL * 0.94, 10),
maintenancePipeMaterial
);
pipe.position.set(p.x + offset, WALL_H - 0.34, p.z);
pipe.rotation.x = Math.PI / 2;
maintenanceGroup.add(pipe);
}
if ((c + r) % 2 === 0) {
const bracket = new THREE.Mesh(
new THREE.BoxGeometry(1.65, 0.08, 0.12),
maintenanceBracketMaterial
);
bracket.position.set(p.x, WALL_H - 0.18, p.z);
maintenanceGroup.add(bracket);
}
}
for (const [c, r] of [[13,11], [15,13], [13,15]]) {
if (MAP[r]?.[c] !== "0") continue;
const p = cellToWorld(c, r);
const utilityLight = new THREE.PointLight(0xb67a45, 0.52, 7.5, 2);
utilityLight.position.set(p.x, 2.45, p.z);
maintenanceGroup.add(utilityLight);
}
const lockerGroup = new THREE.Group();
scene.add(lockerGroup);
const lockerBodyMaterial = new THREE.MeshStandardMaterial({
color: 0x343735,
roughness: 0.82,
metalness: 0.5
});
const lockerDarkMaterial = new THREE.MeshStandardMaterial({
color: 0x111312,
roughness: 0.9,
metalness: 0.35
});
const lockers = [];
const lockerCollisionBoxes = [];
const LOCKER_CELLS = [
{ col: 3, row: 4 },
{ col: 17, row: 4 },
{ col: 4, row: 11 },
{ col: 18, row: 11 },
{ col: 5, row: 19 },
{ col: 17, row: 19 }
];
function getLockerWallSide(col, row) {
if (MAP[row - 1]?.[col] === "1") return "N";
if (MAP[row + 1]?.[col] === "1") return "S";
if (MAP[row]?.[col - 1] === "1") return "W";
if (MAP[row]?.[col + 1] === "1") return "E";
return null;
}
function createLocker(col, row) {
if (MAP[row]?.[col] !== "0") return;
const side = getLockerWallSide(col, row);
if (!side) return;
const p = cellToWorld(col, row);
const locker = new THREE.Group();
const body = new THREE.Mesh(
new THREE.BoxGeometry(0.95, 2.35, 0.5),
lockerBodyMaterial
);
body.position.y = 1.175;
locker.add(body);
const door = new THREE.Mesh(
new THREE.BoxGeometry(0.78, 2.12, 0.055),
lockerDarkMaterial
);
door.position.set(0, 1.18, 0.278);
locker.add(door);
for (let i = 0; i < 4; i++) {
const slit = new THREE.Mesh(
new THREE.BoxGeometry(0.48, 0.025, 0.012),
new THREE.MeshBasicMaterial({ color: 0x050505 })
);
slit.position.set(0, 1.68 + i * 0.075, 0.312);
locker.add(slit);
}
const wallOffset = CELL / 2 - 0.34;
let rotation = 0;
let x = p.x;
let z = p.z;
if (side === "N") { z -= wallOffset; rotation = 0; }
if (side === "S") { z += wallOffset; rotation = Math.PI; }
if (side === "W") { x -= wallOffset; rotation = Math.PI / 2; }
if (side === "E") { x += wallOffset; rotation = -Math.PI / 2; }
locker.position.set(x, 0, z);
locker.rotation.y = rotation;
lockerGroup.add(locker);
lockers.push({ group: locker, col, row, side });

// Solid collision box for this locker.
// Only the player uses these boxes; monster movement keeps using wall collision only.
const isSideways = side === "W" || side === "E";
const lockerWidth = isSideways ? 0.50 : 0.95;
const lockerDepth = isSideways ? 0.95 : 0.50;

lockerCollisionBoxes.push({
minX: x - lockerWidth / 2,
maxX: x + lockerWidth / 2,
minZ: z - lockerDepth / 2,
maxZ: z + lockerDepth / 2
});
}
for (const spot of LOCKER_CELLS) createLocker(spot.col, spot.row);
const lockerUI = document.createElement("div");
lockerUI.id = "lockerUI";
lockerUI.innerHTML = `
<div id="lockerPrompt" class="locker-prompt hidden">E — HIDE</div>
<div id="lockerView" class="locker-view hidden">
<div class="locker-slat s1"></div>
<div class="locker-slat s2"></div>
<div class="locker-slat s3"></div>
<div class="locker-slat s4"></div>
<div class="locker-exit">E — EXIT LOCKER</div>
</div>
`;
game.appendChild(lockerUI);
const lockerStyle = document.createElement("style");
lockerStyle.textContent = `
#lockerUI{position:absolute;inset:0;z-index:70;pointer-events:none;font-family:monospace}
.locker-prompt{position:absolute;left:50%;bottom:18%;transform:translateX(-50%);padding:10px 16px;background:rgba(0,0,0,.72);border:1px solid rgba(255,255,255,.22);color:#eee;font-size:14px;letter-spacing:2px}
.locker-view{position:absolute;inset:0;background:linear-gradient(90deg,#020202 0 38%,transparent 38% 62%,#020202 62% 100%);box-shadow:inset 0 0 180px 45px #000}
.locker-view::before,.locker-view::after{content:"";position:absolute;left:38%;right:38%;height:43%;background:#020202}
.locker-view::before{top:0}.locker-view::after{bottom:0}
.locker-slat{position:absolute;left:38%;right:38%;height:2.4%;background:#050505;box-shadow:0 0 8px #000}
.locker-slat.s1{top:44%}.locker-slat.s2{top:48%}.locker-slat.s3{top:52%}.locker-slat.s4{top:56%}
.locker-uses{position:absolute;top:11%;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.55);font-size:10px;letter-spacing:2px}
.locker-exit{position:absolute;bottom:8%;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.72);font-size:12px;letter-spacing:2px;z-index:10}
`;
document.head.appendChild(lockerStyle);
const lockerPrompt = document.getElementById("lockerPrompt");
const lockerView = document.getElementById("lockerView");
const LOCKER_REENTRY_COOLDOWN = 4;
const LOCKER_LOOK_LIMIT = 0.16;
let lockerCooldownUntil = 0;
let lockerStatusTimeout = null;
let isHiding = false;
let activeLocker = null;
let hidingStartedAt = 0;
let preHidePosition = new THREE.Vector3();
let preHideYaw = 0;
let preHidePitch = 0;
let antiCampTarget = null;
let antiCampRetargetTimer = 0;
function nearestLocker(maxDistance = 1.45) {
let best = null;
let bestDistance = maxDistance;
for (const locker of lockers) {
const dx = camera.position.x - locker.group.position.x;
const dz = camera.position.z - locker.group.position.z;
const distance = Math.hypot(dx, dz);
if (distance < bestDistance) {
best = locker;
bestDistance = distance;
}
}
return best;
}
function chooseAntiCampTarget() {
const lockerCell = activeLocker
? { col: activeLocker.col, row: activeLocker.row }
: worldToCell(camera.position.x, camera.position.z);
const candidates = [];
for (let r = 1; r < ROWS - 1; r++) {
for (let c = 1; c < COLS - 1; c++) {
if (!isWalkable(c, r)) continue;
const gridDistance = Math.abs(c - lockerCell.col) + Math.abs(r - lockerCell.row);
if (gridDistance >= 8) candidates.push({ col: c, row: r });
}
}
if (!candidates.length) return { col: 1, row: 1 };
return candidates[Math.floor(Math.random() * candidates.length)];
}
function enterLocker(locker) {
  if (!running || paused || isHiding || !locker) return;

  // Don't allow instant re-entry after leaving.
  if (performance.now() < lockerCooldownUntil) return;

  isHiding = true;
  activeLocker = locker;
  hidingStartedAt = performance.now();

  preHidePosition.copy(camera.position);
  preHideYaw = yaw;
  preHidePitch = pitch;

  clearMovementKeys();

  const p = cellToWorld(locker.col, locker.row);

  camera.position.set(
    p.x,
    CAMERA_HEIGHT,
    p.z
  );

  yaw = locker.group.rotation.y + Math.PI;
  pitch = 0;

  camera.rotation.set(
    pitch,
    yaw,
    0
  );

  lockerPrompt.classList.add("hidden");
  lockerView.classList.remove("hidden");
  crosshair.classList.add("hidden");

  antiCampTarget = chooseAntiCampTarget();
  antiCampRetargetTimer = 3.5;

  monsterPath = [];
  monsterPathIndex = 0;
  pathTimer = 0;
}
function leaveLocker(forced = false) {
if (!isHiding) return;
isHiding = false;
lockerCooldownUntil = performance.now() + LOCKER_REENTRY_COOLDOWN * 1000;
camera.position.copy(preHidePosition);
yaw = preHideYaw;
pitch = preHidePitch;
camera.rotation.set(pitch, yaw, 0);
lockerView.classList.add("hidden");
crosshair.classList.remove("hidden");
activeLocker = null;
antiCampTarget = null;
monsterPath = [];
monsterPathIndex = 0;
pathTimer = 0;
}
function resetLockerState() {
  isHiding = false;
  lockerCooldownUntil = 0;

  clearTimeout(lockerStatusTimeout);

  activeLocker = null;
  antiCampTarget = null;
  hidingStartedAt = 0;

  lockerPrompt?.classList.add("hidden");
  lockerView?.classList.add("hidden");
}
function updateLockerSystem() {
  if (!running || paused) {
    lockerPrompt.classList.add("hidden");
    return;
  }

  if (isHiding) {
    lockerPrompt.classList.add("hidden");
    return;
  }

  const locker = nearestLocker();
  const coolingDown =
    performance.now() < lockerCooldownUntil;

  if (!locker || coolingDown) {
    lockerPrompt.classList.add("hidden");
  } else {
    lockerPrompt.textContent = "E — HIDE";
    lockerPrompt.classList.remove("hidden");
  }
}
function calculateMonsterPathTo(targetCell) {
const monsterCell = worldToCell(monster.position.x, monster.position.z);
monsterPath = findPath(monsterCell, targetCell);
monsterPathIndex = 0;
}
const keyTexture = new THREE.TextureLoader().load(
"assets/environment/key.png"
);
keyTexture.colorSpace = THREE.SRGBColorSpace;
const keyMaterial = new THREE.SpriteMaterial({
map: keyTexture,
transparent: true,
alphaTest: 0.04,
depthWrite: false,
color: 0x696969
});
const mazeKey = new THREE.Sprite(keyMaterial);
mazeKey.scale.set(0.52, 0.52, 1);
mazeKey.position.y = 0.58;
scene.add(mazeKey);
let hasKey = false;
let currentKeyCell = null;
let lockedDoorMessageShown = false;
let lockedDoorMessageTimeout = null;
function updateKeyHUD() {
if (!keyStatus || !keyHudIcon) return;
keyStatus.textContent = "NOT FOUND";
keyStatus.classList.toggle("found", hasKey);
keyHudIcon.classList.toggle("found", hasKey);
}
function placeKey() {
hasKey = false;
updateKeyHUD();
if (gameMode !== "hard") {
mazeKey.visible = false;
currentKeyCell = null;
return;
}
mazeKey.visible = true;
lockedDoorMessageShown = false;
clearTimeout(lockedDoorMessageTimeout);
const candidates = [];
for (let r = 1; r < ROWS - 1; r++) {
for (let c = 1; c < COLS - 1; c++) {
if (MAP[r]?.[c] !== "0") continue;
const cell = { col: c, row: r };
const fromPlayer = currentPlayerSpawn
? getMazeDistance(currentPlayerSpawn, cell)
: 0;
const fromExit = currentExitLocation
? getMazeDistance(currentExitLocation, cell)
: 0;
if (fromPlayer < 8) continue;
if (fromExit < 5) continue;
if (LOCKER_CELLS.some(locker => locker.col === c && locker.row === r)) continue;
candidates.push(cell);
}
}
if (!candidates.length) {
for (let r = 1; r < ROWS - 1; r++) {
for (let c = 1; c < COLS - 1; c++) {
if (MAP[r]?.[c] === "0") candidates.push({ col: c, row: r });
}
}
}
currentKeyCell =
candidates[Math.floor(Math.random() * candidates.length)];
const p = cellToWorld(currentKeyCell.col, currentKeyCell.row);
mazeKey.position.set(p.x, 0.58, p.z);
mazeKey.material.rotation = 0;
}
function updateMazeKey(time) {
if (!mazeKey.visible || hasKey) return;
mazeKey.position.y =
0.58 + Math.sin(time * 0.0024) * 0.09;
mazeKey.material.rotation =
(time * 0.00135) % (Math.PI * 2);
}
function checkKeyPickup() {
if (!running || hasKey || !mazeKey.visible || isHiding) return;
const dx = camera.position.x - mazeKey.position.x;
const dz = camera.position.z - mazeKey.position.z;
if (Math.hypot(dx, dz) < 0.78) {
hasKey = true;
mazeKey.visible = false;
updateKeyHUD();
if (lockMessage) {
lockMessage.textContent = "KEY FOUND";
lockMessage.classList.remove("hidden");
clearTimeout(lockedDoorMessageTimeout);
lockedDoorMessageTimeout = setTimeout(
() => lockMessage.classList.add("hidden"),
1500
);
}
}
}
const exitDoor = new THREE.Group();
const exitDoorTexture = new THREE.TextureLoader().load(
"assets/environment/door.png"
);
exitDoorTexture.colorSpace = THREE.SRGBColorSpace;
exitDoorTexture.anisotropy = Math.min(
8,
renderer.capabilities.getMaxAnisotropy()
);
const exitDoorMaterial = new THREE.MeshStandardMaterial({
map: exitDoorTexture,
transparent: true,
alphaTest: 0.02,
roughness: 0.92,
metalness: 0.02,
side: THREE.DoubleSide
});
const exitDoorImage = new THREE.Mesh(
new THREE.PlaneGeometry(3.20, 3.55),
exitDoorMaterial
);
exitDoorImage.position.y = 1.45;
exitDoorImage.castShadow = true;
exitDoorImage.receiveShadow = true;
exitDoor.add(exitDoorImage);
const exitLight = new THREE.PointLight(
0xd6b58a,
0.28,
3.2,
2
);
exitLight.position.set(0, 1.65, 0.42);
exitDoor.add(exitLight);
scene.add(exitDoor);
const EXIT_LOCATIONS = [
  { col: 13, row: 5,  side: "N" }, // fixed
  { col: 11, row: 7,  side: "W" }, // fixed
  { col: 9,  row: 9,  side: "W" },
  { col: 7,  row: 11, side: "E" },
  { col: 9,  row: 11, side: "W" },
  { col: 7,  row: 13, side: "N" },
  { col: 13, row: 13, side: "E" },
  { col: 7,  row: 15, side: "W" },
  { col: 15, row: 15, side: "N" }  // fixed
];
let currentExitLocation = null;
let currentPlayerSpawn = null;
function getMazeDistance(start, target) {
const queue = [{ col: start.col, row: start.row, distance: 0 }];
const visited = new Set([`${start.col},${start.row}`]);
while (queue.length > 0) {
const current = queue.shift();
if (current.col === target.col && current.row === target.row) {
return current.distance;
}
for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]) {
const col = current.col + dc;
const row = current.row + dr;
const key = `${col},${row}`;
if (MAP[row]?.[col] === "0" && !visited.has(key)) {
visited.add(key);
queue.push({ col, row, distance: current.distance + 1 });
}
}
}
return Infinity;
}
function placeExitDoor() {
const MIN_EXIT_PATH_DISTANCE = 24;
let choices = EXIT_LOCATIONS.filter(location => {
if (!currentPlayerSpawn) return true;
return getMazeDistance(currentPlayerSpawn, location) >= MIN_EXIT_PATH_DISTANCE;
});
if (currentExitLocation && choices.length > 1) {
choices = choices.filter(location => location !== currentExitLocation);
}
if (choices.length === 0) {
choices = EXIT_LOCATIONS
.map(location => ({
location,
distance: currentPlayerSpawn
? getMazeDistance(currentPlayerSpawn, location)
: 0
}))
.sort((a, b) => b.distance - a.distance)
.slice(0, 4)
.map(item => item.location);
}
currentExitLocation =
choices[Math.floor(Math.random() * choices.length)];
const p = cellToWorld(
currentExitLocation.col,
currentExitLocation.row
);
let offsetX = 0;
let offsetZ = 0;
let rotation = 0;
const wallOffset = CELL / 2 - 0.035;
if (currentExitLocation.side === "N") {
offsetZ = -wallOffset;
rotation = 0;
}
if (currentExitLocation.side === "S") {
offsetZ = wallOffset;
rotation = Math.PI;
}
if (currentExitLocation.side === "E") {
offsetX = wallOffset;
rotation = -Math.PI / 2;
}
if (currentExitLocation.side === "W") {
offsetX = -wallOffset;
rotation = Math.PI / 2;
}
exitDoor.position.set(
p.x + offsetX,
0,
p.z + offsetZ
);
exitDoor.rotation.y = rotation;
}
function checkExit() {
if (!running || isHiding) return;
const dx = camera.position.x - exitDoor.position.x;
const dz = camera.position.z - exitDoor.position.z;
const distance = Math.hypot(dx, dz);
if (distance < 1.15) {
if (gameMode === "easy") {
winGame();
return;
}
if (hasKey) {
winGame();
return;
}
if (!lockedDoorMessageShown && lockMessage) {
lockedDoorMessageShown = true;
lockMessage.textContent = "THE DOOR IS LOCKED. FIND THE KEY.";
lockMessage.classList.remove("hidden");
clearTimeout(lockedDoorMessageTimeout);
lockedDoorMessageTimeout = setTimeout(() => {
lockMessage.classList.add("hidden");
}, 1900);
}
} else if (distance > 1.7) {
lockedDoorMessageShown = false;
}
}
const monster =
new THREE.Group();
const monsterTextureLoader = new THREE.TextureLoader();
const monsterTextures = [
monsterTextureLoader.load("assets/characters/monster.png"),
monsterTextureLoader.load("assets/characters/monster2.png")
];
for (const texture of monsterTextures) {
texture.colorSpace = THREE.SRGBColorSpace;
}
let lastMonsterIndex = -1;
const monsterMaterial =
new THREE.SpriteMaterial({
map: monsterTextures[0],
transparent: true,
alphaTest: 0.05,
color: 0x999999,
depthTest: true,
depthWrite: false
});
function randomizeMonsterAppearance() {
let choices = [0, 1];
if (lastMonsterIndex >= 0 && choices.length > 1) {
choices = choices.filter(index => index !== lastMonsterIndex);
}
const chosenIndex =
choices[Math.floor(Math.random() * choices.length)];
lastMonsterIndex = chosenIndex;
monsterMaterial.map = monsterTextures[chosenIndex];
monsterMaterial.needsUpdate = true;
const jumpScareImage = jumpScare.querySelector("img");
if (jumpScareImage) {
jumpScareImage.src =
chosenIndex === 0
? "assets/characters/monster.png"
: "assets/characters/monster2.png";
}
}
const monsterSprite =
new THREE.Sprite(
monsterMaterial
);
monsterSprite.scale.set(
1.3,
2.3,
1
);
monsterSprite.position.y =
1.15;
monster.add(
monsterSprite
);
scene.add(
monster
);
const keys =
Object.create(null);
addEventListener(
"keydown",
event => {
keys[event.code] = true;
if (
[
"ArrowUp",
"ArrowDown",
"ArrowLeft",
"ArrowRight",
"Space"
].includes(event.code)
) {
event.preventDefault();
}
}
);
addEventListener(
"keyup",
event => {
keys[event.code] = false;
}
);
let running = false;
let paused = false;
let pauseStartedAt = 0;
let yaw = 0;
let pitch = 0;
let stamina = 1;
let startedAt = 0;
let lastTime =
performance.now();
let monsterSpeed =
2.55;
let walkBobTime = 0;
let monsterBobTime = 0;
const CAMERA_HEIGHT =
1.62;
const MONSTER_BASE_Y =
1.15;
const PLAYER_RADIUS =
0.34;
const WALK_SPEED =
4.6;
const SPRINT_SPEED =
7.8;
const NORMAL_FOV =
75;
const SPRINT_FOV =
83;
const STAMINA_DRAIN =
0.25;
const STAMINA_RECOVERY =
0.17;
const STAMINA_RESTART =
1;
let sprintExhausted =
false;
let monsterPath = [];
let monsterPathIndex =
0;
let pathTimer =
0;
const PATH_UPDATE_TIME =
0.6;
const WAYPOINT_DISTANCE =
0.18;
function blocked(
x,
z,
radius = PLAYER_RADIUS,
includeLockers = false
) {
for (const b of wallBoxes) {
if (
x + radius > b.minX &&
x - radius < b.maxX &&
z + radius > b.minZ &&
z - radius < b.maxZ
) {
return true;
}
}

if (includeLockers) {
for (const b of lockerCollisionBoxes) {
if (
x + radius > b.minX &&
x - radius < b.maxX &&
z + radius > b.minZ &&
z - radius < b.maxZ
) {
return true;
}
}
}

return false;
}
function moveWithCollision(
obj,
dx,
dz,
radius,
includeLockers = false
) {
const nx =
obj.position.x + dx;
if (
!blocked(
nx,
obj.position.z,
radius,
includeLockers
)
) {
obj.position.x =
nx;
}
const nz =
obj.position.z + dz;
if (
!blocked(
obj.position.x,
nz,
radius,
includeLockers
)
) {
obj.position.z =
nz;
}
}
function isWalkable(
col,
row
) {
if (
col < 0 ||
col >= COLS ||
row < 0 ||
row >= ROWS
) {
return false;
}
return (
MAP[row][col] === "0"
);
}
function findPath(
start,
target
) {
if (
!isWalkable(
start.col,
start.row
)
||
!isWalkable(
target.col,
target.row
)
) {
return [];
}
const queue = [
{
col: start.col,
row: start.row
}
];
const visited =
new Set();
const cameFrom =
new Map();
const key =
(col, row) =>
`${col},${row}`;
visited.add(
key(
start.col,
start.row
)
);
const directions = [
[1, 0],
[-1, 0],
[0, 1],
[0, -1]
];
while (
queue.length > 0
) {
const current =
queue.shift();
if (
current.col ===
target.col
&&
current.row ===
target.row
) {
const path =
[];
let currentKey =
key(
current.col,
current.row
);
while (
cameFrom.has(
currentKey
)
) {
const [
col,
row
] =
currentKey
.split(",")
.map(Number);
path.push({
col,
row
});
currentKey =
cameFrom.get(
currentKey
);
}
path.reverse();
return path;
}
for (
const [dc, dr]
of directions
) {
const nextCol =
current.col + dc;
const nextRow =
current.row + dr;
if (
!isWalkable(
nextCol,
nextRow
)
) {
continue;
}
const nextKey =
key(
nextCol,
nextRow
);
if (
visited.has(
nextKey
)
) {
continue;
}
visited.add(
nextKey
);
cameFrom.set(
nextKey,
key(
current.col,
current.row
)
);
queue.push({
col: nextCol,
row: nextRow
});
}
}
return [];
}
function calculateMonsterPath() {
const monsterCell =
worldToCell(
monster.position.x,
monster.position.z
);
const playerCell =
worldToCell(
camera.position.x,
camera.position.z
);
monsterPath =
findPath(
monsterCell,
playerCell
);
monsterPathIndex =
0;
}
const PLAYER_SPAWNS = [
{ col: 2, row: 1 },
{ col: 11, row: 2 },
{ col: 20, row: 3 },
{ col: 2, row: 11 },
{ col: 20, row: 11 },
{ col: 3, row: 20 },
{ col: 11, row: 19 },
{ col: 20, row: 19 }
];
let lastPlayerSpawnIndex = -1;
function setSpawn() {
resetLockerState();
randomizeMonsterAppearance();
let spawnChoices = PLAYER_SPAWNS.map((spawn, index) => ({
...spawn,
index
}));
if (lastPlayerSpawnIndex >= 0 && spawnChoices.length > 1) {
spawnChoices = spawnChoices.filter(
spawn => spawn.index !== lastPlayerSpawnIndex
);
}
const chosenSpawn =
spawnChoices[Math.floor(Math.random() * spawnChoices.length)];
lastPlayerSpawnIndex = chosenSpawn.index;
currentPlayerSpawn = {
col: chosenSpawn.col,
row: chosenSpawn.row
};
placeExitDoor();
placeKey();
const playerSpawn =
cellToWorld(
chosenSpawn.col,
chosenSpawn.row
);
camera.position.set(
playerSpawn.x,
CAMERA_HEIGHT,
playerSpawn.z
);
yaw =
Math.PI;
pitch =
0;
camera.rotation.set(
pitch,
yaw,
0
);
camera.fov =
NORMAL_FOV;
camera
.updateProjectionMatrix();
let monsterChoices = PLAYER_SPAWNS.filter(spawn =>
getMazeDistance(currentPlayerSpawn, spawn) >= 24
);
if (monsterChoices.length === 0) {
monsterChoices = PLAYER_SPAWNS
.map(spawn => ({
...spawn,
distance: getMazeDistance(currentPlayerSpawn, spawn)
}))
.sort((a, b) => b.distance - a.distance)
.slice(0, 3);
}
const chosenMonsterSpawn =
monsterChoices[Math.floor(Math.random() * monsterChoices.length)];
const monsterSpawn =
cellToWorld(
chosenMonsterSpawn.col,
chosenMonsterSpawn.row
);
monster.position.set(
monsterSpawn.x,
0,
monsterSpawn.z
);
monsterSprite.position.y =
MONSTER_BASE_Y;
monsterSprite.material.rotation =
0;
monsterSpeed =
2.55;
stamina =
1;
sprintExhausted =
false;
walkBobTime =
0;
monsterBobTime =
0;
monsterPath =
[];
monsterPathIndex =
0;
pathTimer =
0;
if (sprintFill) {
sprintFill.style.transform =
"scaleX(1)";
}
if (survivalSprintFill) {
survivalSprintFill.style.transform = "scaleX(1)";
}
if (dangerEl) {
dangerEl.style.opacity =
"0";
}
}
function formatTime(ms) {
const total =
ms / 1000;
const min =
Math.floor(
total / 60
);
const sec =
Math.floor(
total % 60
);
const hun =
Math.floor(
(total % 1) *
100
);
return (
String(min)
.padStart(
2,
"0"
)
+
":"
+
String(sec)
.padStart(
2,
"0"
)
+
"."
+
String(hun)
.padStart(
2,
"0"
)
);
}
function clearMovementKeys() {
for (const code in keys) keys[code] = false;
}
function pauseGame() {
if (!running || paused) return;
paused = true;
pauseStartedAt = performance.now();
clearMovementKeys();
ambienceAudio.pause();
monsterAudio.pause();
breathingAudio.pause();
pauseScreen.classList.remove("hidden");
hud.classList.add("hidden");
crosshair.classList.add("hidden");
lockMessage?.classList.add("hidden");
document.exitPointerLock?.();
}
function resumeGame() {
if (!running || !paused) return;
startedAt += performance.now() - pauseStartedAt;
paused = false;
pauseScreen.classList.add("hidden");
hud.classList.remove("hidden");
crosshair.classList.remove("hidden");
ambienceAudio.play().catch(() => {});
monsterAudio.play().catch(() => {});
breathingAudio.play().catch(() => {});
lastTime = performance.now();
renderer.domElement.requestPointerLock();
}
function returnToMainMenu() {
resetFX();
resetLockerState();
tutorialScreen?.classList.add("hidden");
modeScreen?.classList.add("hidden");
creditsScreen?.classList.add("hidden");
leaderboardScreen?.classList.add("hidden");
running = false;
paused = false;
clearMovementKeys();
ambienceAudio.pause();
monsterAudio.pause();
breathingAudio.pause();
monsterAudio.volume = 0;
breathingAudio.volume = 0;
pauseScreen.classList.add("hidden");
gameOverScreen.classList.add("hidden");
winScreen.classList.add("hidden");
startScreen.classList.remove("hidden");
hud.classList.add("hidden");
crosshair.classList.add("hidden");
lockMessage?.classList.add("hidden");
if (dangerEl) dangerEl.style.opacity = "0";
camera.fov = NORMAL_FOV;
camera.updateProjectionMatrix();

document.exitPointerLock?.();
}
function beginGame() {
lastWinTimeMs = null;
scoreSubmittedForRun = false;
paused = false;
running = false;
resetFX();
pauseScreen.classList.add("hidden");
tutorialScreen?.classList.add("hidden");
clearMovementKeys();
winScreen.classList.add("hidden");
gameOverScreen.classList.add("hidden");
startScreen.classList.add("hidden");
hud.classList.add("hidden");
crosshair.classList.add("hidden");
applyModeHUD();
setSpawn();
timerEl.textContent = "00:00.00";
if (document.pointerLockElement !== renderer.domElement) {
  renderer.domElement.requestPointerLock();
}
objectiveCard.classList.remove("hidden");
setTimeout(() => {
if (paused || endingSequence || !objectiveCard || !objectiveCard.isConnected) return;
objectiveCard.classList.add("hidden");
startedAt = performance.now();
lastTime = performance.now();
running = true;
hud.classList.remove("hidden");
crosshair.classList.remove("hidden");
startGameAudio();
}, 1200);
}
function endGame() {
if (!running || endingSequence) return;
endingSequence = true;
running = false;
clearMovementKeys();
const survived = performance.now() - startedAt;
finalTimeEl.textContent = `SURVIVED ${formatTime(survived)}`;
hud.classList.add("hidden");
crosshair.classList.add("hidden");
ambienceAudio.pause();
monsterAudio.pause();
breathingAudio.pause();
jumpscareAudio.currentTime = 0;
jumpscareAudio.play().catch(() => {});
jumpScare.classList.remove("hidden");
jumpScare.classList.add("shake");
document.exitPointerLock?.();
setTimeout(() => {
jumpScare.classList.add("hidden");
jumpScare.classList.remove("shake");
endingSequence = false;
finishCaughtGame();
}, 900);
}
function winGame() {
if (!running || endingSequence) return;
endingSequence = true;
running = false;
clearMovementKeys();
const escapedIn = performance.now() - startedAt;
lastWinTimeMs = escapedIn;
autoSubmitLoraxedScore();
winTimeEl.textContent = `ESCAPED IN ${formatTime(escapedIn)}`;
hud.classList.add("hidden");
crosshair.classList.add("hidden");
monsterAudio.pause();
breathingAudio.pause();
doorAudio.currentTime = 0;
doorAudio.play().catch(() => {});
escapeFade.classList.remove("hidden");
requestAnimationFrame(() => escapeFade.classList.add("active"));
document.exitPointerLock?.();
setTimeout(() => {
ambienceAudio.pause();
escapeFade.classList.remove("active");
escapeFade.classList.add("hidden");
endingSequence = false;
finishWinGame();
}, 900);
}
function finishCaughtGame() {
resetLockerState();
running =
false;
paused = false;
pauseScreen.classList.add("hidden");
ambienceAudio.pause();
monsterAudio.pause();
breathingAudio.pause();
monsterAudio.volume = 0;
breathingAudio.volume = 0;
gameOverScreen
.classList
.remove(
"hidden"
);
hud
.classList
.add(
"hidden"
);
crosshair
.classList
.add(
"hidden"
);
if (dangerEl) {
dangerEl.style.opacity =
"0";
}
camera.fov =
NORMAL_FOV;
camera
.updateProjectionMatrix();
document
.exitPointerLock?.();
}
function finishWinGame() {
  resetLockerState();

  running = false;
  paused = false;

  pauseScreen.classList.add("hidden");

  ambienceAudio.pause();
  monsterAudio.pause();
  breathingAudio.pause();

  monsterAudio.volume = 0;
  breathingAudio.volume = 0;

  if (dangerEl) {
    dangerEl.style.opacity = "0";
  }

  hud.classList.add("hidden");
  crosshair.classList.add("hidden");
  gameOverScreen.classList.add("hidden");

  // Show win screen
  winScreen.classList.remove("hidden");

  // Only Easy winners get TRY HARD MODE
  tryHardBtn.style.display =
    gameMode === "easy" ? "" : "none";

  camera.fov = NORMAL_FOV;
  camera.updateProjectionMatrix();

  document.exitPointerLock?.();
}
retryBtn.addEventListener(
  "click",
  beginGame
);

playAgainBtn.addEventListener("click", () => {
  beginGame();
});

tryHardBtn.addEventListener("click", () => {
  winScreen.classList.add("hidden");

  gameMode = "hard";
  applyModeHUD();

  beginGame();
});

winMenuBtn.addEventListener("click", () => {
  returnToMainMenu();
});

resumeBtn.addEventListener("click", resumeGame);
restartBtn.addEventListener("click", beginGame);
startBtn.addEventListener("click", () => {
running = false;
paused = false;
resetFX();
startScreen.classList.add("hidden");
tutorialScreen.classList.add("hidden");
modeScreen.classList.remove("hidden");
hud.classList.add("hidden");
crosshair.classList.add("hidden");
});
function chooseDifficulty(mode) {
gameMode = mode;
applyModeHUD();
modeScreen.classList.add("hidden");
tutorialScreen.classList.remove("hidden");
}
easyModeBtn.addEventListener("click", () => chooseDifficulty("easy"));
hardModeBtn.addEventListener("click", () => chooseDifficulty("hard"));
tutorialStartBtn.addEventListener("click", () => {

  tutorialScreen.classList.add("hidden");

  // Lock the mouse NOW while we're still inside the player's click.
  renderer.domElement.requestPointerLock();

  startGameWithLoading();

});
mainMenuBtn.addEventListener("click", returnToMainMenu);
addEventListener("keydown", event => {
if (event.code === "KeyE" && running && !paused && !event.repeat) {
event.preventDefault();
if (isHiding) {
leaveLocker();
} else {
const locker = nearestLocker();
if (locker) enterLocker(locker);
}
}
if (event.code === "Escape" && paused) {
event.preventDefault();
resumeGame();
}
});
addEventListener(
"mousemove",
event => {
if (
!running ||
paused ||
document.pointerLockElement !==
renderer.domElement
) {
return;
}
yaw -=
event.movementX *
0.0022;
pitch -=
event.movementY *
0.002;
if (isHiding && activeLocker) {
const centerYaw = activeLocker.group.rotation.y + Math.PI;
yaw = THREE.MathUtils.clamp(
yaw,
centerYaw - LOCKER_LOOK_LIMIT,
centerYaw + LOCKER_LOOK_LIMIT
);
pitch = THREE.MathUtils.clamp(pitch, -0.10, 0.10);
} else {
pitch = THREE.MathUtils.clamp(
pitch,
-1.25,
1.25
);
}
camera.rotation.set(
pitch,
yaw,
0
);
}
);
renderer
.domElement
.addEventListener(
"click",
() => {
if (
running &&
!paused &&
document.pointerLockElement !==
renderer.domElement
) {
renderer
.domElement
.requestPointerLock();
}
}
);
document.addEventListener("pointerlockchange", () => {
const locked = document.pointerLockElement === renderer.domElement;
if (running && !paused && !locked) pauseGame();
lockMessage?.classList.add("hidden");
});
function updatePlayer(dt) {
if (isHiding) return;
let forward =
0;
let strafe =
0;
if (
keys.KeyW ||
keys.ArrowUp
) {
forward +=
1;
}
if (
keys.KeyS ||
keys.ArrowDown
) {
forward -=
1;
}
if (
keys.KeyD ||
keys.ArrowRight
) {
strafe +=
1;
}
if (
keys.KeyA ||
keys.ArrowLeft
) {
strafe -=
1;
}
const moving =
forward !== 0 ||
strafe !== 0;
const shiftHeld =
keys.ShiftLeft ||
keys.ShiftRight;
const wantsSprint =
shiftHeld &&
forward > 0 &&
moving;
if (
stamina <= 0.001
) {
sprintExhausted =
true;
}
if (
sprintExhausted &&
stamina >= STAMINA_RESTART
) {
sprintExhausted =
false;
}
const sprinting =
wantsSprint &&
!sprintExhausted &&
stamina > 0;
if (sprinting) {
stamina =
Math.max(
0,
stamina -
dt *
STAMINA_DRAIN
);
} else {
stamina =
Math.min(
1,
stamina +
dt *
STAMINA_RECOVERY
);
}
if (sprintFill) {
sprintFill.style.transform =
`scaleX(${stamina})`;
}
if (survivalSprintFill) {
survivalSprintFill.style.transform =
`scaleX(${stamina})`;
}
let breathingVolume = 0;
if (stamina < 0.45) {
breathingVolume =
THREE.MathUtils.clamp(
(0.45 - stamina) / 0.45,
0,
1
);
}
breathingAudio.volume =
breathingVolume * 0.75;
const targetFOV =
sprinting
? SPRINT_FOV
: NORMAL_FOV;
camera.fov +=
(
targetFOV -
camera.fov
)
*
Math.min(
1,
dt * 8
);
camera
.updateProjectionMatrix();
if (moving) {
const bobSpeed =
sprinting
? 16
: 10;
const bobAmount =
sprinting
? 0.075
: 0.035;
walkBobTime +=
dt *
bobSpeed;
camera.position.y =
CAMERA_HEIGHT +
Math.sin(
walkBobTime
)
*
bobAmount;
} else {
camera.position.y +=
(
CAMERA_HEIGHT -
camera.position.y
)
*
Math.min(
1,
dt * 10
);
}
if (!moving) {
return;
}
const length =
Math.hypot(
forward,
strafe
);
forward /=
length;
strafe /=
length;
const speed =
sprinting
? SPRINT_SPEED
: WALK_SPEED;
const sin =
Math.sin(yaw);
const cos =
Math.cos(yaw);
const dx =
(
-sin *
forward
+
cos *
strafe
)
*
speed *
dt;
const dz =
(
-cos *
forward
-
sin *
strafe
)
*
speed *
dt;
moveWithCollision(
camera,
dx,
dz,
PLAYER_RADIUS,
true
);
}
function updateMonster(dt) {
monsterBobTime +=
dt * 12;
monsterSprite.position.y =
MONSTER_BASE_Y +
Math.abs(
Math.sin(
monsterBobTime
)
)
*
0.08;
monsterSprite.material.rotation =
Math.sin(
monsterBobTime *
0.5
)
*
0.025;
if (isHiding) {
antiCampRetargetTimer -= dt;
if (!antiCampTarget || antiCampRetargetTimer <= 0) {
antiCampTarget = chooseAntiCampTarget();
antiCampRetargetTimer = 4 + Math.random() * 3;
monsterPath = [];
monsterPathIndex = 0;
pathTimer = 0;
}
pathTimer -= dt;
if (pathTimer <= 0 || monsterPath.length === 0 || monsterPathIndex >= monsterPath.length) {
calculateMonsterPathTo(antiCampTarget);
pathTimer = PATH_UPDATE_TIME;
}
if (monsterPath.length > 0 && monsterPathIndex < monsterPath.length) {
const targetCell = monsterPath[monsterPathIndex];
const targetWorld = cellToWorld(targetCell.col, targetCell.row);
const dx = targetWorld.x - monster.position.x;
const dz = targetWorld.z - monster.position.z;
const distance = Math.hypot(dx, dz);
if (distance < WAYPOINT_DISTANCE) {
monsterPathIndex++;
} else if (distance > 0.001) {
const hideMoveSpeed = Math.max(2.8, monsterSpeed * 0.82);
moveWithCollision(
monster,
(dx / distance) * hideMoveSpeed * dt,
(dz / distance) * hideMoveSpeed * dt,
0.30
);
}
}
const hiddenDistance = Math.hypot(
camera.position.x - monster.position.x,
camera.position.z - monster.position.z
);
monsterAudio.volume = THREE.MathUtils.clamp(1 - hiddenDistance / 18, 0, 1) * 0.65;
if (dangerEl) dangerEl.style.opacity = "0";
renderer.domElement.style.transform = "";
return;
}
const playerDX =
camera.position.x -
monster.position.x;
const playerDZ =
camera.position.z -
monster.position.z;
const playerDistance =
Math.hypot(
playerDX,
playerDZ
);
const monsterAudioDistance = 18;
const monsterVolume =
THREE.MathUtils.clamp(
1 -
playerDistance /
monsterAudioDistance,
0,
1
);
monsterAudio.volume =
monsterVolume * 0.85;
if (dangerEl) {
const dangerDistance =
10;
const dangerStrength =
THREE.MathUtils.clamp(
1 -
playerDistance /
dangerDistance,
0,
1
);
const pulse =
0.85 +
Math.sin(
performance.now() *
0.012
)
*
0.15;
dangerEl.style.opacity =
dangerStrength *
0.78 *
pulse;
}
const shakeStrength = THREE.MathUtils.clamp(1 - playerDistance / 6, 0, 1);
if (shakeStrength > 0) {
const sx = (Math.random() - 0.5) * 5 * shakeStrength;
const sy = (Math.random() - 0.5) * 4 * shakeStrength;
renderer.domElement.style.transform = `translate(${sx}px, ${sy}px) scale(1.006)`;
} else {
renderer.domElement.style.transform = "";
}
const survivalSeconds = Math.max(0, (performance.now() - startedAt) / 1000);
monsterSpeed = Math.min(5.5, 2.55 + survivalSeconds * 0.028);
const monsterCell =
worldToCell(
monster.position.x,
monster.position.z
);
const playerCell =
worldToCell(
camera.position.x,
camera.position.z
);
const sameCell =
monsterCell.col ===
playerCell.col
&&
monsterCell.row ===
playerCell.row;
if (
sameCell ||
playerDistance < 3.2
) {
if (
playerDistance >
0.001
) {
const moveX =
(
playerDX /
playerDistance
)
*
monsterSpeed *
dt;
const moveZ =
(
playerDZ /
playerDistance
)
*
monsterSpeed *
dt;
moveWithCollision(
monster,
moveX,
moveZ,
0.30
);
}
}
else {
pathTimer -=
dt;
if (
pathTimer <= 0 ||
monsterPath.length === 0 ||
monsterPathIndex >=
monsterPath.length
) {
calculateMonsterPath();
pathTimer =
PATH_UPDATE_TIME;
}
if (
monsterPath.length > 0 &&
monsterPathIndex <
monsterPath.length
) {
const targetCell =
monsterPath[
monsterPathIndex
];
const targetWorld =
cellToWorld(
targetCell.col,
targetCell.row
);
const dx =
targetWorld.x -
monster.position.x;
const dz =
targetWorld.z -
monster.position.z;
const distance =
Math.hypot(
dx,
dz
);
if (
distance <
WAYPOINT_DISTANCE
) {
monsterPathIndex++;
}
else {
const moveX =
(
dx /
distance
)
*
monsterSpeed *
dt;
const moveZ =
(
dz /
distance
)
*
monsterSpeed *
dt;
moveWithCollision(
monster,
moveX,
moveZ,
0.30
);
}
}
}
const finalDX =
camera.position.x -
monster.position.x;
const finalDZ =
camera.position.z -
monster.position.z;
const finalDistance =
Math.hypot(
finalDX,
finalDZ
);
if (
finalDistance <
0.95
) {
endGame();
}
}
function startGameAudio() {
ambienceAudio.currentTime = 0;
monsterAudio.currentTime = 0;
breathingAudio.currentTime = 0;
ambienceAudio.play().catch(() => {});
monsterAudio.play().catch(() => {});
breathingAudio.play().catch(() => {});
}
function updateLights(dt) {
const time = performance.now() * 0.001;
const monsterDistanceToPlayer = Math.hypot(
camera.position.x - monster.position.x,
camera.position.z - monster.position.z
);
const monsterPanic = THREE.MathUtils.clamp(
1 - monsterDistanceToPlayer / 13,
0,
1
);
for (const data of mazeLights) {
data.nextFlicker -= dt;
data.burstTimer = Math.max(0, data.burstTimer - dt);
if (data.state === "dead") {
const deadFlash =
monsterPanic > 0.72 &&
Math.random() < dt * 0.8;
data.light.intensity = deadFlash ? 0.12 : 0;
data.tubeMaterial.emissiveIntensity = deadFlash ? 0.18 : 0.015;
continue;
}
const normalWobble =
Math.sin(time * 17 + data.flickerOffset) *
(data.state === "unstable" ? 0.11 : 0.035);
let intensity = Math.max(0, data.baseIntensity + normalWobble);
if (data.nextFlicker <= 0) {
const glitchChance =
data.state === "unstable" ? 0.72 :
data.state === "dim" ? 0.38 : 0.22;
if (Math.random() < glitchChance) {
data.burstTimer = 0.05 + Math.random() * 0.20;
data.burstStrength = Math.random();
}
data.nextFlicker =
data.state === "unstable"
? 0.35 + Math.random() * 2.2
: 1.3 + Math.random() * 5.2;
}
if (data.burstTimer > 0) {
intensity *=
data.burstStrength < 0.72
? 0.03 + Math.random() * 0.18
: 1.25 + Math.random() * 0.65;
}
if (monsterPanic > 0) {
const lightToMonster = Math.hypot(
data.position.x - monster.position.x,
data.position.z - monster.position.z
);
const localPanic = THREE.MathUtils.clamp(
1 - lightToMonster / 9,
0,
1
) * monsterPanic;
if (localPanic > 0) {
const electricalNoise =
0.55 +
Math.abs(Math.sin(time * (24 + data.flickerOffset % 12))) * 0.65;
intensity *= THREE.MathUtils.lerp(1, electricalNoise, localPanic);
if (Math.random() < dt * (1.2 + localPanic * 8)) {
intensity *= Math.random() < 0.76 ? 0.04 : 1.65;
}
}
}
data.light.intensity = Math.max(0, intensity);
data.tubeMaterial.emissiveIntensity = THREE.MathUtils.clamp(
data.light.intensity * 1.45,
0.025,
2.35
);
}
}
function animate(time) {
updateHorrorFilter();
const dt =
Math.min(
(
time -
lastTime
)
/
1000,
0.05
);
lastTime =
time;
updateMazeKey(time);
if (running && !paused) {
updateLockerSystem();
updatePlayer(dt);
checkKeyPickup();
updateMonster(dt);
updateLights(dt);
randomScareTimer -= dt;
if (randomScareTimer <= 0) {
triggerRandomScare();
randomScareTimer = 12 + Math.random() * 18;
}
checkExit();
timerEl.textContent =
formatTime(
performance.now() -
startedAt
);
}
renderer.render(
scene,
camera
);
requestAnimationFrame(
animate
);
}
requestAnimationFrame(
animate
);
addEventListener(
"resize",
() => {
camera.aspect =
innerWidth /
innerHeight;
camera
.updateProjectionMatrix();
renderer.setSize(
innerWidth,
innerHeight
);
}
);
applyModeHUD();
setSpawn();
renderer.render(
scene,
camera
);
