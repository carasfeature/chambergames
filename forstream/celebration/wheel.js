// Add the celebration outcomes here when the final list is ready.
const challenges = [];
const rotor=document.getElementById('rotor'), spin=document.getElementById('spin'), result=document.getElementById('result');
const svgNS='http://www.w3.org/2000/svg', step=360/(challenges.length||10);
let rotation=0, busy=false;
function point(angle,r=280){const t=angle*Math.PI/180;return [300+r*Math.cos(t),300+r*Math.sin(t)];}
function svg(tag,attrs){const el=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;}
function describe(i){if(busy)return;document.getElementById('hint-title').textContent=challenges[i].name;document.getElementById('hint-description').textContent=challenges[i].description;}
challenges.forEach((item,i)=>{
 const angle=-90+i*step, p=point(angle-step/2),q=point(angle+step/2);
 const group=svg('g',{class:'slice',role:'button',tabindex:'0','aria-label':item.name+': '+item.description});
 const path=svg('path',{d:'M300 300L'+p.join(' ')+'A280 280 0 0 1 '+q.join(' ')+'Z',fill:i%2?'#69775d':'#817e78',stroke:'#c0c3bb','stroke-width':1.4});
 group.append(path);
 const pos=point(angle,193),anchor=svg('g',{transform:'translate('+pos.join(' ')+')'}),label=svg('text',{'text-anchor':'middle',class:'upright-label'});
 item.lines.forEach((line,j)=>{const span=svg('tspan',{x:0,y:(j-(item.lines.length-1)/2)*21+5});span.textContent=line;label.append(span);});
 anchor.append(label);group.append(anchor);group.addEventListener('pointerenter',()=>describe(i));group.addEventListener('focus',()=>describe(i));group.addEventListener('click',()=>describe(i));
 group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();describe(i);}});
 rotor.append(group);
});
const wheelLabels=[...rotor.querySelectorAll('.upright-label')];
function positionWheel(angle){
 rotor.setAttribute('transform','rotate('+angle+' 300 300)');
 wheelLabels.forEach(label=>label.setAttribute('transform','rotate('+(-angle)+')'));
}
function animateWheel(from,to,duration){
 return new Promise(resolve=>{
  let start;
  function frame(now){
   if(start===undefined)start=now;
   const t=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-t,4);
   positionWheel(from+(to-from)*eased);
   if(t<1)requestAnimationFrame(frame);else resolve();
  }
  requestAnimationFrame(frame);
 });
}
function randomIndex(n){
 const data=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;
 do{crypto.getRandomValues(data);}while(data[0]>=limit);
 return data[0]%n;
}
spin.addEventListener('click',async()=>{
 if(busy||!challenges.length)return;busy=true;spin.disabled=true;spin.textContent='SPINNING…';rotor.classList.add('spinning');
 const selected=randomIndex(challenges.length),target=(360-selected*step)%360;
 const delta=(target-rotation%360+360)%360,finish=rotation+360*6+delta;
 const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?150:5500;
 await animateWheel(rotation,finish,duration);
 rotation=finish%360;positionWheel(rotation);
 await new Promise(resolve=>setTimeout(resolve,2000));
 busy=false;rotor.classList.remove('spinning');spin.disabled=false;spin.textContent='SPIN THE WHEEL';
 describe(selected);
 document.getElementById('result-title').textContent=challenges[selected].name;
 document.getElementById('result-description').textContent=challenges[selected].description;
 result.showModal();
});

spin.disabled=!challenges.length;
if(challenges.length)spin.textContent="SPIN THE WHEEL";
if(!challenges.length){
 for(let i=0;i<10;i++){
  const angle=-90+i*36,p=point(angle-18),q=point(angle+18);
  rotor.append(svg('path',{d:'M300 300L'+p.join(' ')+'A280 280 0 0 1 '+q.join(' ')+'Z',fill:i%2?'#69775d':'#817e78',stroke:'#b8bcb3','stroke-width':1}));
  const pos=point(angle,205);
  rotor.append(svg('path',{d:'M0 -8L3 -3L8 0L3 3L0 8L-3 3L-8 0L-3 -3Z',transform:'translate('+pos.join(' ')+')',fill:'#d5d9d1',opacity:'.55'}));
 }
 spin.disabled=true;spin.textContent='COMING SOON';
}
result.addEventListener('close',()=>spin.focus());

