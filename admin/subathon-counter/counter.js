import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {getDatabase,ref,onValue,runTransaction,set,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import {FIREBASE} from '/shared/config.js';
import {START,CHANNEL,normalize,mergeRecord,totalRecords} from './core.mjs?v=counter-20261029';
const CLIENT='ube5lbxw2yje55kku6hckuturx6s0g',REDIRECT='https://chambergames.app/admin/subathon-counter/';
const PATH='archives/subathonCounter/2026-10-29',TOKEN='subathon-twitch-token',PENDING='subathon-pending-20261029',STATE='subathon-oauth-state';
const $=id=>document.getElementById(id),app=getApps().find(a=>a.name==='caption')||initializeApp(FIREBASE,'caption'),auth=getAuth(app),db=getDatabase(app);
let token='',userId='',broadcaster='',socket=null,stopped=true,subscribed=false,adminReady=false,dbConnected=false,retryTimer=null,retries=0,heartbeatTimer=null,offset=0,collectors={},writing=false;
let pending=[];try{pending=JSON.parse(sessionStorage.getItem(PENDING)||'[]');if(!Array.isArray(pending))pending=[];}catch{}
const collectorId=sessionStorage.getItem('subathon-collector')||crypto.randomUUID();sessionStorage.setItem('subathon-collector',collectorId);
const now=()=>Date.now()+offset;
function phase(){const before=now()<START;const active=Object.values(collectors).some(c=>c.connected&&now()-c.at<45000);$('shared-status').textContent=!dbConnected?'Shared counter offline — reconnecting…':active?'Production listener connected.':before?'Connect Twitch on the production computer before the start.':'No active production listener — new announcements may be missed.';}
function savePending(){try{sessionStorage.setItem(PENDING,JSON.stringify(pending));}catch{$('error').textContent='Local backup is unavailable. Keep this page open.';}}
async function flush(){if(writing||!adminReady||!dbConnected)return;writing=true;try{while(pending.length){const e=pending[0];await runTransaction(ref(db,PATH+'/events/'+e.key),old=>mergeRecord(old,e),{applyLocally:false});pending.shift();savePending();}}catch{$('error').textContent='Saving interrupted. Received announcements are queued on this computer.';}finally{writing=false;}}
async function heartbeat(){if(!adminReady||!dbConnected)return;try{await set(ref(db,PATH+'/collectors/'+collectorId),{connected:subscribed&&!stopped,at:serverTimestamp()});}catch{}}
async function api(path,options={}){const response=await fetch('https://api.twitch.tv/helix/'+path,{...options,headers:{'Client-Id':CLIENT,'Authorization':'Bearer '+token,'Content-Type':'application/json',...(options.headers||{})}});if(response.status===401){sessionStorage.removeItem(TOKEN);throw Error('Twitch sign-in expired. Click Connect Twitch again.');}if(!response.ok)throw Error('Twitch connection failed ('+response.status+'). Try connecting again.');return response.json();}
async function validate(){const response=await fetch('https://id.twitch.tv/oauth2/validate',{headers:{Authorization:'OAuth '+token}});if(!response.ok)throw Error('Twitch sign-in expired. Click Connect Twitch again.');const v=await response.json();if(v.client_id!==CLIENT||!v.scopes?.includes('user:read:chat'))throw Error('Connect Twitch and approve read-chat access.');userId=v.user_id;return v;}
function disconnected(){subscribed=false;heartbeat();$('connection').textContent=stopped?'Disconnected on this computer.':'Reconnecting to Twitch…';if(now()>=START&&!stopped)$('error').textContent='Twitch connection interrupted. Announcements during the gap may be missed.';phase();}
function reconnect(){if(stopped||retryTimer)return;retryTimer=setTimeout(()=>{retryTimer=null;openSocket();},Math.min(30000,1000*2**Math.min(retries++,5)));}
function openSocket(url='wss://eventsub.wss.twitch.tv/ws?keepalive_timeout_seconds=30',old=null){
 if(stopped)return;
 let ws,watchdog,handedOver=false;
 try{const u=new URL(url);if(u.protocol!=='wss:'||u.hostname!=='eventsub.wss.twitch.tv')throw Error('Invalid Twitch reconnect address');ws=new WebSocket(url);}catch{disconnected();reconnect();return;}
 const watch=()=>{clearTimeout(watchdog);watchdog=setTimeout(()=>ws.close(),45000);};watch();
 if(!old)socket=ws;
 ws.onmessage=async message=>{watch();let packet;try{packet=JSON.parse(message.data);}catch{return;}
  const type=packet.metadata?.message_type;
  try{
   if(type==='session_welcome'){
    if(stopped){ws.close();return;}
    if(!old)await api('eventsub/subscriptions',{method:'POST',body:JSON.stringify({type:'channel.chat.notification',version:'1',condition:{broadcaster_user_id:broadcaster,user_id:userId},transport:{method:'websocket',session_id:packet.payload.session.id}})});
    else{socket=ws;old.handoff=true;old.close();}
    if(stopped){ws.close();return;}socket=ws;subscribed=true;retries=0;$('connection').textContent='Connected to Christina & Amber’s Twitch announcements.';$('connect').hidden=true;$('disconnect').hidden=false;heartbeat();phase();
   }else if(type==='notification'){
    if(packet.metadata.subscription_type!=='channel.chat.notification')return;
    const entry=normalize(packet.payload.event,packet.metadata,broadcaster);
    if(entry){pending.push(entry);savePending();flush();}
   }else if(type==='session_reconnect'){
    if(!handedOver){handedOver=true;openSocket(packet.payload.session.reconnect_url,ws);}
   }else if(type==='revocation'){throw Error('Twitch permission was revoked. Connect Twitch again.');}
  }catch(error){$('error').textContent=error.message;stop();$('connect').hidden=false;$('connect').disabled=false;}
 };
 ws.onclose=()=>{clearTimeout(watchdog);if(ws.handoff)return;if(old&&socket!==ws){old.close();return;}if(socket!==ws)return;disconnected();reconnect();};
 ws.onerror=()=>ws.close();
}
function stop(){stopped=true;subscribed=false;clearTimeout(retryTimer);retryTimer=null;if(socket){socket.close();socket=null;}clearInterval(heartbeatTimer);heartbeat();$('connect').hidden=false;$('disconnect').hidden=true;$('connection').textContent='Disconnected on this computer.';phase();}
async function start(){if(!adminReady)return;try{$('error').textContent='';$('connect').disabled=true;const v=await validate();const users=await api('users?login='+CHANNEL);broadcaster=users.data?.[0]?.id;if(!broadcaster)throw Error('Channel not found.');stopped=false;openSocket();clearInterval(heartbeatTimer);heartbeatTimer=setInterval(heartbeat,15000);}catch(error){sessionStorage.removeItem(TOKEN);token='';$('error').textContent=error.message;stop();}finally{$('connect').disabled=false;}}
$('connect').onclick=()=>{if(token){start();return;}const state=crypto.randomUUID();sessionStorage.setItem(STATE,JSON.stringify({state,at:Date.now()}));const params=new URLSearchParams({client_id:CLIENT,redirect_uri:REDIRECT,response_type:'token',scope:'user:read:chat',state});location.assign('https://id.twitch.tv/oauth2/authorize?'+params);};
$('disconnect').onclick=()=>{stop();sessionStorage.removeItem(TOKEN);token='';};
const hash=new URLSearchParams(location.hash.slice(1));
if(hash.has('access_token')||hash.has('error')){
 history.replaceState(null,'',location.pathname);
 try{const saved=JSON.parse(sessionStorage.getItem(STATE)||'null');sessionStorage.removeItem(STATE);if(!saved||saved.state!==hash.get('state')||Date.now()-saved.at>600000)throw Error('Sign-in verification failed. Connect Twitch again.');if(hash.has('error'))throw Error('Twitch connection was not approved.');token=hash.get('access_token');sessionStorage.setItem(TOKEN,token);}catch(error){$('error').textContent=error.message;}
}else token=sessionStorage.getItem(TOKEN)||'';
onValue(ref(db,'.info/serverTimeOffset'),s=>{offset=s.val()||0;phase();});
onValue(ref(db,'.info/connected'),s=>{dbConnected=s.val()===true;phase();flush();heartbeat();});
onAuthStateChanged(auth,async user=>{
 if(!user||(await user.getIdTokenResult()).claims.hoppersPlayer){location.replace('/admin/login.html?next=/admin/subathon-counter/');return;}
 adminReady=true;sessionStorage.setItem('chamber-admin-session',user.email||'Admin');$('connect').disabled=false;
 onValue(ref(db,PATH+'/events'),s=>{$('total').textContent=totalRecords(s.val()).toLocaleString('en-US');},()=>{$('error').textContent='Shared counter access failed. Sign in with your Firebase admin account.';});
 onValue(ref(db,PATH+'/collectors'),s=>{collectors=s.val()||{};phase();});flush();if(token)start();
});
setInterval(phase,5000);setInterval(flush,5000);
setInterval(async()=>{if(!stopped&&token)try{await validate();}catch(error){$('error').textContent=error.message;stop();sessionStorage.removeItem(TOKEN);token='';}},3600000);

const clocks=[['clock-la','America/Los_Angeles'],['clock-uae','Asia/Dubai'],['clock-pl','Europe/Warsaw']].map(([id,timeZone])=>({id,format:new Intl.DateTimeFormat('en-GB',{timeZone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'})}));
function updateClocks(){const date=new Date(now());for(const clock of clocks)$(clock.id).textContent=clock.format.format(date).replace(':','.');}
updateClocks();setInterval(updateClocks,1000);
