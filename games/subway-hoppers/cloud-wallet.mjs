import {initialWallet} from './wallet-shape.mjs';
const ENDPOINT='https://europe-west1-lobby-claim.cloudfunctions.net/hoppersAccount';
const CDN='https://www.gstatic.com/firebasejs/10.12.0/';
export async function createCloudWallet({sdk,storage=localStorage,endpoint=ENDPOINT}={}){
 const [{initializeApp},{getAuth,signInWithCustomToken,signOut,inMemoryPersistence,setPersistence}]=sdk??await Promise.all([import(CDN+'firebase-app.js'),import(CDN+'firebase-auth.js')]);
 const app=initializeApp({apiKey:'AIzaSyAdx6UIx2mHwqbK4KPKnXolbgmUcCR1Wvg',authDomain:'lobby-claim.firebaseapp.com',projectId:'lobby-claim'},'hoppers-wallet');
 const auth=getAuth(app);await setPersistence(auth,inMemoryPersistence);
 let data=initialWallet(),uid=null,sourceToken=null,validatedAt=0,error='',busy=false,pending=null,active=null,needsRestart=false,chain=Promise.resolve();
 const listeners=new Set(),emit=()=>listeners.forEach(f=>f());
 const getToken=()=>storage.getItem('twitchToken');
 async function login(){
  const token=getToken();if(!token)throw Error('Log in with Twitch on the main website to save your progress.');
  if(sourceToken===token&&auth.currentUser&&Date.now()-validatedAt<50*60000)return;
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',token}),signal:AbortSignal.timeout(20000)});
  const reply=await response.json();if(!response.ok)throw Error(reply.error||'Could not verify Twitch login');
  if(uid&&reply.uid!==uid){await signOut(auth);throw Error('Account changed. Reload the game to continue.');}
  await signInWithCustomToken(auth,reply.token);uid=reply.uid;sourceToken=token;validatedAt=Date.now();
 }
 function key(){return 'chamber.hoppers.account.v1.'+uid;}
 function save(){storage.setItem(key(),JSON.stringify({pending,active}));}
 async function request(body){
  await login();const token=await auth.currentUser.getIdToken();
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
  const reply=await response.json();if(!response.ok){if(response.status===401)validatedAt=0;const e=Error(reply.error||'Could not save');e.definitive=response.status===409||response.status===400;throw e;}
  if(getToken()!==sourceToken)throw Error('Account changed. Reload the game.');
  if(reply.wallet)data={...initialWallet(),...reply.wallet,armed:reply.wallet.armed||[],skins:reply.wallet.skins||[]};
  return reply;
 }
 async function sendPending(){
  if(!pending)return null;
  const op=pending;
  try{const reply=await request(op);pending=null;
   if(op.action==='start'){reply.result.load??=[];active={...reply.result,seq:0,frames:[]};}
   if(op.action==='checkpoint'&&active){active.seq=reply.result.seq;active.frames.splice(0,op.args.frames.length);}
   save();return reply.result;
  }catch(e){
   if(e.definitive){
    pending=null;await request({action:'wallet'});
    if(op.action==='checkpoint'){
     if(e.message==='Account changed. Refresh and try again.'&&(op.recoveryAttempts||0)<2){
      pending={...op,expectedRevision:data.revision,recoveryAttempts:(op.recoveryAttempts||0)+1};save();return sendPending();
     }
     // Retire only this client's rejected run. Never invent rewards or end another device's run.
     const runId=active?.runId;
     active=null;needsRestart=true;save();
     if(runId&&e.message!=='Run no longer active'){
      try{await request({id:crypto.randomUUID(),action:'finish',args:{runId},expectedRevision:data.revision});}catch(f){if(!f.definitive)throw f;}
     }
     return null;
    }
    save();
   }
   throw e;
  }
 }
 function serial(task){const next=chain.then(async()=>{busy=true;emit();try{const result=await task();error='';return result;}catch(e){error=e.message;return false;}finally{busy=false;emit();}});chain=next.then(()=>{},()=>{});return next;}
 async function mutate(action,args={}){
  if(pending)await sendPending();
  pending={id:crypto.randomUUID(),action,args,expectedRevision:data.revision};save();
  return sendPending();
 }
 async function flushFrames(){
  if(pending)await sendPending();
  while(active?.frames.length){const frames=active.frames.slice(0,300);await mutate('checkpoint',{runId:active.runId,seq:active.seq+1,frames});}
  return true;
 }
 await login();
 const stored=JSON.parse(storage.getItem(key())||'null');pending=stored?.pending??null;active=stored?.active??null;
 await request({action:'wallet'});
 if(pending)await sendPending();
 if(active?.frames.length)await flushFrames();
 let actions=[],lastFlush=0;
 const api={
  cloud:true,get needsRestart(){return needsRestart;},get state(){return structuredClone(data);},get persisted(){return !error;},get error(){return error;},get busy(){return busy;},
  subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
  buy:item=>serial(async()=>{await mutate('buy',{item});return true;}),
  buySkin:item=>serial(async()=>{await mutate('buy',{item});return true;}),
  equipSkin:item=>serial(async()=>{await mutate('equip',{item});return true;}),
  arm:item=>serial(async()=>{await mutate('arm',{item});return true;}),
  async startRun(mode){return serial(async()=>{if(pending?.action==='start'){const result=await sendPending();actions=[];needsRestart=false;return result;}await flushFrames();if(active)await mutate('finish',{runId:active.runId});const result=await mutate('start',{mode,version:'account-store-1'});actions=[];needsRestart=false;return result;});},
  payForRevive:()=>serial(async()=>{await flushFrames();await mutate('revive',{runId:active?.runId});return true;}),
  award(){return false;},
  recordAction(action){if(active)actions.push(action);},
  recordFrame(dt,status){if(!active)return;active.frames.push({dt,actions:actions.splice(0)});
   if(Date.now()-lastFlush>2000||status==='over'){lastFlush=Date.now();save();if(!busy)serial(flushFrames);}
  },
  flush:()=>serial(flushFrames),
  retry:()=>serial(async()=>{await flushFrames();await request({action:'wallet'});return true;})
 };
 window.addEventListener('online',()=>api.retry());
 document.addEventListener('visibilitychange',()=>{if(document.hidden){save();api.flush();}});
 window.addEventListener('pagehide',save);
 window.addEventListener('storage',e=>{if(e.key==='twitchToken'&&e.newValue!==sourceToken){error='Account changed. Reload the game.';data=initialWallet();emit();signOut(auth);}});
 return api;
}
