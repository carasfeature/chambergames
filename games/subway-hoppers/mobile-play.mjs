// Keep a full-viewport fallback for phones without native fullscreen.
export function createMobilePlay({distance,onPause}){
 const root=document.documentElement;
 const mobile=()=>matchMedia('(pointer:coarse), (max-width:700px)').matches;
 let active=false,ownsFullscreen=false,generation=0,savedX=0,savedY=0;
 const attributes=['role','tabindex','aria-label'];
 const original=attributes.map(name=>distance.getAttribute(name));
 const properties=['--run-scroll-top','--run-height','--run-width','--run-top','--run-left'];
 function measure(){
  if(!active)return;
  const viewport=window.visualViewport;
  root.style.setProperty('--run-height',(viewport?.height||window.innerHeight)+'px');
  root.style.setProperty('--run-width',(viewport?.width||window.innerWidth)+'px');
  root.style.setProperty('--run-top',(viewport?.offsetTop||0)+'px');
  root.style.setProperty('--run-left',(viewport?.offsetLeft||0)+'px');
 }
 function restoreScroll(token){if(!active&&generation===token)window.scrollTo(savedX,savedY);}
 function exit(){
  if(!active)return;
  active=false;const token=++generation;
  root.classList.remove('mobile-playing');
  properties.forEach(name=>root.style.removeProperty(name));
  attributes.forEach((name,i)=>original[i]===null?distance.removeAttribute(name):distance.setAttribute(name,original[i]));
  restoreScroll(token);
  if(ownsFullscreen&&document.fullscreenElement===root){
   ownsFullscreen=false;
   try{Promise.resolve(document.exitFullscreen()).catch(()=>{}).finally(()=>restoreScroll(token));}catch{}
  }
 }
 function enter(){
  if(active||!mobile())return;
  savedX=window.scrollX;savedY=window.scrollY;active=true;
  const token=++generation;
  root.style.setProperty('--run-scroll-top',(-savedY)+'px');
  root.classList.add('mobile-playing');measure();
  distance.setAttribute('role','button');distance.setAttribute('tabindex','0');
  distance.setAttribute('aria-label','Pause game');
  // Called directly by START / Resume / Try again to retain user activation.
  if(!document.fullscreenElement&&document.fullscreenEnabled&&root.requestFullscreen){
   try{
    Promise.resolve(root.requestFullscreen({navigationUI:'hide'})).then(()=>{
     if(document.fullscreenElement!==root)return;
     ownsFullscreen=true;
     if(!active&&generation!==token){
      ownsFullscreen=false;
      return Promise.resolve(document.exitFullscreen()).finally(()=>restoreScroll(generation));
     }
     measure();
    }).catch(()=>{});
   }catch{}
  }
 }
 function pause(){if(active)onPause();}
 distance.addEventListener('click',pause);
 distance.addEventListener('keydown',event=>{
  if(active&&(event.key==='Enter'||event.key===' ')){
   event.preventDefault();event.stopPropagation();pause();
  }
 });
 const blockScroll=event=>{if(active&&event.cancelable)event.preventDefault();};
 document.addEventListener('touchmove',blockScroll,{passive:false,capture:true});
 document.addEventListener('wheel',blockScroll,{passive:false,capture:true});
 document.addEventListener('fullscreenchange',()=>{
  if(document.fullscreenElement===root&&active){ownsFullscreen=true;measure();}
  else if(active&&ownsFullscreen){ownsFullscreen=false;pause();}
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
 window.addEventListener('pagehide',()=>{pause();exit();});
 window.addEventListener('resize',measure);
 window.visualViewport?.addEventListener('resize',measure);
 window.visualViewport?.addEventListener('scroll',measure);
 return {enter,sync:status=>{if(status!=='running')exit();}};
}
