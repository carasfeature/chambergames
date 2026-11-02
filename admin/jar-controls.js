(()=>{
 const endpoint='https://sub-leaves-jar-control.swer538.chatgpt.site/api/control';
 const storageKey='chamber-jar-control-key';
 const byId=id=>document.getElementById(id);
 const form=byId('connect-form'),input=byId('control-key'),connected=byId('connected'),status=byId('connection-status'),message=byId('jar-message');
 const buttons=[byId('show-jar'),byId('hide-jar')];
 let key='',busy=false,polling=false,pending=null,generation=0;
 try{if(!sessionStorage.getItem('chamber-admin-session'))return;key=sessionStorage.getItem(storageKey)||'';}catch{}
 const save=()=>{try{key?sessionStorage.setItem(storageKey,key):sessionStorage.removeItem(storageKey);}catch{}};
 function render(){form.hidden=!!key;connected.hidden=!key;buttons.forEach(b=>b.disabled=busy||!key);}
 async function request(method,body){
  const response=await fetch(endpoint,{method,headers:{'Authorization':'Bearer '+key,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(12000)});
  if(!response.ok){if(response.status===401){key='';save();render();throw new Error('Control key not accepted. Please reconnect.');}throw new Error('Control service unavailable. Please try again.');}
  return response.json();
 }
 async function refresh(){
  if(!key||busy||polling||byId('jar-controls').hidden||document.hidden)return;
  polling=true;const current=generation;
  try{const data=await request('GET');if(current!==generation)return;status.textContent=data.online?'Jar overlay connected.':'Jar overlay is offline. Open it in StreamElements to receive commands.';
   if(pending&&data.ack===pending.id){message.textContent=(pending.action==='show'?'Show':'Hide')+' received by jar.';pending=null;}
  }catch(e){if(current===generation)status.textContent=e.message;}finally{polling=false;}
 }
 byId('open-jar').onclick=()=>{const panel=byId('jar-controls');panel.hidden=!panel.hidden;byId('open-jar').setAttribute('aria-expanded',String(!panel.hidden));refresh();};
 form.onsubmit=async event=>{
  event.preventDefault();if(busy)return;let value=input.value.trim();if(value.includes('#'))value=value.slice(value.indexOf('#')+1);
  if(!value){message.textContent='Enter your control key.';return;}
  key=value;busy=true;form.querySelector('button').disabled=true;message.textContent='Connecting…';
  try{const data=await request('GET');save();input.value='';message.textContent='Connected.';status.textContent=data.online?'Jar overlay connected.':'Jar overlay is offline.';}
  catch(e){key='';save();message.textContent=e.message;}
  finally{busy=false;form.querySelector('button').disabled=false;render();}
 };
 async function send(action){
  if(busy||!key)return;busy=true;render();message.textContent='Sending…';
  try{const data=await request('POST',{action});if(!data.ok||!data.id)throw new Error('Command was not confirmed. Please try again.');pending={id:data.id,action};message.textContent=(action==='show'?'Show':'Hide')+' sent. Waiting for the jar to receive it.';}
  catch(e){message.textContent=e.message||'Could not send command.';}
  finally{busy=false;render();refresh();}
 }
 buttons[0].onclick=()=>send('show');buttons[1].onclick=()=>send('hide');
 byId('disconnect').onclick=()=>{generation++;key='';pending=null;save();input.value='';message.textContent='Disconnected.';render();};
 render();setInterval(refresh,5000);document.addEventListener('visibilitychange',refresh);
})();
