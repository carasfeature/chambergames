import assert from 'node:assert/strict';
import {Run,SAND_HEIGHT} from '../games/subway-hoppers/physics.mjs';
import {bindSwipes,swipeAction} from '../games/subway-hoppers/touch.mjs';
function emptyRun(){const r=new Run(()=>.3,process.env.HOPPERS_MODE||'standard');r.status='running';r.nextRow=1e9;r.obstacles=[];r.rows=[];r.pickups=[];return r;}
for(const fps of [10,15,20,30,60,90,120]){
 const dt=1/fps;
 // Feet above the pile: lateral movement must not collide with an invisible wall.
 const high=emptyRun();high.obstacles=[{type:'sand',x:0,at:0,z:0}];high.x=-2;high.lane=0;high.y=3.6;high.grounded=false;high.update(dt);
 assert.equal(high.status,'running',`airborne sand entry at ${fps}fps: ${high.reason}`);
 // Keep the solid sand side and front dangerous at ground level.
 const low=emptyRun();low.obstacles=[{type:'sand',x:0,at:0,z:0}];low.x=-2;low.lane=0;low.update(dt);assert.equal(low.status,'over');
 const front=emptyRun();front.obstacles=[{type:'sand',x:0,at:9,z:-9}];for(let i=0;i<fps&&front.status==='running';i++)front.update(dt);assert.equal(front.status,'over');
 // Land on top without falling through, then leave the shortened rear safely.
 const landing=emptyRun();landing.obstacles=[{type:'sand',x:0,at:3,z:-3}];landing.y=SAND_HEIGHT+.05;landing.vy=-1;landing.grounded=false;
 landing.update(dt);assert.equal(landing.status,'running');
 for(let i=0;i<fps;i++)landing.update(dt);assert.equal(landing.status,'running');
 const rear=emptyRun();rear.obstacles=[{type:'sand',x:0,at:-7,z:7}];rear.x=-2;rear.lane=0;rear.update(dt);assert.equal(rear.status,'running');
 // Cactus clearance is physical; kangaroos still require burger shoes.
 for(const [type,y,burger,survives] of [['cactus',2.3,false,true],['cactus',0,false,false],['roo',2.3,false,false],['roo',2.3,true,true]]){
  const r=emptyRun();r.obstacles=[{type,x:0,at:type==='roo'?2:0,z:0}];r.y=y;r.grounded=y===0;r.burgerJump=burger;r.update(dt);assert.equal(r.status==='running',survives,`${type} at ${fps}fps`);
 }
 const shoes=emptyRun();shoes.powers.burger=.001;shoes.jump();shoes.update(dt);assert.equal(shoes.burgerJump,true,'expiry must not change an airborne burger jump');
 const flight=emptyRun();flight.y=6.2;flight.grounded=false;flight.flightLanding=true;flight.powers.beer=.001;flight.obstacles=[{type:'cactus',x:0,at:10,z:-10}];for(let i=0;i<fps*2;i++)flight.update(dt);assert.equal(flight.status,'running');assert.equal(flight.flightLanding,false);
 const paused=emptyRun();paused.jump();paused.status='paused';const before=[paused.y,paused.distance,paused.vy];paused.update(dt);assert.deepEqual([paused.y,paused.distance,paused.vy],before);
}
// Full jump trajectories, including uneven mobile frame delivery.
for(const frames of [[1/15],[1/30],[1/60],[1/120],[.016,.05,.025,.1,.008]]){
 for(const [type,at] of [['cactus',10],['sand',18]]){
  const r=emptyRun();r.obstacles=[{type,x:0,at,z:-at}];r.jump();
  for(let i=0;r.time<2&&r.status==='running';i++)r.update(frames[i%frames.length]);
  assert.equal(r.status,'running',`full ${type} jump with ${frames}: ${r.reason}`);
  assert.equal(r.grounded,true);
 }
}
const handlers={},actions=[];let running=true;
globalThis.document={addEventListener(){}};
const canvas={addEventListener:(type,fn)=>handlers[type]=fn,setPointerCapture(){}};
const resetSwipe=bindSwipes(canvas,a=>actions.push(a),()=>running);
const event=(x,y)=>({isPrimary:true,pointerId:1,clientX:x,clientY:y});
handlers.pointerdown(event(100,100));handlers.pointerup(event(100,50));assert.deepEqual(actions,['jump'],'final pointerup movement must count');
handlers.pointerdown(event(100,100));handlers.pointermove(event(150,100));handlers.pointerup(event(180,100));assert.deepEqual(actions,['jump','right'],'one action per gesture');
handlers.pointerdown(event(100,100));handlers.pointercancel(event(100,50));assert.equal(actions.length,2);
handlers.pointerdown(event(100,100));running=false;handlers.pointerup(event(100,50));assert.equal(actions.length,2);
running=true;handlers.pointerdown(event(100,100));resetSwipe();handlers.pointerup(event(100,50));assert.equal(actions.length,2,'paused swipe cannot leak into resumed run');
assert.equal(swipeAction(0,10),null);assert.equal(swipeAction(0,30),'down');
console.log('PASS: collisions and power expiry at 10–120fps; sand top/side/front/rear; cactus and kangaroo rules; pause; quick swipes, cancellation and deduplication.');
