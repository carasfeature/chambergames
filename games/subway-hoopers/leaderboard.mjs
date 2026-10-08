export function rankedScores(data) {
  return Object.entries(data || {}).filter(([name,v]) => /^[a-z0-9_]{2,25}$/.test(name) && Number.isSafeInteger(v?.score) && v.score > 0)
    .map(([name,v]) => ({name,score:v.score})).sort((a,b)=>b.score-a.score || a.name.localeCompare(b.name,'en'));
}
export function currentPlayer() {
  try { const user=JSON.parse(localStorage.getItem('twitchUser')); const name=String(user?.login || '').toLowerCase();return /^[a-z0-9_]{2,25}$/.test(name)?name:null; } catch {return null;}
}
let api, db, stop, busy=false, initializing, retryTimer, scores={}, pending={};
const pendingKey='chamber.hoopers.pending.v1';
const $=id=>document.getElementById(id);
function persist(){try{localStorage.setItem(pendingKey,JSON.stringify(pending));}catch{}}
function row(entry,index){const li=document.createElement('li');li.className='board-row';li.classList.toggle('is-you',entry.name===currentPlayer());for(const value of [`${index+1}.`,entry.name,`${entry.score.toLocaleString('en-US')}m`]){const span=document.createElement('span');span.textContent=value;li.append(span);}return li;}
function render(){
  const ranked=rankedScores(scores),name=currentPlayer();
  $('board-left').replaceChildren(...ranked.slice(0,10).map((e,i)=>row(e,i)));
  $('board-right').replaceChildren(...ranked.slice(10,20).map((e,i)=>row(e,i+10)));
  const index=ranked.findIndex(e=>e.name===name),own=$('board-self');own.replaceChildren();own.hidden=index<20;
  if(index>=20){const list=document.createElement('ol');list.append(row(ranked[index],index));own.append(list);}
  if(!name)$('score-status').textContent='Log in with Twitch on the main website to save your best run.';
}
function retry(){clearTimeout(retryTimer);retryTimer=setTimeout(connect,15000);}
async function connect(){
  if(initializing)return initializing;
  initializing=(async()=>{
    try {
      if(!api){const [app,database]=await Promise.all([import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js')]);api=database;db=api.getDatabase(app.initializeApp({apiKey:'AIzaSyAdx6UIx2mHwqbK4KPKnXolbgmUcCR1Wvg',databaseURL:'https://lobby-claim-default-rtdb.europe-west1.firebasedatabase.app',projectId:'lobby-claim'},'subway-hoopers'));}
      if(stop)stop();
      stop=api.onValue(api.ref(db,'subwayHoopers'),snap=>{scores=snap.val()||{};render();$('board-status').textContent=rankedScores(scores).length?'TOP 20 · BEST DISTANCE':'No scores yet. Be the first!';},error=>{
        $('board-status').textContent=error.code?.includes('PERMISSION')?'Leaderboard unavailable: Firebase rules need updating.':'Connection interrupted. Retrying…';retry();
      });
      await flush();
    }catch{ $('board-status').textContent='Unable to connect. Retrying…';retry(); }
    finally{initializing=null;}
  })();return initializing;
}
async function flush(){
  if(!api||!db||busy)return;
  const name=currentPlayer(),score=pending[name];if(!name||name!==currentPlayer()||!Number.isSafeInteger(score)||score<1)return;
  busy=true;$('score-status').textContent='Saving your best run…';
  try{
    await api.runTransaction(api.ref(db,`subwayHoopers/${name}`),old=>old?.score>=score?undefined:{score,updatedAt:api.serverTimestamp()},{applyLocally:false});
    if(pending[name]===score)delete pending[name];persist();$('score-status').textContent='Your best run is saved.';
  }catch{ $('score-status').textContent='Score not saved online yet. It is queued on this device; retry when connected and Firebase rules are enabled.';retry(); }
  finally{busy=false;}
  if(pending[name]>score)flush();
}
export function submitRun(name,score){
  if(!name||!Number.isSafeInteger(score)||score<1)return;
  pending[name]=Math.max(pending[name]||0,score);persist();flush();
}
if(typeof document!=='undefined'){
  try{const stored=JSON.parse(localStorage.getItem(pendingKey));if(stored&&typeof stored==='object')pending=stored;}catch{}
  $('board-retry').addEventListener('click',connect);window.addEventListener('online',connect);
  window.addEventListener('storage',()=>{render();flush();});render();connect();
}
