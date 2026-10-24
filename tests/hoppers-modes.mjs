import assert from 'node:assert/strict';
import {Run,speedAt,FAST_SPEED_MULTIPLIER,LANE_WIDTH} from '../games/subway-hoppers/physics.mjs';
for(let d=0;d<=50000;d+=10){const p=Math.max(0,d-100);assert.equal(speedAt(d),Math.min(28,18.975+Math.floor(p/200)*.6)*1.1*(p>=200?1.12:1));}
for(const mode of ['standard','fast']){
 const r=new Run(()=>.3,mode);r.fillTrack=()=>{};r.obstacles=[];r.pickups=[];r.status='running';
 while(r.distance<50000)r.update(1/60);
 const expected=mode==='fast'?1080:1471.8185753153405;
 assert.ok(Math.abs(r.time-expected)<.1,`${mode} ${r.time}`);
 console.log(mode,'50km seconds',r.time);
 r.reset();assert.equal(r.mode,mode);assert.equal(r.speed,speedAt(0,mode));

}
// Sand remains jumpable at the Fast cap at low and high frame rates.
for(const fps of [10,30,60,120]){
 let wins=0;
 for(let lead=15;lead<=50;lead++){
  const r=new Run(()=>.3,'fast');r.fillTrack=()=>{};r.distance=10000-lead;r.obstacles=[{type:'sand',x:0,at:10000,z:-lead}];r.pickups=[];r.status='running';r.jump();
  while(r.distance<10005&&r.status==='running')r.update(1/fps);
  if(r.status==='running')wins++;
 }
 assert.ok(wins>=2,`sand jump window ${fps}: ${wins}`);
}
// Alternating adjacent clear lanes remain traversable at the Fast cap.
for(const fps of [10,30,60,120]){
 const r=new Run(()=>.3,'fast');r.fillTrack=()=>{};r.distance=10000;r.pickups=[];r.status='running';r.obstacles=[];
 const gap=26/1.1/1.1/1.1;
 let safe=0;
 for(let i=1;i<=40;i++){
  const next=safe===0?1:0;const at=10000+i*gap;
  r.obstacles.push(...[-1,0,1].filter(l=>l!==next).map(l=>({type:'roo',x:l*LANE_WIDTH,at,z:r.distance-at})));
  r.lane=next;
  while(r.distance<at+3&&r.status==='running')r.update(1/fps);
  assert.equal(r.status,'running',`lane change at ${fps}fps`);safe=next;
 }
}
console.log('Mode timing, Standard parity, Fast sand jumps and lane changes passed.',FAST_SPEED_MULTIPLIER);
