import * as T from './vendor/three.module.js';
const names={toast:'Vegemite Toast',burger:'Maccas Burger Shoes',beer:'Corona Jetpack'};
const material=color=>new T.MeshStandardMaterial({color,roughness:.65});
const bun=material('#df9b48'),patty=material('#482518'),lettuce=material('#7cbf43'),cheese=material('#ffca42'),glass=material('#b58c37'),label=material('#fff3cd'),black=material('#18121b');
function part(g,geo,mat,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;}
function burger(){const g=new T.Group();for(const [y,r,h,m] of [[0,.29,.13,bun],[.11,.31,.045,lettuce],[.17,.28,.1,patty],[.24,.3,.04,cheese],[.33,.29,.16,bun]])part(g,new T.CylinderGeometry(r,r,h,20),m,0,y);return g;}
function burgerShoe(){
 const g=new T.Group();
 // An elongated sneaker silhouette, with burger layers forming the sole.
 for(const [y,sx,sy,sz,m] of [[.015,.225,.055,.39,patty],[.075,.235,.028,.4,lettuce],[.105,.225,.035,.395,cheese],[.16,.22,.08,.38,bun]]){
  const layer=part(g,new T.SphereGeometry(1,24,12),m,0,y,.06);layer.scale.set(sx,sy,sz);
 }
 const toe=part(g,new T.SphereGeometry(1,24,16),bun,0,.22,.18);toe.scale.set(.22,.13,.27);
 const cuff=part(g,new T.TorusGeometry(.125,.035,10,24),bun,0,.29,-.13);cuff.rotation.x=Math.PI/2;
 for(let i=0;i<4;i++){const lace=part(g,new T.BoxGeometry(.24,.018,.018),label,0,.31-i*.012,-.02+i*.05);lace.rotation.y=(i%2?1:-1)*.14;}
 for(let i=0;i<14;i++){const a=i*2.4;const seed=part(g,new T.SphereGeometry(1,8,6),label,Math.cos(a)*.15,.31+Math.sin(i)*.008,.2+Math.sin(a)*.13);seed.scale.set(.012,.007,.025);}
 return g;
}
export function attachBurgerShoes(model){
 const shoes=[];
 for(const [side,x] of [['L',-.27],['R',.27]]){
  const bone=model.getObjectByName('Shin'+side);if(!bone)throw new Error('Missing shoe attachment bone');
  const mount=new T.Group(),shoe=burgerShoe();mount.add(shoe);mount.position.set(x,0,.1);model.add(mount);
  model.updateMatrixWorld(true);bone.attach(mount);mount.visible=false;shoes.push({mount,shoe});
 }
 return run=>{for(const {mount,shoe} of shoes){mount.visible=run.powers.burger>0||!!run.burgerJump;const squash=run.grounded?(run.landing||0)*.15:0;shoe.scale.set(1+squash*.35,1-squash,1+squash*.25);}};
}
function bottle(){
 const g=new T.Group(),bottleGlass=new T.MeshPhysicalMaterial({color:'#dfad48',metalness:.15,roughness:.16,clearcoat:1});
 part(g,new T.CylinderGeometry(.13,.145,.58,32),bottleGlass,0,.3);
 part(g,new T.CylinderGeometry(.055,.13,.19,32),bottleGlass,0,.685);
 part(g,new T.CylinderGeometry(.055,.055,.19,24),bottleGlass,0,.865);
 part(g,new T.CylinderGeometry(.065,.065,.035,24),cheese,0,.97);
 const c=document.createElement('canvas');c.width=256;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#fff4d6';ctx.fillRect(0,0,256,128);ctx.fillStyle='#192b4c';ctx.textAlign='center';ctx.font='bold 39px Georgia';ctx.fillText('Corona',128,65);ctx.font='15px Georgia';ctx.fillText('EXTRA',128,94);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
 part(g,new T.CylinderGeometry(.147,.147,.3,32),new T.MeshStandardMaterial({map:tex,roughness:.55}),0,.32);
 for(const y of [.13,.51])part(g,new T.TorusGeometry(.15,.017,8,24),black,0,y).rotation.x=Math.PI/2;
 return g;
}
function toast(){const g=new T.Group();part(g,new T.BoxGeometry(.7,.7,.13),bun);part(g,new T.BoxGeometry(.56,.54,.14),black,0,.02);return g;}
export function setupPowers(scene,runner){
 const hud=document.createElement('div');hud.className='power-hud';hud.setAttribute('aria-label','Active power-ups');document.querySelector('.viewport').append(hud);
 const pack=new T.Group(),jets=[];part(pack,new T.BoxGeometry(.58,.62,.1),black,0,1.12,.3);
 for(const x of [-.23,.23]){
  const b=bottle();b.position.set(x,1.65,.42);b.rotation.z=Math.PI;pack.add(b);
  const strap=part(pack,new T.TorusGeometry(.32,.035,8,32),black,x,1.27,0);strap.scale.set(.65,1.2,1);strap.rotation.y=Math.PI/2;
  part(pack,new T.CylinderGeometry(.16,.11,.15,24),black,x,.66,.42);
  const jet=new T.Group();jet.position.set(x,.59,.42);pack.add(jet);
  const beerMaterial=new T.MeshPhysicalMaterial({color:'#c77a12',roughness:.12,metalness:0,clearcoat:1,transparent:true,opacity:.92});
  const foamMaterial=new T.MeshStandardMaterial({color:'#fff8e7',roughness:.8});
  const stream=part(jet,new T.CylinderGeometry(.065,.095,.45,16),beerMaterial,0,-.225);
  const liquid=[];
  for(let i=0;i<20;i++){const blob=part(jet,new T.SphereGeometry(1,12,8),beerMaterial);liquid.push(blob);}
  const drops=[];
  for(let i=0;i<42;i++){
   const drop=part(jet,new T.SphereGeometry(i%3===0?.095:.065,12,8),i%3===0?beerMaterial:foamMaterial);
   drops.push({mesh:drop,phase:i/42,angle:i*2.39996});
  }
  jets.push({b,jet,stream,drops,liquid});
 }
 runner.add(pack);
 const board=new T.Group();scene.add(board);
 const boardShape=new T.Shape();boardShape.moveTo(0,1.45);boardShape.bezierCurveTo(.52,1.12,.57,-.75,.22,-1.35);boardShape.quadraticCurveTo(0,-1.5,-.22,-1.35);boardShape.bezierCurveTo(-.57,-.75,-.52,1.12,0,1.45);
 const crust=new T.MeshStandardMaterial({color:'#b86622',roughness:.72});
 const deck=new T.Mesh(new T.ExtrudeGeometry(boardShape,{depth:.065,bevelEnabled:true,bevelThickness:.025,bevelSize:.035,bevelSegments:3,steps:1}),crust);deck.rotation.x=-Math.PI/2;board.add(deck);
 const bread=new T.Mesh(new T.ShapeGeometry(boardShape),bun);bread.rotation.x=-Math.PI/2;bread.position.y=.092;bread.scale.set(.91,.95,1);board.add(bread);
 const spreadShape=new T.Shape();spreadShape.moveTo(0,1.13);spreadShape.bezierCurveTo(.34,.94,.39,-.68,.15,-1.09);spreadShape.quadraticCurveTo(-.02,-1.22,-.16,-1.03);spreadShape.bezierCurveTo(-.38,-.62,-.36,.91,0,1.13);
 const topping=new T.Mesh(new T.ShapeGeometry(spreadShape),new T.MeshPhysicalMaterial({color:'#251106',roughness:.26,clearcoat:.8}));topping.rotation.x=-Math.PI/2;topping.position.y=.098;board.add(topping);
 const puddle=new T.Group();puddle.scale.x=1.5;scene.add(puddle);
 const vegemite=new T.MeshPhysicalMaterial({color:'#241006',roughness:.22,metalness:0,clearcoat:1,clearcoatRoughness:.13});
 const outline=new T.Shape();
 for(let i=0;i<=64;i++){const a=i/64*Math.PI*2,r=1+.075*Math.sin(a*5)+.045*Math.cos(a*9),x=Math.cos(a)*.64*r,y=Math.sin(a)*1.06*r;if(i===0)outline.moveTo(x,y);else outline.lineTo(x,y);}
 outline.closePath();
 const spread=part(puddle,new T.ExtrudeGeometry(outline,{depth:.023,bevelEnabled:true,bevelThickness:.012,bevelSize:.035,bevelSegments:3,steps:1}),vegemite);spread.rotation.x=-Math.PI/2;
 const sideSpills=[];
 for(let i=0;i<10;i++){
  const side=i%2?1:-1,z=-.65+Math.floor(i/2)*.32;
  const splash=part(puddle,new T.SphereGeometry(1,16,8),vegemite,side*(.58+.055*(i%3)),.018,z);
  splash.scale.set(.22+.035*(i%3),.016,.10+.025*(i%2));splash.rotation.y=side*(.2+.1*(i%3));
  const drop=part(puddle,new T.SphereGeometry(1,12,8),vegemite,side*(.94+.045*(i%3)),.014,z+.08);
  drop.scale.set(.045+.01*(i%2),.012,.035);
  sideSpills.push({splash,drop,side,z,phase:i*.137,baseX:splash.position.x,baseScale:splash.scale.clone(),dropX:drop.position.x,dropScale:drop.scale.clone()});
 }
 // Small raised streaks catch the lights like thick, sticky spread.
 for(let i=0;i<4;i++){const ridge=part(puddle,new T.SphereGeometry(1,16,8),vegemite,-.32+i*.21,.03,-.05+(i%2)*.2);ridge.scale.set(.035,.014,.48);ridge.rotation.y=(i-1.5)*.09;}
 const pool=[];for(const type of Object.keys(names))for(let i=0;i<5;i++){const g=type==='toast'?toast():type==='burger'?burger():bottle();g.scale.setScalar(1.4);g.visible=false;scene.add(g);pool.push({type,g});}
 let flight=0,visualY=0,wasFlying=false;
 const leftFoot=new T.Vector3(),rightFoot=new T.Vector3();
 board.scale.set(.95,1,.88);
 return {update(run,dt,character){
  for(const p of pool)p.g.visible=false;
  for(const p of run.pickups){if(p.taken)continue;const slot=pool.find(s=>s.type===p.type&&!s.g.visible);if(!slot)continue;slot.g.visible=true;slot.g.position.set(p.x,1.1+Math.sin(run.time*3)*.15,run.distance-p.at);slot.g.rotation.y=run.time;}
  const flying=run.powers.beer>0;
  puddle.visible=run.powers.toast>0&&run.grounded;puddle.position.set(run.x,run.surface+.025,0);
  board.visible=puddle.visible;
  puddle.rotation.y=-(run.lane*3.85-run.x)*.12;
  for(const s of sideSpills){
   const cycle=(run.time*1.35+s.phase)%1,pulse=Math.sin(Math.PI*cycle),out=1-Math.pow(1-cycle,2);
   s.splash.position.x=s.baseX+s.side*.13*pulse;
   s.splash.position.z=s.z+.035*Math.sin(run.time*4+s.phase*6);
   s.splash.scale.set(s.baseScale.x*(1+.32*pulse),s.baseScale.y*(1+.35*pulse),s.baseScale.z*(1-.12*pulse));
   s.drop.position.set(s.dropX+s.side*.18*out,.014+.055*pulse,s.z+.08+.07*out);
   const size=Math.pow(Math.max(0,pulse),.65);s.drop.scale.copy(s.dropScale).multiplyScalar(size);
  }
  if(run.status!=='paused'){
   const target=flying?1:run.flightLanding?Math.min(1,Math.max(0,(run.y-run.surface)/3)):0;
   flight+=(target-flight)*(1-Math.exp(-8*dt));
   visualY=run.y;
   if(run.status==='ready'){flight=0;visualY=run.y;}
   wasFlying=flying;
  }
  if(flying||run.flightLanding)runner.position.y=visualY;
  pack.visible=run.status==='running'&&flight>.02;pack.scale.setScalar(Math.max(.01,Math.min(1,flight*2)));
  for(const {b,jet,stream,drops,liquid} of jets){
   b.rotation.z=Math.PI+Math.sin(run.time*47+b.position.x)*.012*flight;jet.visible=flying;
   stream.scale.x=stream.scale.z=.9+Math.sin(run.time*31+b.position.x)*.12;
   for(let i=0;i<liquid.length;i++){
    const u=i/(liquid.length-1),wave=run.time*14-u*10+b.position.x;
    liquid[i].position.set(Math.sin(wave)*.045*u,-.15-u*1.65,-u*u*.28+Math.cos(wave)*.025*u);
    const radius=.085*(1-u*.5)*(1+.18*Math.sin(wave));liquid[i].scale.set(radius,.12,radius);
   }
   for(const {mesh,phase,angle} of drops){
    const age=(run.time*.95+phase)%1,spread=.035+age*.13;
    mesh.position.set(Math.cos(angle)*spread,-.12-age*2.05,-age*age*.32+Math.sin(angle)*spread);
    const size=(1-age*.35)*(.8+.2*Math.sin(angle));mesh.scale.set(size,size*(1+age*.3),size);
   }
  }
  // Pitch along the track, never sideways. The head points down the tunnel.
  runner.rotation.x=-Math.PI/2*flight;
  if(board.visible&&character?.feet){
   const bob=.012*Math.sin(run.time*5),rock=.015*Math.sin(run.time*3.4);
   runner.position.y+=.13+bob;runner.rotation.z+=rock;
   runner.updateMatrixWorld(true);
   character.feet[0].getWorldPosition(leftFoot);character.feet[1].getWorldPosition(rightFoot);
   // Keep the long axis beneath both feet, including the animated body turn.
   board.position.set((leftFoot.x+rightFoot.x)/2,run.surface+.035+bob,(leftFoot.z+rightFoot.z)/2);
   board.rotation.set(.012*Math.sin(run.time*4.2),Math.atan2(rightFoot.x-leftFoot.x,rightFoot.z-leftFoot.z),runner.rotation.z);
  }
  hud.textContent=Object.entries(run.powers).filter(([,t])=>t>0).map(([type,t])=>`${names[type]} · ${t.toFixed(1)}s`).join('  |  ');
  if(!flying&&(run.flightLanding||run.landingGrace>0))hud.textContent='Safe landing';
  if(run.status==='over'||run.status==='ready')hud.textContent='';
  hud.hidden=!hud.textContent;
  hud.classList.toggle('power-expiring',Object.values(run.powers).some(t=>t>0&&t<1));
 }};
}
