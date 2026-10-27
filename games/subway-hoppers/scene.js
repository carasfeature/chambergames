import {skinById} from './skins.mjs?v=mobile-save-hotfix-20261027';
import * as T from './vendor/three.module.js';
import {createAmbience} from './ambience.js?v=mobile-save-hotfix-20261027';
import {bindSwipes} from './touch.mjs?v=mobile-save-hotfix-20261027';
import {createMobilePlay} from './mobile-play.mjs?v=mobile-save-hotfix-20261027';
import {currentPlayer,submitRun} from './preview-scores.mjs';
import {createGems} from './gems.js?v=mobile-save-hotfix-20261027';
import {createGraphics,mobileGraphicsMode,createGraphicsToggle} from './graphics.js?v=mobile-save-hotfix-20261027';
import {batchStaticBoxes} from './scenery-batch.js';
import {loadCharacter} from './character.js?v=mobile-save-hotfix-20261027';
import {setupPowers} from './powers.js?v=mobile-save-hotfix-20261027';
import {decorateTunnel} from './tunnel-halloween.js?v=mobile-save-hotfix-20261027';
import {Run} from './physics.mjs?v=mobile-save-hotfix-20261027';
import {SAND_HEIGHT,SAND_RINGS,SAND_POSITIONS,SAND_UVS,SAND_INDICES} from './sand-shape.mjs?v=mobile-save-hotfix-20261027';
const run=new Run();
let selectedMode='standard';
const ambience=createAmbience(document.querySelector('#sound-toggle'),document.querySelector('#sound-volume'));
// Wrap accepted actions so keyboard, buttons and touch share the same audio cues.
const originalMove=run.move.bind(run),originalJump=run.jump.bind(run);
run.move=direction=>{const lane=run.lane;originalMove(direction);if(run.lane!==lane)ambience.movement('lane',Math.sign(direction));};
run.jump=()=>{const grounded=run.grounded;originalJump();if(grounded&&!run.grounded)ambience.movement(run.burgerJump?'burgerJump':'jump');};
const originalCollect=run.collect.bind(run);
run.collect=type=>{originalCollect(type);ambience.pickup(type);};
const canvas=document.querySelector('#scene');
let renderer;
const mobile=matchMedia('(pointer:coarse)').matches;
const graphicsMode=mobileGraphicsMode(),graphicsToggle=createGraphicsToggle(graphicsMode);
document.documentElement.dataset.graphicsMode=graphicsMode;
document.addEventListener("visibilitychange",()=>{document.documentElement.dataset.pageHidden=String(document.hidden);});
const mobilePlay=createMobilePlay({distance:document.querySelector('#distance'),onPause:()=>{if(run.status==='running'){run.status='paused';showPanel();}}});
canvas.setAttribute('aria-label','Swipe left or right to change lanes; swipe up to jump. Keyboard: A/D or left/right arrows change lanes; W, up arrow or Space jumps; S or down arrow descends faster; Escape pauses.');
try{renderer=new T.WebGLRenderer({canvas,antialias:graphicsMode!=='performance',powerPreference:'high-performance'});}catch(error){document.querySelector('#error').hidden=false;throw error;}
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
const scene=new T.Scene();scene.background=new T.Color('#26383b');scene.fog=new T.Fog('#26383b',26,112);
const gems=await createGems(scene,run,{resume:()=>{scoreSubmitted=false;begin();},onEquip:id=>selectCharacter(id),onError:error=>{if(run.status==='running')run.status='paused';showPanel();message.textContent=error;}}).catch(error=>{const el=document.querySelector('#error');el.hidden=false;el.textContent=error.message+' Reload to retry.';throw error;});
const camera=new T.PerspectiveCamera(64,1,.1,160);camera.position.set(0,5.5,8.5);camera.lookAt(0,1,-18);
const graphics=createGraphics(renderer,canvas,camera,graphicsMode);
scene.add(new T.HemisphereLight('#f3e4c9','#4b403a',2.4));const sun=new T.DirectionalLight('#ffe2b4',2.1);sun.position.set(-4,9,5);scene.add(sun);
const vaultFill=new T.DirectionalLight('#dfc8a5',1.3);vaultFill.position.set(0,2,4);vaultFill.target.position.set(0,10,-20);scene.add(vaultFill,vaultFill.target);
const mat=(color,roughness=.85)=>new T.MeshStandardMaterial({color,roughness});
const concrete=mat('#686258'),steel=mat('#405957',.55),rail=mat('#a3ada6',.4),wood=mat('#4b4037'),sand=mat('#be623c'),green=mat('#608164'),rust=mat('#9f6950'),orange=mat('#e58a3d');
const ceilingJoint=mat('#534331',1);
const ceilingMat=mat('#807566',.98);ceilingMat.side=T.DoubleSide;ceilingMat.emissive.set('#807566');ceilingMat.emissiveIntensity=.35;
function box(parent,w,h,d,x,y,z,material){const o=new T.Mesh(new T.BoxGeometry(w,h,d),material);o.position.set(x,y,z);parent.add(o);return o;}
function sphere(parent,r,x,y,z,material,sx=1,sy=1,sz=1){const o=new T.Mesh(new T.SphereGeometry(r,24,18),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;}
function texture(draw,w=1024,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return tex;}
const tiles=texture((c,w,h)=>{c.fillStyle='#b6b4a0';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=64)for(let x=-128;x<w;x+=128){const xx=x+(y%128?64:0);c.fillStyle=['#b9baa7','#b0b19f','#c1c0ab'][(Math.floor(x/128)+Math.floor(y/64)+30)%3];c.fillRect(xx+2,y+2,124,60);}c.fillStyle='#315a52';c.fillRect(0,340,w,72);c.fillStyle='#d4ac67';c.fillRect(0,336,w,4);});
tiles.wrapS=tiles.wrapT=T.RepeatWrapping;tiles.repeat.set(3,1);
const wallmat=new T.MeshStandardMaterial({map:tiles,roughness:.94});
const plaster=texture((c,w,h)=>{c.fillStyle='#aa9278';c.fillRect(0,0,w,h);for(let i=0;i<14000;i++){c.fillStyle=i%2?'#5c48300b':'#e0c7a210';c.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*3,1+Math.random()*3);}c.strokeStyle='#65513d38';c.lineWidth=2;for(let y=0;y<h;y+=128){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}});
plaster.wrapS=plaster.wrapT=T.RepeatWrapping;plaster.repeat.set(3,2);ceilingMat.bumpMap=plaster;ceilingMat.bumpScale=.025;
function curvedRoof(){const positions=[],uv=[],indices=[],segments=64;for(let z=0;z<2;z++)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI;positions.push(-6.52*Math.cos(a),7+4.4*Math.sin(a),z? -24.04:0);uv.push(i/segments,z);}for(let i=0;i<segments;i++){const a=i,b=i+segments+1;indices.push(a,b,a+1,a+1,b,b+1);}const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();return new T.Mesh(geometry,ceilingMat);}
function graffiti(index){return texture((c,w,h)=>{c.clearRect(0,0,w,h);c.save();c.translate(w/2,h/2);c.rotate(-.07);c.textAlign='center';c.font='italic 900 116px Arial';c.lineWidth=18;c.strokeStyle='#202e31';c.strokeText(['BOO!','NIGHT SHIFT','NO SLEEP','TRICK / TREAT'][index],0,20);c.fillStyle=index%2?'#b7ce83':'#e9984f';c.fillText(['BOO!','NIGHT SHIFT','NO SLEEP','TRICK / TREAT'][index],0,20);c.font='bold 28px Arial';c.fillStyle='#e7d6aa';c.fillText('CHAMBER • NYC • 31 OCT',0,80);for(let i=0;i<11;i++){c.fillStyle='#e9984f';c.fillRect(-360+i*69,95+(i%3)*8,3,14+(i%4)*10);}c.restore();c.fillStyle='#eadfc5';c.beginPath();c.arc(880,118,47,Math.PI,0);c.lineTo(927,180);c.lineTo(900,162);c.lineTo(880,183);c.lineTo(858,162);c.lineTo(833,180);c.closePath();c.fill();c.fillStyle='#273837';c.fillRect(852,112,12,19);c.fillRect(885,112,12,19);});}
const graffitiMats=[0,1,2,3].map(i=>new T.MeshBasicMaterial({map:graffiti(i),transparent:true,depthWrite:false,side:T.DoubleSide}));
const signtex=texture((c,w,h)=>{c.fillStyle='#15272a';c.fillRect(0,0,w,h);c.fillStyle='#e7e2d2';c.font='bold 115px Arial';c.fillText('CANAL ST',55,195);c.font='44px Arial';c.fillText('DOWNTOWN & BROOKLYN',60,280);c.fillStyle='#e18c38';c.beginPath();c.arc(875,190,75,0,Math.PI*2);c.fill();c.fillStyle='#202a2a';c.font='bold 90px Arial';c.fillText('C',842,221);});
const signmat=new T.MeshBasicMaterial({map:signtex,side:T.DoubleSide});
const glow=new T.MeshBasicMaterial({color:'#ffe8b2'});
const TRACK_WIDTH_SCALE=1.1,LANE_WIDTH=3.5*TRACK_WIDTH_SCALE;
const sections=[];const length=24,count=6;
for(let i=0;i<count;i++){
 const g=new T.Group();scene.add(g);sections.push(g);g.position.z=12-i*length;g.scale.x=TRACK_WIDTH_SCALE;
 box(g,14,.25,24,0,-.22,-12,concrete);
 for(const side of [-1,1]){
  box(g,.35,7.2,24,side*6.7,3.4,-12,wallmat);box(g,1,.35,24,side*6.2,.06,-12,concrete);
  box(g,.12,.12,24,side*6.4,5.8,-12,steel);
  for(const z of [-1,-13]){box(g,.24,6.8,.3,side*6.35,3.4,z,steel);box(g,.55,.12,3.3,side*5.7,6.85,z,glow);}
  const art=new T.Mesh(new T.PlaneGeometry(9,4.5),graffitiMats[(i+(side>0?1:0))%4]);art.position.set(side*6.49,3.2,-12);art.rotation.y=side>0?-Math.PI/2:Math.PI/2;g.add(art);
 }
 g.add(curvedRoof());
 // Thin plaster expansion joints follow the real vault curvature.
 for(const z of [-6,-12,-18,-24]){
  const seam=curvedRoof();seam.scale.z=.003;seam.position.z=z;
  seam.position.y=-.018;seam.material=ceilingJoint;g.add(seam);
 }
 for(const lane of [-3.5,0,3.5]){
  for(const dx of [-.82,.82])box(g,.12,.13,24,lane+dx,.08,-12,rail);
  for(let z=-.5;z>-24;z-=1.5)box(g,2.2,.1,.25,lane,-.02,z,wood);
 }
 if(i%2===0){const sign=new T.Mesh(new T.PlaneGeometry(3.5,1.75),signmat);sign.position.set(-6.45,4.65,-3);sign.rotation.y=Math.PI/2;g.add(sign);}
}
sections.forEach(batchStaticBoxes);
const animateTunnel=decorateTunnel(sections);
// Sand is 10% lower than before; independent of the taller tunnel.

const sandTexture=texture((c,w,h)=>{
 c.fillStyle='#bd6236';c.fillRect(0,0,w,h);
 let seed=31;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<65000;i++){c.fillStyle=i%3===0?'#e4aa6b66':'#70391744';const size=.4+random()*1.8;c.fillRect(random()*w,random()*h,size,size);}
 for(let y=0;y<h;y+=28){c.beginPath();c.moveTo(0,y);for(let x=0;x<=w;x+=16)c.lineTo(x,y+Math.sin(x*.014+y)*4);c.strokeStyle='#e99d592b';c.lineWidth=2;c.stroke();}
},1024,1024);
sandTexture.wrapS=sandTexture.wrapT=T.RepeatWrapping;
const sandMaterial=new T.MeshStandardMaterial({map:sandTexture,bumpMap:sandTexture,bumpScale:.055,roughness:1});
const jumpMarkTexture=texture((c,w,h)=>{
 c.clearRect(0,0,w,h);c.strokeStyle='#814222';c.fillStyle='#814222';c.lineWidth=20;c.lineCap='round';c.lineJoin='round';
 c.beginPath();c.moveTo(w/2,245);c.lineTo(w/2,65);c.moveTo(w/2-80,145);c.lineTo(w/2,65);c.lineTo(w/2+80,145);c.stroke();
 c.textAlign='center';c.font='900 104px Arial';c.fillText('JUMP',w/2,405);
},512,512);
const jumpMarkMaterial=new T.MeshStandardMaterial({map:jumpMarkTexture,transparent:true,opacity:.45,roughness:1,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
function sandJumpMark(parent){
 // Conform the marking to the sloping front face, without changing collisions.
 const vertices=[],uv=[],indices=[],nx=12,ny=20;
 for(let row=0;row<=ny;row++)for(let col=0;col<=nx;col++){
  const u=col/nx,v=row/ny,x=(u-.5)*1.5,y=.95+v*1.65;
  let a=SAND_RINGS[0],b=SAND_RINGS[1];for(let i=1;i<SAND_RINGS.length;i++)if(y<=SAND_RINGS[i][0]){a=SAND_RINGS[i-1];b=SAND_RINGS[i];break;}
  const t=(y-a[0])/(b[0]-a[0]),rx=a[1]+(b[1]-a[1])*t,rz=a[2]+(b[2]-a[2])*t;
  const z=rz*Math.pow(1-Math.pow(Math.abs(x)/rx,2/.55),.55/2);
  vertices.push(x,y,z+.025);uv.push(u,v);
 }
 for(let row=0;row<ny;row++)for(let col=0;col<nx;col++){const a=row*(nx+1)+col,b=a+nx+1;indices.push(a,a+1,b,a+1,b+1,b);}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();parent.add(new T.Mesh(geometry,jumpMarkMaterial));
}
function sandBank(parent){
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(SAND_POSITIONS,3));geometry.setAttribute('uv',new T.BufferAttribute(SAND_UVS,2));geometry.setIndex(new T.BufferAttribute(SAND_INDICES,1));geometry.computeVertexNormals();parent.add(new T.Mesh(geometry,sandMaterial));sandJumpMark(parent);
}
const fur=mat('#a86f47'),furLight=mat('#c99164'),belly=mat('#e5c39b'),earInner=mat('#81504a'),nose=mat('#292725',.6);
function limb(parent,a,b,r1,r2,material){const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);const mesh=new T.Mesh(new T.CylinderGeometry(r2,r1,delta.length(),16),material);mesh.position.copy(start.add(end).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());parent.add(mesh);return mesh;}
function kangaroo(parent,phase){
 const body=new T.Group();body.scale.y=1.44;parent.add(body);
 sphere(body,.63,0,1.43,0,fur,1,1.42,.83);sphere(body,.48,0,1.76,.38,belly,.76,1.2,.32);
 limb(body,[0,1.88,0],[0,2.49,.12],.33,.24,furLight);
 const head=new T.Group();head.position.set(0,2.64,.1);body.add(head);
 sphere(head,.36,0,0,0,furLight,.82,1,.95);sphere(head,.27,0,-.12,.31,furLight,.75,.68,1.5);sphere(head,.13,0,-.1,.64,nose,1,.65,.65);
 for(const side of [-1,1]){
  sphere(head,.085,side*.26,.045,.2,nose,.55,1,.85);sphere(head,.022,side*.29,.076,.25,belly);
  const ear=new T.Group();ear.position.set(side*.23,.25,0);ear.rotation.z=side*-.22;head.add(ear);
  sphere(ear,.18,0,.34,0,furLight,.9,2.7,.55);sphere(ear,.115,0,.36,.085,earInner,.85,3,.24);
 }
 const legs=[],arms=[];
 for(const side of [-1,1]){
  const leg=new T.Group();leg.position.set(side*.43,1.03,-.07);body.add(leg);
  sphere(leg,.38,0,-.14,.02,fur,1,1.32,1);limb(leg,[0,-.22,.1],[0,-.76,-.17],.2,.11,furLight);sphere(leg,.18,0,-.85,.2,furLight,.8,.65,2.65);legs.push(leg);
  const arm=new T.Group();arm.position.set(side*.4,1.96,.17);body.add(arm);limb(arm,[0,0,0],[side*.13,-.37,.16],.115,.08,fur);limb(arm,[side*.13,-.37,.16],[side*.1,-.54,.38],.085,.06,furLight);sphere(arm,.09,side*.1,-.54,.4,nose,.7,1,1.3);arms.push(arm);
 }
 const tail=new T.Group();tail.position.set(0,1,-.35);body.add(tail);
 limb(tail,[0,0,0],[0,-.45,-1.05],.28,.17,fur);limb(tail,[0,-.45,-1.05],[0,-.7,-1.9],.17,.07,furLight);limb(tail,[0,-.7,-1.9],[0,-.66,-2.45],.07,.015,furLight);
 const shade=new T.Mesh(new T.CircleGeometry(.7,24),new T.MeshBasicMaterial({color:'#1b2926',transparent:true,opacity:.32,depthWrite:false}));shade.rotation.x=-Math.PI/2;shade.position.y=.018;parent.add(shade);
 parent.userData.roo={body,head,tail,legs,arms,shade,phase};
}
function animateRoo(g,t){const r=g.userData.roo;if(!r)return;const cycle=(t*1.65+r.phase)%1;
 const air=Math.sin(Math.PI*Math.min(1,cycle/.78));const squash=cycle>.78?Math.sin((cycle-.78)/.22*Math.PI):0;
 r.body.position.y=air*.7-squash*.08;r.body.scale.set(1+squash*.04,1.44*(1-squash*.07),1+squash*.04);r.body.rotation.x=-.10+air*.12;
 for(const leg of r.legs)leg.rotation.x=air*.65-squash*.22;
 for(const arm of r.arms)arm.rotation.x=-air*.35+squash*.14;
 r.tail.rotation.x=air*-.2+squash*.1;r.head.rotation.x=-air*.08;r.shade.scale.setScalar(1-air*.2);r.shade.material.opacity=.32-air*.13;
}
const obstacles=[];
for(let i=0;i<66;i++){
 const g=new T.Group();g.userData.type=['sand','cactus','roo'][i%3];g.visible=false;scene.add(g);obstacles.push(g);
 if(i%3===0){sandBank(g);}
 else if(i%3===1){box(g,.55,1.8,.55,0,.9,0,green);box(g,1.3,.3,.35,0,1.1,0,green);box(g,.3,.65,.35,-.6,1.28,0,green);box(g,.3,.9,.35,.6,1.4,0,green);}
 else{kangaroo(g,i*.19);}
}
const runner=new T.Group();scene.add(runner);
const powerVisuals=setupPowers(scene,runner);
let character,selectedCharacter='amber',loadingCharacter=false;
const characters=new Map();let characterRequest=0;
async function selectCharacter(name){
 if(run.status==='running'||run.status==='paused')return;
 const request=++characterRequest;
 selectedCharacter=name;loadingCharacter=true;showPanel();
 const errorBox=document.querySelector('#error');errorBox.hidden=true;
 try{
  if(!characters.has(name))characters.set(name,loadCharacter(runner,name));
  const loaded=await characters.get(name);characters.set(name,loaded);
  if(request!==characterRequest){loaded.model.visible=false;return;}
  for(const [id,value] of characters)if(value.model)value.model.visible=id===name;
  character=characters.get(name);
  // Bound GPU memory after browsing several skins.
  for(const [id,value] of characters){
   if(characters.size<=2)break;
   if(id===name||!value.model)continue;
   runner.remove(value.model);value.mixer.stopAllAction();value.mixer.uncacheRoot(value.model);
   value.model.traverse(o=>{o.geometry?.dispose();for(const m of o.material?[].concat(o.material):[]){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}});
   characters.delete(id);
  }
 }catch(error){characters.delete(name);if(request!==characterRequest)return;console.error(error);character=null;errorBox.hidden=false;errorBox.textContent='Character could not load. Select a runner to retry.';}
 finally{if(request===characterRequest){loadingCharacter=false;showPanel();}}
}
const shadow=new T.Mesh(new T.CircleGeometry(.6,24),new T.MeshBasicMaterial({color:'#182321',transparent:true,opacity:.4,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.015;scene.add(shadow);

const panel=document.querySelector('#play-panel'),title=document.querySelector('#play-title'),message=document.querySelector('#play-message'),start=document.querySelector('#start');
let last=0,runPlayer=null,scoreSubmitted=false,flightVisualOffset=0;
function showPanel(){ambience.setRunning(run.status==='running');ambience.setScreen(run.status);panel.hidden=run.status==='running';title.textContent=run.status==='over'?'End of the line':run.status==='paused'?'Paused':'Ready to run?';message.textContent=run.status==='over'?run.reason+' Distance: '+Math.floor(run.distance)+' m.':mobile?'Swipe left / right to change lanes. Swipe up to jump; down to descend faster.':'A / D or ← → change lanes · W / ↑ / Space jumps · S / ↓ fast descent. Jump early onto sand; dodge kangaroos.';if(previewStart&&run.status==='ready')message.textContent='Local test · starts at '+previewStart.toLocaleString()+'m · maximum running speed.';start.textContent=run.status==='paused'?'Resume run':run.status==='over'?'Try again':'Start';}
function sync(){for(const g of obstacles)g.visible=false;for(const o of run.obstacles){const g=obstacles.find(g=>!g.visible&&g.userData.type===o.type);if(!g)throw new Error('Obstacle pool exhausted');g.visible=true;g.position.set(o.x,0,o.z);animateRoo(g,run.time);}}
const previewStart=['localhost','127.0.0.1','[::1]'].includes(location.hostname)?Math.min(50000,Math.max(0,Number(new URLSearchParams(location.search).get('start'))||0)):0;
let starting=false;
async function begin(){if(!character||starting)return;starting=true;start.disabled=true;start.textContent='Starting…';try{if(gems.wallet.cloud&&gems.wallet.error&&!await gems.wallet.retry()){message.textContent=gems.wallet.error;return;}if(run.status!=='paused'||gems.wallet.needsRestart){runPlayer=currentPlayer();scoreSubmitted=false;run.mode=selectedMode;run.reset();if(previewStart){run.distance=previewStart;run.rows=[];run.obstacles=[];run.pickups=[];run.recentSand=[];run.nextRow=previewStart+50;run.fillTrack();}if(!await gems.reset()){showPanel();message.textContent=gems.wallet.error||'Could not start a saved run. Try again.';return;}sections.forEach((g,i)=>g.position.z=12-i*length);}run.status='running';mobilePlay.enter();ambience.start();last=0;showPanel();sync();canvas.focus({preventScroll:true});}finally{starting=false;start.disabled=loadingCharacter||!character;start.textContent=run.status==='paused'?'Resume run':run.status==='over'?'Try again':'Start';}}
function togglePause(){if(run.status==='running'){run.status='paused';showPanel();}else if(run.status==='paused')begin();}
start.onclick=()=>{if(run.status==='paused'||run.status==='over')begin();else openInstructions();};
const instructions=document.querySelector('#instructions');
function openInstructions(){if(run.status==='running'){run.status='paused';showPanel();}const go=document.querySelector('#instructions-start');go.textContent=run.status==='paused'?'RESUME':'START';go.disabled=loadingCharacter||!character;instructions.showModal();ambience.setScreen('instructions');}
document.querySelector('#instructions-open').onclick=openInstructions;
document.querySelector('#instructions-start').onclick=()=>{instructions.close();begin();};
document.querySelector('#instructions-close').onclick=()=>instructions.close();
instructions.addEventListener('close',()=>ambience.setScreen(run.status));
document.addEventListener('keydown',e=>{if(instructions.open||gems.dialog.open)return;if(e.target instanceof HTMLSelectElement||e.target instanceof HTMLInputElement||e.target instanceof HTMLButtonElement&&['Space','Enter'].includes(e.code))return;if(['ArrowLeft','ArrowRight','ArrowUp','Space','Escape','KeyA','KeyD','KeyW','ArrowDown','KeyS'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='Escape'){togglePause();return;}if(['ArrowLeft','KeyA'].includes(e.code))run.move(-1);if(['ArrowRight','KeyD'].includes(e.code))run.move(1);if(['Space','ArrowUp','KeyW'].includes(e.code))run.jump();if(['ArrowDown','KeyS'].includes(e.code))run.fastDescend();});
const resetSwipe=bindSwipes(canvas,action=>action==='jump'?run.jump():action==='down'?run.fastDescend():run.move(action==='left'?-1:1),()=>run.status==='running');
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(run.status==='running'){run.status='paused';showPanel();}document.querySelector('#error').hidden=false;document.querySelector('#error').textContent='Graphics interrupted. Reload the page to restart the game.';});
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden&&run.status==='running'){run.status='paused';showPanel();}});
function characterLabel(name){return skinById(name)?.name||name;}
const chooser=document.createElement('div');chooser.className='character-choice';chooser.setAttribute('role','group');chooser.setAttribute('aria-label','Choose your runner');
for(const name of ['christina','amber']){const button=document.createElement('button');button.type='button';button.dataset.character=name;button.textContent=characterLabel(name);button.addEventListener('click',async()=>{if(await gems.wallet.equipSkin(name))selectCharacter(name);});chooser.append(button);}
(document.querySelector('.run-loadout')||start).before(chooser);
const modeChooser=document.createElement('div');modeChooser.className='mode-choice';modeChooser.setAttribute('role','group');modeChooser.setAttribute('aria-label','Game mode');
const modeNote=document.createElement('p');modeNote.className='mode-note';modeNote.id='mode-note';
for(const [mode,label] of [['standard','Standard Mode'],['fast','Fast Mode']]){const button=document.createElement('button');button.type='button';button.dataset.mode=mode;button.textContent=label;button.setAttribute('aria-describedby','mode-note');button.onclick=()=>{if(run.status==='running'||run.status==='paused')return;selectedMode=mode;showPanel();};modeChooser.append(button);}
chooser.before(modeChooser,modeNote);
const baseShowPanel=showPanel;
const originalShowPanel=()=>{mobilePlay.sync(run.status);gems.sync();baseShowPanel();if(run.status==='over')message.textContent+=' Tooth gems collected: '+gems.earned+'.';};
showPanel=function(){graphicsToggle.sync(run.status);originalShowPanel();for(const button of modeChooser.children){button.setAttribute('aria-pressed',String(button.dataset.mode===(run.status==='paused'||run.status==='running'?run.mode:selectedMode)));button.disabled=run.status==='paused'||run.status==='running';}if(run.status!=='running')resetSwipe();modeNote.textContent=(run.status==='paused'||run.status==='running'?run.mode:selectedMode)==='fast'?'Fast Mode - game 35% faster; for those who want to get further, quicker':'Standard Mode - Original Game, same speed progression';canvas.parentElement.dataset.status=run.status;document.documentElement.dataset.runStatus=run.status;start.disabled=starting||loadingCharacter||!character;if(starting)start.textContent='Starting…';else if(loadingCharacter)start.textContent='Loading '+characterLabel(selectedCharacter)+'…';const portrait=document.querySelector('#runner-portrait');portrait.src='assets/'+skinById(selectedCharacter).file+'.png';portrait.alt=characterLabel(selectedCharacter)+' skin preview';document.querySelector('#runner-name').textContent=characterLabel(selectedCharacter);for(const button of chooser.children){button.setAttribute('aria-pressed',String(button.dataset.character===selectedCharacter));button.disabled=loadingCharacter||run.status==='paused';}};
showPanel();sync();selectCharacter(gems.wallet.state.equipped);
let lastFrame=0;
const distanceLabel=document.querySelector('#distance');let displayedDistance=-1;
renderer.setAnimationLoop(now=>{
 if(document.hidden){last=0;return;}
 const gap=now-lastFrame;
 if(gap<(run.status==='running'?1000/graphics.fps:1000/30)-1)return;
 lastFrame=now;
 graphics.sample(gap,run.status==='running');
 const dt=last?Math.min((now-last)/1000,.1):0;last=now;
 if(run.status==='paused'){renderer.render(scene,camera);return;}
 if(run.status==='running'){
  const distance=run.distance,wasGrounded=run.grounded,previousLevel=run.level;run.update(dt);const step=run.distance-distance;
  gems.update(dt);
  if(run.status==='over')ambience.gameOver();
  else if(run.level>previousLevel)ambience.difficulty();
  if(!wasGrounded&&run.grounded&&run.status==='running')ambience.movement('land',0,run.surface>.05);
  ambience.kangaroos(run);
  for(const g of sections){g.position.z+=step;if(g.position.z>36)g.position.z-=count*length;}
  sync();if(run.status==='over'){if(!scoreSubmitted){scoreSubmitted=true;submitRun(runPlayer,Math.floor(run.distance));}showPanel();}
 }
 const blend=1-Math.exp(-12*dt),lean=(run.lane*LANE_WIDTH-run.x)*(run.powers.toast>0?-.22:-.12);
 const flightVisualTarget=run.powers.beer>0?1.6*Math.min(1,run.y/6.2):0;
 flightVisualOffset+=(flightVisualTarget-flightVisualOffset)*(1-Math.exp(-6*dt));
 runner.position.set(run.x,run.y-flightVisualOffset,0);
 runner.rotation.z+=(lean-runner.rotation.z)*blend;runner.scale.y=1-run.landing*.08;
 character?.update(run,dt);
 ambience.powers(run);
 if(character)ambience.footsteps(run,character.footfalls);
 powerVisuals.update(run,dt,character);
 animateTunnel(run.time,run.distance);
 shadow.position.set(run.x,run.surface+.02,0);shadow.material.opacity=Math.max(.08,.4-(run.y-run.surface)*.055);
 camera.position.y+=(5.5+run.y*.5-camera.position.y)*(1-Math.exp(-8*dt));camera.lookAt(0,1+run.y*.6,-18);
 const distance=Math.floor(run.distance);if(distance!==displayedDistance){displayedDistance=distance;distanceLabel.textContent=String(distance).padStart(4,'0')+' M';}renderer.render(scene,camera);
});
