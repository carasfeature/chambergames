const MODE_KEY='chamber.hoppers.mobile-graphics.v1';
export function mobileGraphicsMode(){
 if(!matchMedia('(pointer:coarse)').matches)return 'quality';
 const requested=new URL(location.href).searchParams.get('mobileGraphics');
 if(requested==='quality'||requested==='performance')return requested;
 try{return localStorage.getItem(MODE_KEY)==='performance'?'performance':'quality';}catch{return 'quality';}
}
export function createGraphicsToggle(mode){
 const group=document.createElement('div');group.className='mobile-graphics';
 group.setAttribute('role','group');group.setAttribute('aria-label','Mobile graphics');
 for(const value of ['quality','performance']){
  const button=document.createElement('button');button.type='button';button.textContent=value.toUpperCase();
  button.setAttribute('aria-pressed',String(mode===value));
  button.onclick=()=>{if(value===mode)return;
   try{localStorage.setItem(MODE_KEY,value);}catch{}
   const url=new URL(location.href);url.searchParams.set('mobileGraphics',value);location.replace(url.href);
  };group.append(button);
 }
 const note=document.createElement('small');note.textContent='Switching graphics reloads the game. Choose before a run.';group.append(note);
 document.querySelector('.game-controls').after(group);
 return {sync(status){group.hidden=!matchMedia('(pointer:coarse)').matches||status==='running'||status==='paused';}};
}
export function createGraphics(renderer,canvas,camera,mode='quality'){
 const performance=mode==='performance',minimum=performance?.75:1;
 let scale=performance?Math.min(devicePixelRatio||1,1.25):1.75,width=1,height=1,elapsed=0,frames=0,slow=0,fast=0;
 const cap=()=>performance?Math.min(devicePixelRatio||1,1.25):Math.max(1,Math.min(devicePixelRatio||1,2,Math.sqrt(3000000/(width*height))));
 function reset(){elapsed=frames=slow=fast=0;}
 function apply(){scale=Math.min(cap(),Math.max(minimum,scale));renderer.setPixelRatio(scale);renderer.setSize(width,height,false);canvas.dataset.renderScale=scale.toFixed(2);}
 function resize(){
  const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
  width=rect.width;height=rect.height;camera.aspect=width/height;
  const portrait=Math.max(0,Math.min(1,(1-camera.aspect)/.55));
  camera.fov=performance?(camera.aspect<1?Math.min(94,64/camera.aspect):64):64+14*portrait;camera.position.z=performance?8.5:8.5+3.7*portrait;
  camera.updateProjectionMatrix();reset();apply();
 }
 new ResizeObserver(resize).observe(canvas);
 document.addEventListener('visibilitychange',reset);
 return {fps:60,sample(ms,running){
  if(!running||ms<=0||ms>250){reset();return;}
  elapsed+=ms;frames++;if(elapsed<3000)return;
  const average=elapsed/frames;
  slow=average>(performance?23:26)?slow+1:0;fast=average<22?fast+1:0;elapsed=frames=0;
  if(slow>=2&&scale>minimum){scale=Math.max(minimum,scale-.25);reset();apply();}
  else if(!performance&&fast>=3&&scale<cap()){scale=Math.min(cap(),scale+.25);reset();apply();}
 }};
}
