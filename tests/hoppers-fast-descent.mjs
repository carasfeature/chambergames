import assert from 'node:assert/strict';
import {Run,SAND_HEIGHT} from '../games/subway-hoppers/physics.mjs';
import {swipeAction,bindSwipes} from '../games/subway-hoppers/touch.mjs';
function empty(){const r=new Run(()=>.3,process.env.HOPPERS_MODE||'standard');r.nextRow=1e9;r.rows=[];r.obstacles=[];r.pickups=[];r.status='running';return r;}
for(const fps of [10,15,30,60,120])for(const shoes of [false,true])for(const trigger of [.15,.4,.65]){
 const normal=empty(),fast=empty();for(const r of [normal,fast]){if(shoes)r.powers.burger=5;r.jump();while(r.time<trigger)r.update(1/fps);}
 const y=fast.y;fast.fastDescend();assert.equal(fast.y,y);assert.ok(fast.vy<=-12);assert.equal(fast.burgerJump,shoes);
 while(!fast.grounded&&fast.status==='running')fast.update(1/fps);
 while(!normal.grounded&&normal.status==='running')normal.update(1/fps);
 assert.equal(fast.status,'running');assert.equal(fast.y,0);assert.ok(fast.time<normal.time);assert.equal(fast.burgerJump,false);
 fast.jump();assert.ok(fast.vy>0,'next jump unaffected');
 const sand=empty();sand.y=SAND_HEIGHT+1;sand.grounded=false;sand.obstacles=[{type:'sand',x:0,at:3,z:-3}];sand.fastDescend();while(!sand.grounded&&sand.time<.2)sand.update(1/fps);assert.equal(sand.status,'running');assert.ok(sand.surface>0,'lands on sand without tunnelling');
 const cactus=empty();cactus.y=2.1;cactus.grounded=false;cactus.obstacles=[{type:'cactus',x:0,at:1,z:-1}];cactus.fastDescend();cactus.update(.1);assert.equal(cactus.status,'over','descent does not bypass obstacles');
}
for(const mode of ['ground','paused','ready','over','flight','landing']){const r=empty();r.y=3;r.grounded=mode==='ground';r.vy=8;if(['paused','ready','over'].includes(mode))r.status=mode;if(mode==='flight')r.powers.beer=2;if(mode==='landing')r.flightLanding=true;r.fastDescend();assert.equal(r.vy,8,mode);}
assert.equal(swipeAction(0,40),'down');assert.equal(swipeAction(0,-40),'jump');assert.equal(swipeAction(40,0),'right');assert.equal(swipeAction(0,10),null);
const handlers={},actions=[];globalThis.document={addEventListener(){}};bindSwipes({addEventListener:(k,f)=>handlers[k]=f,setPointerCapture(){}},a=>actions.push(a),()=>true);const e=y=>({isPrimary:true,pointerId:1,clientX:100,clientY:y});handlers.pointerdown(e(100));handlers.pointerup(e(150));assert.deepEqual(actions,['down']);
console.log('PASS: normal and Burger Shoes descent at 10–120fps, landing, collision, next jump, ignored states, quick downward swipe.');
