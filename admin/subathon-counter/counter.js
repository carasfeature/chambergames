import {START,CHANNEL,normalize} from './core.mjs?v=counter-20261029';
const CLIENT='ube5lbxw2yje55kku6hckuturx6s0g',REDIRECT='https://chambergames.app/admin/subathon-counter/';
const ENDPOINT='https://chamber-production-counter.swer538.chatgpt.site/api/counter',TOKEN='subathon-twitch-token',PENDING='subathon-pending-20261029',STATE='subathon-oauth-state';
const $=id=>document.getElementById(id);
let token='',userId='',broadcaster='',socket=null,stopped=true,subscribed=false,adminReady=false,dbConnected=false,retryTimer=null,retries=0,heartbeatTimer=null,offset=0,collectors={},writing=false;
let pending=[];try{pending=JSON.parse(sessionStorage.getItem(PENDING)||'[]');if(!Array.isArray(pending))pending=[];}catch{}
const collectorId=sessionStorage.getItem('subathon-collector')||crypto.randomUUID();sessionStorage.setItem('subathon-collector',collectorId);
const now=()=>Date.now()+offset;
function phase(){const before=now()<START;const active=Object.values(collectors).some(c=>c.connected&&now()-c.at<45000);$('shared-status').textContent=!dbConnected?'Shared counter offline — reconnecting…':active?'Production listener connected.':before?'Connect Twitch on the production computer before the start.':'No active production listener — new announcements may be missed.';}
function savePending(){try{sessionStorage.setItem(PENDING,JSON.stringify(pending));}catch{$('error').textContent='Local backup is unavailable. Keep this page open.';}}
async function shared(data){
 const adminToken=sessionStorage.getItem('chamber-admin-token');
 if(!adminToken||!sessionStorage.getItem('chamber-admin-session')){location.replace('/admin/login.html?next=/admin/subathon-counter/');throw Error('Admin login required.');}
 const response=await fetch(ENDPOINT,{method:data?'POST':'GET',cache:'no-store',headers:{Authorization:'Bearer '+adminToken,...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})});
 if(response.status===401){sessionStorage.removeItem('chamber-admin-token');location.replace('/admin/login.html?next=/admin/subathon-counter/');throw Error('Admin login expired.');}
 if(!response.ok)throw Error('Shared counter connection interrupted.');return response.json();
}
let polling=false;
async function refresh(){if(polling)return;polling=true;try{const state=await shared();dbConnected=true;offset=state.now-Date.now();collectors=state.collectors||{};$('total').textContent=state.total.toLocaleString('en-US');if(!adminReady){adminReady=true;$('connect').disabled=false;if(token)start();}flush();}catch{dbConnected=false;}finally{polling=false;phase();}}
async function flush(){if(writing||!adminReady||!dbConnected)return;writing=true;try{while(pending.length){const batch=pending.slice(0,100);await shared({action:'events',events:batch});pending.splice(0,batch.length);savePending();}if($('error').textContent.startsWith('Saving interrupted.'))$('error').textContent='';}catch{$('error').textContent='Saving interrupted. Received announcements are queued on this computer.';}finally{writing=false;}}
async function heartbeat(){if(!adminReady)return;try{await shared({action:'heartbeat',id:collectorId,connected:subscribed&&!stopped});refresh();}catch{}}
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
refresh();setInterval(refresh,2000);
setInterval(phase,5000);setInterval(flush,5000);
setInterval(async()=>{if(!stopped&&token)try{await validate();}catch(error){$('error').textContent=error.message;stop();sessionStorage.removeItem(TOKEN);token='';}},3600000);

const clocks=[['clock-la','America/Los_Angeles'],['clock-uae','Asia/Dubai'],['clock-pl','Europe/Warsaw']].map(([id,timeZone])=>({id,format:new Intl.DateTimeFormat('en-US',{timeZone,hour:'numeric',minute:'2-digit',second:'2-digit',hour12:true})}));
function updateClocks(){const date=new Date(now());for(const clock of clocks)$(clock.id).textContent=clock.format.formatToParts(date).filter(part=>part.type!=='literal'||part.value===':').map(part=>part.value).join('');}
updateClocks();setInterval(updateClocks,1000);
