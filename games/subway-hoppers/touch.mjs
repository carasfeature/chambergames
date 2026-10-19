// One action per swipe, fired at the threshold rather than on finger release.
export function swipeAction(dx,dy,threshold=24){
 if(Math.max(Math.abs(dx),Math.abs(dy))<threshold)return null;
 if(Math.abs(dx)>Math.abs(dy)*1.2)return dx<0?'left':'right';
 if(-dy>Math.abs(dx)*1.2)return 'jump';
 return null;
}
export function bindSwipes(canvas,act,isRunning){
 let touch=null;
 canvas.addEventListener('pointerdown',e=>{
  if(!e.isPrimary||!isRunning())return;
  touch={id:e.pointerId,x:e.clientX,y:e.clientY,done:false};
  canvas.setPointerCapture(e.pointerId);
 });
 canvas.addEventListener('pointermove',e=>{
  if(!touch||touch.id!==e.pointerId||touch.done)return;
  const action=swipeAction(e.clientX-touch.x,e.clientY-touch.y);
  if(action){touch.done=true;if(isRunning())act(action);}
 });
 const clear=e=>{if(touch?.id===e.pointerId)touch=null;};
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,clear);
 document.addEventListener('visibilitychange',()=>{touch=null;});
}
