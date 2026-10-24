import assert from 'node:assert/strict';
import {Run} from '../games/subway-hoppers/physics.mjs';
import {SAND_POSITIONS as p,SAND_INDICES as ids,sandSurface} from '../games/subway-hoppers/sand-shape.mjs';
// Every triangle centroid must have exactly the same visible and physical height.
for(let i=0;i<ids.length;i+=3){const v=[ids[i],ids[i+1],ids[i+2]].map(j=>Array.from(p.slice(j*3,j*3+3)));const mean=k=>v.reduce((s,a)=>s+a[k],0)/3;assert.ok(Math.abs(sandSurface(mean(0),mean(2))-mean(1))<1e-6,`triangle ${i/3}`);}
const rear=Math.min(...Array.from(p).filter((_,i)=>i%3===2));assert.ok(Math.abs(rear+2.8)<1e-6);
for(let x=-2;x<=2;x+=.025)assert.equal(sandSurface(x,rear-.001),null,'no collision behind visible rear');
function run(){const r=new Run(()=>.3);r.status='running';r.rows=[];r.pickups=[];r.obstacles=[];r.nextRow=1e9;return r;}
for(const fps of [10,15,20,30,60,90,120])for(const direction of [-1,1])for(const distance of [0,5000]){
 const r=run();r.distance=distance;r.x=direction*2;r.lane=0;r.obstacles=[{type:'sand',x:0,at:distance-2.801,z:2.801}];
 for(let i=0;i<fps;i++)r.update(1/fps);
 assert.equal(r.status,'running',`rear entry ${fps}fps side ${direction} distance ${distance}: ${r.reason}`);
 const inside=run();inside.x=direction*2;inside.lane=0;inside.obstacles=[{type:'sand',x:0,at:0,z:0}];inside.update(1/fps);assert.equal(inside.status,'over','actual solid side remains dangerous');
}
console.log('PASS: 704 triangle surfaces match; rear bounds; both lane-entry directions at 10–120fps, starting and maximum speeds.');
