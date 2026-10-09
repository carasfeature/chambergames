export const LANE_WIDTH=3.85, SAND_HEIGHT=3.675*.9, SAND_HALF_WIDTH=1.875;
// Stretch the jump by 5% without increasing its peak height.
export const JUMP_SPEED=14.6/1.05, GRAVITY=28/(1.05*1.05), MAX_FEET_HEIGHT=6.95*1.4-2.5;
export const SAND_RINGS=[[0,1,8.8],[.03,.98,8.55],[.23,.93,8.1],[.66,.83,7.3],[.93,.71,6.65],[1,.58,6.3]].map(([y,x,z])=>[y*SAND_HEIGHT,x*SAND_HALF_WIDTH,z]);
export function sandSurface(x,z){
 const inside=([h,rx,rz])=>Math.pow(Math.abs(x)/rx,2/.55)+Math.pow(Math.abs(z)/rz,2/.55)<=1;
 if(!inside(SAND_RINGS[0]))return null;
 if(inside(SAND_RINGS.at(-1)))return SAND_HEIGHT;
 for(let i=1;i<SAND_RINGS.length;i++)if(!inside(SAND_RINGS[i])){
  let a=SAND_RINGS[i-1],b=SAND_RINGS[i];for(let n=0;n<16;n++){const m=a.map((v,j)=>(v+b[j])/2);if(inside(m))a=m;else b=m;}return a[0];
 }
 return null;
}
export class Run {
 constructor(random=Math.random){this.random=random;this.reset();}
 reset(){this.landingGrace=0;this.powers={toast:0,burger:0,beer:0};this.pickups=[];this.burgerJump=false;this.flightLanding=false;this.status='ready';this.x=0;this.lane=0;this.y=0;this.vy=0;this.distance=0;this.time=0;this.grounded=true;this.surface=0;this.reason='';this.landing=0;this.rows=[];this.obstacles=[];this.nextRow=100;this.safeLane=0;this.rowId=0;this.lastPattern=-1;this.fillTrack();}
 get progressionDistance(){return Math.max(0,this.distance-100);}
 get level(){return Math.floor(this.progressionDistance/200);}
 powers={toast:0,burger:0,beer:0};
 pickups=[];
 collect(type){this.powers[type]=5;if(type==='beer'){this.vy=0;this.grounded=false;this.flightLanding=true;}}
 get speed(){return Math.min(28,18.975+this.level*.6)*1.1*(this.progressionDistance>=200?1.12:1);}
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
   const lanes=[-1,0,1].filter(l=>l!==row.safe);
   if(this.random()<.5)lanes.reverse();
   const types=patterns[pattern];
   // Start with full patterns; only a rare single-obstacle breather later.
   const single=row.id>0&&row.id%14===0;
   lanes.slice(0,single?1:2).forEach((lane,i)=>this.obstacles.push({type:types[i],x:lane*LANE_WIDTH,z:-row.at+this.distance,at:row.at,row:row.id}));
   // Rows are generated ahead: apply extra density by row position.
   // Dividing spacing by 1.1 produces 10% more rows per metre.
   this.nextRow+=Math.max(26,30-this.level*.4)/1.1/(row.at>=300?1.1:1);
  }
 }
 move(d){if(this.status==='running')this.lane=Math.max(-1,Math.min(1,this.lane+d));}
 jump(){if(this.status==='running'&&this.grounded&&!this.powers.beer){this.burgerJump=this.powers.burger>0;this.vy=JUMP_SPEED*(this.burgerJump?1:1.2);this.grounded=false;}}
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
   // Test lateral entry at the current depth, separately from forward approach.
   if(h!==null&&!landingProtected&&!(this.burgerJump&&oldY>=h)&&sandSurface(oldX-o.x,-o.z)===null&&Math.abs(this.x-o.x)<Math.abs(oldX-o.x)){
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
