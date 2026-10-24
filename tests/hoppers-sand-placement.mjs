import assert from 'node:assert/strict';
import {Run,sandTransferPossible} from '../games/subway-hoppers/physics.mjs';
let checked=0;
for(const mode of ['standard','fast'])for(let seed=1;seed<=20;seed++){
 let n=seed;const r=new Run(()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/2**32},mode);
 for(let d=0;d<10000;d+=100){
  r.distance=d;r.fillTrack();for(const row of r.rows){const obstacles=r.obstacles.filter(o=>o.row===row.id);assert.equal(obstacles.length,row.id>0&&row.id%14===0?1:2);assert.ok(obstacles.every(o=>o.x!==row.safe*3.85));}
  const sands=r.obstacles.filter(o=>o.type==='sand').sort((a,b)=>a.at-b.at);
  for(let i=1;i<sands.length;i++)for(let j=0;j<i;j++)if(sands[i].at-sands[j].at<100){assert.ok(sandTransferPossible(sands[j],sands[i],mode));checked++;}
  r.rows=r.rows.filter(o=>o.at>d-24);r.obstacles=r.obstacles.filter(o=>o.at>d-24);r.pickups=[];
 }

}
for(const lane of [-2,-1,0,1,2]){
 const previous={at:5000,x:0};assert.equal(sandTransferPossible(previous,{at:5021.5,x:lane*3.85}),false);
 for(const gap of [43,65,90])assert.equal(sandTransferPossible(previous,{at:5000+gap,x:lane*3.85}),true);
}
console.log(`PASS: 20 seeded 10km tracks per mode preserve obstacle count per row and clear lanes; ${checked} sand pair checks; tight pairs rejected, wider pairs retained.`);
