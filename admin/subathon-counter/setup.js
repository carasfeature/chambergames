const ENDPOINT='https://chamber-production-counter.swer538.chatgpt.site/api/counter',REDIRECT='https://chambergames.app/admin/subathon-counter/setup.html',STATE='subathon-server-oauth';
const $=id=>document.getElementById(id);let clientId='';
async function api(body){const token=sessionStorage.getItem('chamber-admin-token');if(!token||!sessionStorage.getItem('chamber-admin-session')){location.replace('/admin/login.html?next=/admin/subathon-counter/');throw Error('Sign in to admin first.');}const r=await fetch(ENDPOINT,{method:body?'POST':'GET',cache:'no-store',headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});if(r.status===401){location.replace('/admin/login.html?next=/admin/subathon-counter/');throw Error('Sign in to admin again.');}const d=await r.json();if(!r.ok)throw Error(d.error||'Connection failed. Please retry.');return d;}
async function refresh(){const d=await api();clientId=d.server?.clientId||'';const enabled=d.server?.status==='enabled';$('settings').hidden=!!clientId;$('authorize').hidden=!clientId||enabled;$('status').textContent=enabled?'Server counting connected. You can close all pages.':clientId?'App saved. Authorize Twitch with your moderator account.':'Enter the new confidential Twitch app’s Client ID and Client Secret.';return enabled;}
$('settings').onsubmit=async e=>{e.preventDefault();$('error').textContent='';const button=e.submitter;button.disabled=true;try{await api({action:'server-config',clientId:$('client-id').value.trim(),clientSecret:$('client-secret').value.trim()});$('client-secret').value='';await refresh();}catch(e){$('error').textContent=e.message;}finally{button.disabled=false;}};
$('authorize').onclick=()=>{const state=crypto.randomUUID();sessionStorage.setItem(STATE,JSON.stringify({state,at:Date.now()}));location.assign('https://id.twitch.tv/oauth2/authorize?'+new URLSearchParams({client_id:clientId,redirect_uri:REDIRECT,response_type:'token',scope:'user:read:chat user:bot',state}));};
const hash=new URLSearchParams(location.hash.slice(1));
async function boot(){try{if(hash.has('access_token')||hash.has('error')){history.replaceState(null,'',location.pathname);const saved=JSON.parse(sessionStorage.getItem(STATE)||'null');sessionStorage.removeItem(STATE);if(!saved||saved.state!==hash.get('state')||Date.now()-saved.at>600000)throw Error('Authorization check failed. Please try again.');if(hash.has('error'))throw Error('Twitch authorization was not approved.');$('status').textContent='Connecting Twitch to the server…';await api({action:'server-authorize',token:hash.get('access_token')});hash.delete('access_token');}await refresh();}catch(e){$('error').textContent=e.message;$('status').textContent='Server setup is not complete.';}}
const query=new URLSearchParams(location.search);
if(query.has('code')||query.get('state')?.startsWith('active-')){
 (async()=>{
  const code=query.get('code'),state=query.get('state');history.replaceState(null,'',location.pathname);
  $('settings').hidden=true;$('authorize').hidden=true;document.querySelector('h1').textContent='Connect channel total';$('status').textContent='Connecting channel subscriptions…';
  try{
   const saved=JSON.parse(sessionStorage.getItem('active-subs-oauth')||'null');sessionStorage.removeItem('active-subs-oauth');
   if(!saved||saved.state!==state||Date.now()-saved.at>600000)throw Error('Authorization expired. Return to the counter and connect again.');
   if(query.has('error'))throw Error('Twitch authorization was not approved.');
   await api({action:'active-subs-authorize',code,state});location.replace('./');
  }catch(error){$('status').textContent='Channel total is not connected.';$('error').textContent=error.message;}
 })();
}else{boot();setInterval(()=>refresh().catch(()=>{}),5000);}
