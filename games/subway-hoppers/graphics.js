// Automatic quality: no player configuration or saved overrides.
export function createGraphics(renderer,canvas,camera){
 let scale=1.75,width=1,height=1,elapsed=0,frames=0,slow=0,fast=0;
 const cap=()=>Math.max(1,Math.min(devicePixelRatio||1,2,Math.sqrt(3000000/(width*height))));
 function reset(){elapsed=frames=slow=fast=0;}
 function apply(){scale=Math.min(cap(),Math.max(1,scale));renderer.setPixelRatio(scale);renderer.setSize(width,height,false);canvas.dataset.renderScale=scale.toFixed(2);}
 function resize(){
  const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
  width=rect.width;height=rect.height;camera.aspect=width/height;
  const portrait=Math.max(0,Math.min(1,(1-camera.aspect)/.55));
  camera.fov=64+14*portrait;camera.position.z=8.5+3.7*portrait;
  camera.updateProjectionMatrix();reset();apply();
 }
 new ResizeObserver(resize).observe(canvas);
 document.addEventListener('visibilitychange',reset);
 return {fps:60,sample(ms,running){
  if(!running||ms<=0||ms>250){reset();return;}
  elapsed+=ms;frames++;if(elapsed<3000)return;
  const average=elapsed/frames;
  slow=average>26?slow+1:0;fast=average<22?fast+1:0;elapsed=frames=0;
  if(slow>=2&&scale>1){scale=Math.max(1,scale-.25);reset();apply();}
  else if(fast>=3&&scale<cap()){scale=Math.min(cap(),scale+.25);reset();apply();}
 }};
}
