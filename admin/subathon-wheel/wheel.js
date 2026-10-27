import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {getDatabase,ref,onValue,runTransaction,set,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {FIREBASE} from '/shared/config.js';
const app=getApps().find(a=>a.name==='caption')||initializeApp(FIREBASE,'caption'),db=getDatabase(app),auth=getAuth(app);
let ready=false,connected=false,adminUser=null;
const $=id=>document.getElementById(id),rotor=$('rotor'),spin=$('spin'),result=$('result');
const key='chamberwood-food-wheel-v1';let foods=['Ahlgrens Candy', 'Larvets', 'Clam Juice', 'Thick Water with Sausages Broth', 'Snails', '1000 Year Old Egg', 'Octopus', 'Safe', 'Drink or Shot', 'TikTok Dance Challenge', 'Shocktato Part 2'],last='',rotation=0,busy=false,used=new Set();
const svgNS='http://www.w3.org/2000/svg';
function point(angle,r=280){const t=angle*Math.PI/180;return [300+r*Math.cos(t),300+r*Math.sin(t)];}
function svg(tag,attrs){const el=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;}
function draw(){rotor.replaceChildren();rotor.removeAttribute('transform');const list=foods.length?foods:Array(12).fill('');const step=360/list.length;list.forEach((name,i)=>{const angle=-90+i*step,p=point(angle-step/2),q=point(angle+step/2);const g=svg('g',{class:'slice'+(used.has(i)?' used':''),'data-index':i});const colors=['#a72027','#c1a050','#262522','#eee0b7'];if(list.length===1)g.append(svg('circle',{cx:300,cy:300,r:280,fill:colors[0]}));else g.append(svg('path',{d:'M300 300L'+p.join(' ')+'A280 280 0 '+(step>180?1:0)+' 1 '+q.join(' ')+'Z',fill:colors[i%4],stroke:'#353026','stroke-width':1.6}));const pos=point(angle,190),anchor=svg('g',{transform:'translate('+pos.join(' ')+')'}),label=svg('text',{'text-anchor':'middle',class:'upright-label',fill:i%4===1||i%4===3?'#272521':'#fff4d9'});if(!name){label.textContent='✦';}else{const words=name.split(/\s+/),lines=[''];for(const w of words){if((lines.at(-1)+' '+w).trim().length>15&&lines.at(-1))lines.push(w);else lines[lines.length-1]=(lines.at(-1)+' '+w).trim();}lines.forEach((l,j)=>{const t=svg('tspan',{x:0,y:(j-(lines.length-1)/2)*16+5});t.textContent=l;label.append(t);});}anchor.append(label);g.append(anchor);rotor.append(g);});positionWheel(rotation);updateControls();}
function available(){return foods.map((_,i)=>i).filter(i=>!used.has(i));}
function updateControls(){spin.disabled=busy||!ready||!connected||!available().length;spin.textContent='SPIN';renderRestoreControls();}
// Animation and unbiased random selection adapted from the existing main wheel.
function positionWheel(angle){rotor.setAttribute('transform','rotate('+angle+' 300 300)');rotor.querySelectorAll('.upright-label').forEach(label=>label.setAttribute('transform','rotate('+(-angle)+')'));}
function animateWheel(from,to,duration){return new Promise(resolve=>{let start;function frame(now){if(start===undefined)start=now;const t=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-t,4);positionWheel(from+(to-from)*eased);if(t<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});}
function randomIndex(n){const data=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(data);}while(data[0]>=limit);return data[0]%n;}
spin.onclick=async()=>{
 if(busy||!ready||!connected)return;
 busy=true;updateControls();spin.textContent='SPINNING…';
 try{
  let selected;
  while(available().length){
   const eligible=available(),candidate=eligible[randomIndex(eligible.length)];
   const claim=await runTransaction(ref(db,'subathonWheel/tiles/'+candidate),value=>value?.used?undefined:{used:true,pickedAt:serverTimestamp()},{applyLocally:false});
   if(claim.committed){selected=candidate;break;}
   used.add(candidate);
  }
  if(selected===undefined)return;
  $('status').textContent='AND THE NEXT COURSE IS…';
  const step=360/foods.length,target=(360-selected*step)%360,delta=(target-rotation%360+360)%360,finish=rotation+360*6+delta;
  await animateWheel(rotation,finish,matchMedia('(prefers-reduced-motion: reduce)').matches?150:5500);
  rotation=finish%360;last=foods[selected];$('current').textContent=last;$('result-title').textContent=last;result.showModal();
 }catch(error){$('status').textContent='CONNECTION ERROR — PLEASE TRY AGAIN';console.error(error);}
 finally{busy=false;draw();if(connected)$('status').textContent='EVERY 1,000 SUBS • ONE SPIN';}
};
result.addEventListener('close',()=>spin.focus());draw();

function renderRestoreControls(){
 const container=$('restore-tiles');if(!container)return;
 container.replaceChildren();$('restore-controls').hidden=!used.size;
 for(const i of used){
  const button=document.createElement('button');button.type='button';button.textContent='Restore '+foods[i];button.disabled=!adminUser||!connected;
  button.style.cssText='display:block;width:100%;margin-top:10px';
  button.onclick=async()=>{button.disabled=true;try{await set(ref(db,'subathonWheel/tiles/'+i),{used:false,pickedAt:serverTimestamp()});}catch(error){$('restore-error').textContent='Could not restore tile. Check your admin sign-in.';renderRestoreControls();}};
  container.append(button);
 }
}
onValue(ref(db,'.info/connected'),snapshot=>{connected=snapshot.val()===true;updateControls();});
onValue(ref(db,'subathonWheel/tiles'),snapshot=>{
 const tiles=snapshot.val()||{};used=new Set(foods.map((_,i)=>tiles[i]?.used?i:-1).filter(i=>i>=0));ready=true;
 if(!busy)draw();else renderRestoreControls();
},error=>{ready=false;updateControls();$('status').textContent='WHEEL CONNECTION UNAVAILABLE';});
if($('restore-tiles')){
 onAuthStateChanged(auth,async user=>{
  adminUser=user&&!(await user.getIdTokenResult()).claims.hoppersPlayer?user:null;
  if(!adminUser){window.top.location.href='/admin/login.html?next=/admin/subathon-wheel/';return;}
  renderRestoreControls();
 });
}
