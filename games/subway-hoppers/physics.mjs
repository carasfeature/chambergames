import {SAND_HEIGHT,sandSurface} from './sand-shape.mjs?v=v1-2-20261024';
export {SAND_HEIGHT,SAND_HALF_WIDTH,SAND_RINGS,sandDepth,sandSurface} from './sand-shape.mjs?v=v1-2-20261024';
export const LANE_WIDTH=3.85;
// Stretch the jump by 5% without increasing its peak height.
export const JUMP_SPEED=14.6/1.05, GRAVITY=28/(1.05*1.05), MAX_FEET_HEIGHT=6.95*1.4-2.5;
// Integrate the unchanged Standard curve to 50km, then scale to 18 minutes.
export function standardSpeed(distance){const progress=Math.max(0,distance-100);return Math.min(28,18.975+Math.floor(progress/200)*.6)*1.1*(progress>=200?1.12:1);}
const standard50kSeconds=300/standardSpeed(0)+Array.from({length:15},(_,i)=>200/standardSpeed(300+i*200)).reduce((a,b)=>a+b,0)+46700/standardSpeed(3300);
export const FAST_SPEED_MULTIPLIER=standard50kSeconds/(18*60);
export function speedAt(distance,mode='standard'){return standardSpeed(distance)*(mode==='fast'?FAST_SPEED_MULTIPLIER:1);}
export class Run {
 constructor(random=Math.random,mode="standard"){this.random=random;this.mode=mode==='fast'?'fast':'standard';this.reset();}
 reset(){this.landingGrace=0;this.powers={toast:0,burger:0,beer:0};this.pickups=[];this.burgerJump=false;this.flightLanding=false;this.status='ready';this.x=0;this.lane=0;this.y=0;this.vy=0;this.distance=0;this.time=0;this.grounded=true;this.surface=0;this.reason='';this.landing=0;this.rows=[];this.obstacles=[];this.nextRow=100;this.safeLane=0;this.rowId=0;this.lastPattern=-1;this.recentSand=[];this.sandReplacementIndex=0;this.lateRooCount=0;this.lateRooAdded=0;this.fillTrack();}
 get progressionDistance(){return Math.max(0,this.distance-100);}
 get level(){return Math.floor(this.progressionDistance/200);}
 powers={toast:0,burger:0,beer:0};
 pickups=[];
 collect(type){this.powers[type]=5;if(type==='beer'){this.vy=0;this.grounded=false;this.flightLanding=true;}}
 get speed(){return speedAt(this.distance,this.mode);}
 fillTrack(){
  while(this.nextRow<this.distance+230){
   // The guaranteed clear lane only moves one lane between rows.
   const choices=[-1,0,1].filter(l=>Math.abs(l-this.safeLane)<=1&&l!==this.safeLane);
   this.safeLane=choices[Math.floor(this.random()*choices.length)];
   const patterns=[['roo','cactus'],['sand','roo'],['cactus','sand'],['roo','roo'],['cactus','cactus']];
   let pattern=Math.floor(this.random()*patterns.length);if(pattern===this.lastPattern)pattern=(pattern+1)%patterns.length;this.lastPattern=pattern;
   const row={id:this.rowId++,at:this.nextRow,safe:this.safeLane};this.rows.push(row);
   const pickupInterval=row.at<1100?10:8;
   if(row.at>=300&&row.id%pickupInterval===0){
    const roll=this.random();
    this.pickups.push({type:roll<.5?'toast':roll<.75?'burger':'beer',x:row.safe*LANE_WIDTH,at:row.at});
   }
   const lanes=[-1,0,1].filter(l=>l!==this.safeLane);
   if(this.random()<.5)lanes.reverse();
   const types=patterns[pattern];
   // Start with full patterns; only a rare single-obstacle breather later.
   const single=row.id>0&&row.id%14===0;
   lanes.slice(0,single?1:2).forEach((lane,i)=>{
    let type=types[i];
    if(type==='sand'){
     const candidate={at:row.at,x:lane*LANE_WIDTH};
     this.recentSand=this.recentSand.filter(o=>row.at-o.at<100);
     if(this.recentSand.some(previous=>!sandTransferPossible(previous,candidate,this.mode))){
      // Two kangaroos, then one cactus. Do not draw extra randomness: the
      // original row layout, safe lane and random sequence stay unchanged.
      type=this.sandReplacementIndex++%3<2?'roo':'cactus';
     }
     else this.recentSand.push(candidate);
    }
    // Relative +10% kangaroos after 10km: for every ten baseline roos,
    // convert the next cactus. Keep sand, clear lanes and RNG untouched.
    if(row.at>=10000){
     if(type==='roo')this.lateRooCount++;
     else if(type==='cactus'&&this.lateRooAdded<Math.floor(this.lateRooCount/10)){type='roo';this.lateRooAdded++;}
    }
    this.obstacles.push({type,x:lane*LANE_WIDTH,z:-row.at+this.distance,at:row.at,row:row.id});
   });
   // Rows are generated ahead: apply extra density by row position.
   // Each density multiplier adds 10% more rows per metre; the newest starts at 100m.
   this.nextRow+=Math.max(26,30-this.level*.4)/1.1/(row.at>=300?1.1:1)/(row.at>=100?1.1:1);
  }
 }
 move(d){if(this.status==='running')this.lane=Math.max(-1,Math.min(1,this.lane+d));}
 jump(){if(this.status==='running'&&this.grounded&&!this.powers.beer){this.burgerJump=this.powers.burger>0;this.vy=JUMP_SPEED*(this.burgerJump?1:1.2);this.grounded=false;}}
 // Cancel upward motion without teleporting: normal collisions and landing still apply.
 fastDescend(){if(this.status==='running'&&!this.grounded&&!this.powers.beer&&!this.flightLanding)this.vy=Math.min(this.vy,-12);}
 die(reason){this.status='over';this.reason=reason;this.powers={toast:0,burger:0,beer:0};this.burgerJump=false;this.flightLanding=false;this.landingGrace=0;}
 update(dt){if(this.status!=='running')return;let remaining=Math.min(dt,.1);while(remaining>0&&this.status==='running'){const h=Math.min(remaining,1/180);this.step(h);remaining-=h;}}
 step(dt){
  this.time+=dt;this.distance+=this.speed*dt;this.landing=Math.max(0,this.landing-dt*5);
  this.landingGrace=Math.max(0,(this.landingGrace||0)-dt);
  for(const type of Object.keys(this.powers))this.powers[type]=Math.max(0,this.powers[type]-dt);
  const oldY=this.y,oldX=this.x,oldGrounded=this.grounded;
  this.x+=(this.lane*LANE_WIDTH-this.x)*(1-Math.exp(-(this.powers.toast?48:18)*dt));
  this.obstacles=this.obstacles.filter(o=>o.z<24);this.rows=this.rows.filter(r=>r.at>this.distance-24);this.fillTrack();
  // Kangaroos approach within a bounded row envelope: they cannot overtake
  // another pattern and unexpectedly close its escape route.
  for(const o of this.obstacles){const approach=o.type==='roo'?2*Math.max(0,Math.min(1,(this.distance-o.at+65)/45)):0;o.z=this.distance-o.at+approach;}
  this.pickups=this.pickups.filter(p=>!p.taken&&p.at>this.distance-5);
  for(const p of this.pickups)if(Math.abs(p.at-this.distance)<1.2&&Math.abs(p.x-this.x)<1.1&&this.y<1.7&&!this.flightLanding){p.taken=true;this.collect(p.type);}
  if(this.powers.beer){this.y=Math.min(6.2,this.y+15*dt);this.vy=0;this.grounded=false;this.surface=0;return;}
  const landingProtected=this.flightLanding||this.landingGrace>0;
  this.vy-=GRAVITY*(this.burgerJump?.62:1.44)*dt;this.y+=this.vy*dt;
  // Leave headroom for the placeholder, including jumps launched from the sand.
  if(this.y>MAX_FEET_HEIGHT){this.y=MAX_FEET_HEIGHT;this.vy=Math.min(0,this.vy);}
  let floor=0;
  for(const o of this.obstacles)if(o.type==='sand'){
   const h=sandSurface(this.x-o.x,-o.z);
   // A sand side is solid only below its surface, never an infinite-height wall.
   // Use the feet position after this physics step for both normal and powered jumps.
   if(h!==null&&!landingProtected&&this.y<h&&sandSurface(oldX-o.x,-o.z)===null&&Math.abs(this.x-o.x)<Math.abs(oldX-o.x)){
    this.die('You hit the side of the sand bank. Jump onto it from the front.');return;
   }
   if(h!==null)floor=Math.max(floor,h);
  }
  if(floor>oldY+.10||(oldGrounded&&this.surface<.2&&floor>oldY+.005)){
   if(landingProtected||(!oldGrounded&&oldY>1.5&&floor-oldY<.8)){this.y=floor;this.vy=0;}
   else{this.die('You hit the sand bank. Jump earlier to reach the top.');return;}
  }
  this.grounded=false;
  if(this.y<=floor&&this.vy<=0){if(!oldGrounded)this.landing=Math.min(1,-this.vy/14);if(this.flightLanding)this.landingGrace=.8;this.y=floor;this.vy=0;this.grounded=true;this.burgerJump=false;this.flightLanding=false;}
  this.surface=floor;
  for(const o of this.obstacles){
   if(o.type==='sand')continue;
   const width=o.type==='roo'?1.05:1.04,depth=o.type==='roo'?1.05:.55;
   if(landingProtected||this.landingGrace>0){if(Math.abs(this.x-o.x)<width&&Math.abs(o.z)<depth)this.landingGrace=Math.max(this.landingGrace||0,.12);continue;}
   if(Math.abs(this.x-o.x)<width&&Math.abs(o.z)<depth&&(o.type==='roo'? !((this.burgerJump||this.flightLanding)&&this.y>1.9):this.y<1.9)){
    this.die(o.type==='roo'?'A kangaroo caught you. Switch lanes to avoid it.':'You hit a cactus. Jump or switch lanes.');return;
   }
  }
 }
}

// Placement-only rehearsal: use the same movement, gravity, landing and sand
// collisions as gameplay, with no powers. Never alter row timing or consume RNG.
const sandTransferCache=new Map();
export function sandTransferPossible(previous,next,mode="standard"){
 const gap=next.at-previous.at;
 if(gap>=100)return true;
 const speed=speedAt(next.at+30,mode);
 const laneDelta=Math.round((next.x-previous.x)/LANE_WIDTH);
 const key=[speed.toFixed(5),gap.toFixed(5),laneDelta].join(':');
 if(sandTransferCache.has(key))return sandTransferCache.get(key);
 let result=false;
 // Require more than a single lucky launch instant: at least two neighbouring
 // lead distances must succeed (1m of takeoff tolerance).
 let previousSuccess=false;
 for(let lead=12;lead<=(mode==='fast'?Math.max(36,Math.ceil(speed*1.05)):36)&&!result;lead+=1){
  let success=false;
  for(const delay of [.10,.18]){
   const probe=Object.create(Run.prototype);probe.random=()=>.3;probe.fillTrack=()=>{};
   Object.defineProperty(probe,'speed',{value:speed});probe.reset();probe.status='running';
   probe.distance=-lead;probe.x=0;probe.lane=0;
   probe.obstacles=[{type:'sand',x:0,at:0,z:lead},{type:'sand',x:laneDelta*LANE_WIDTH,at:gap,z:-gap-lead}];
   probe.jump();let firstLanding=null,secondJump=false,secondLanding=false,groundJump=false;
   for(let tick=0;tick<360&&probe.status==='running';tick++){
    if(probe.grounded&&probe.surface>2.5){
     if(!secondJump&&firstLanding===null)firstLanding=probe.time;
     if(secondJump&&probe.distance>gap-6.3)secondLanding=true;
    }
    if(firstLanding!==null&&!secondJump&&probe.time-firstLanding>=delay&&probe.grounded){
     probe.jump();secondJump=true;probe.lane=laneDelta;
    }
    // A wider gap allows landing on the track and a fresh jump onto the next bank.
    if(secondJump&&!groundJump&&probe.grounded&&probe.surface===0&&probe.distance>=gap-lead&&probe.distance<gap-8.8){probe.jump();groundJump=true;}
    // Simulate crossing two lanes through the actual eased horizontal movement.
    probe.update(1/60);
    if(secondLanding&&probe.distance>gap+3&&probe.grounded&&probe.surface===0){success=true;break;}
    if(probe.distance>gap+35)break;
   }
   if(success)break;
  }
  result=success&&previousSuccess;previousSuccess=success;
 }
 // Bounded cache keeps long sessions from accumulating placement history.
 if(sandTransferCache.size>2048)sandTransferCache.clear();
 sandTransferCache.set(key,result);return result;
}
