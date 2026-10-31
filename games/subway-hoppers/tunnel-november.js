import * as T from './vendor/three.module.js';
const colors=['#c76a32','#d5a347','#a84c35','#bc853e'];
// Shared artwork keeps the seasonal scenery light on mobile.
function leaf(c,x,y,size,color,angle=0){
 c.save();c.translate(x,y);c.rotate(angle);c.scale(size/100,size/100);
 const points=[[0,-53],[12,-27],[25,-36],[23,-12],[45,-23],[40,-5],[53,2],[23,24],[27,36],[4,31],[3,53],[-3,53],[-4,31],[-27,36],[-23,24],[-53,2],[-40,-5],[-45,-23],[-23,-12],[-25,-36],[-12,-27]];
 c.beginPath();points.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.closePath();c.fillStyle=color;c.fill();c.strokeStyle='#67442a';c.lineWidth=1.8;c.beginPath();c.moveTo(0,44);c.lineTo(0,-37);for(const s of [-1,1]){c.moveTo(0,22);c.lineTo(s*34,0);c.moveTo(0,2);c.lineTo(s*18,-22);}c.stroke();c.restore();
}
const posterImages=new Map();
export function drawNovemberMural(c,w,h,index,onUpdate=()=>{}){
 const designs=[
  {asset:'store/turkey',bg:'#6b2831',accent:'#dca354',lines:['TURKEY','CHRISTINA'],tag:'THANKSGIVING / CHAMBER GAMES'},
  {asset:'store/pumpkin',bg:'#243e38',accent:'#dc8c49',lines:['PUMPKIN','AMBER'],tag:'NOVEMBER / CHAMBER GAMES'},
  {asset:'store/krispy',bg:'#6b2831',accent:'#e6b54f',lines:['XTRA','KRISPY'],tag:'NOVEMBER / CHAMBER GAMES'},
  {asset:'store/eloise-illustrated',bg:'#303b48',accent:'#c5a377',lines:['ELOISE','NO SLEEP'],tag:'NOVEMBER / CHAMBER GAMES'},
  {asset:'christina-clown',bg:'#37302b',accent:'#dca354',lines:['HALLOWEEN','CHRISTINA'],tag:'SUBWAY HOPPERS / CHAMBER GAMES'},
  {asset:'amber-halloween',bg:'#403348',accent:'#d3a96b',lines:['HALLOWEEN','AMBER'],tag:'SUBWAY HOPPERS / CHAMBER GAMES'}
 ];
 const d=designs[index];
 function paint(){
  c.clearRect(0,0,w,h);c.save();c.scale(w/1024,h/512);
  c.fillStyle='#302c27';c.fillRect(22,20,980,480);c.fillStyle=d.bg;c.fillRect(30,28,964,456);
  // Screen-printed stripes and halftone give these the feel of subway campaign posters.
  c.save();c.beginPath();c.rect(30,28,964,456);c.clip();
  c.fillStyle=d.accent;c.beginPath();c.moveTo(700,28);c.lineTo(994,28);c.lineTo(994,484);c.lineTo(490,484);c.closePath();c.fill();
  c.globalAlpha=.16;c.fillStyle='#261b18';for(let y=40;y<490;y+=15)for(let x=515;x<1000;x+=15){c.beginPath();c.arc(x,y,2.4,0,Math.PI*2);c.fill();}c.globalAlpha=1;
  c.strokeStyle=d.accent;c.lineWidth=2;c.beginPath();c.moveTo(63,103);c.lineTo(485,103);c.stroke();
  c.fillStyle='#f4e3c0';c.textAlign='left';c.font='bold 21px Arial';c.fillText(d.tag,63,78);
  c.font='900 68px Arial';d.lines.forEach((line,i)=>c.fillText(line,62,210+i*79,495));
  c.fillStyle=d.accent;c.fillRect(62,332,300,51);c.fillStyle=d.bg;c.font='900 28px Arial';c.fillText('NOVEMBER EDITION',76,366,273);
  c.fillStyle='#f4e3c0';c.font='bold 19px Arial';c.fillText('CHRISTINA + AMBER',63,452);
  const img=posterImages.get(d.asset);
  if(img?.complete&&img.naturalWidth){const scale=Math.min(490/img.naturalWidth,429/img.naturalHeight);const iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;c.drawImage(img,756-iw/2,484-ih,iw,ih);}
  c.restore();c.restore();onUpdate();
 }
 let img=posterImages.get(d.asset);
 if(!img){img=new Image();posterImages.set(d.asset,img);img.src=new URL('./assets/'+d.asset+'.png',import.meta.url).href;}
 if(!img.complete)img.addEventListener('load',paint,{once:true});
 paint();
}
function canvasMaterial(draw){const canvas=document.createElement('canvas');canvas.width=canvas.height=512;draw(canvas.getContext('2d'));const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map,transparent:true,alphaTest:.15,roughness:1,side:T.DoubleSide});}
const leafMaterials=colors.map(color=>canvasMaterial(c=>leaf(c,256,256,420,color)));
const garlandMaterial=canvasMaterial(c=>{c.strokeStyle='#796443';c.lineWidth=4;c.beginPath();c.moveTo(0,70);c.quadraticCurveTo(256,270,512,70);c.stroke();for(let i=0;i<9;i++)leaf(c,20+i*59,95+Math.sin(i/8*Math.PI)*100,74,colors[i%4],i*.8);});
const leafGeometry=new T.PlaneGeometry(1,1),garlandGeometry=new T.PlaneGeometry(5,2.1);
export function decorateTunnel(sections){
 const drifting=[],pose=new T.Object3D();
 sections.forEach((section,index)=>{
  // Flat leaves are decorative only; no obstacles or collision objects are added.
  for(let color=0;color<4;color++){
   const mesh=new T.InstancedMesh(leafGeometry,leafMaterials[color],12),dummy=new T.Object3D();
   for(let i=0;i<12;i++){const n=i*4+color+index*17;dummy.position.set(i<8?(i%2?1:-1)*(5.25+(n%7)*.13):((n*37)%90)/10-4.5,.015+(n%3)*.002,-.7-((n*71)%224)/10);dummy.rotation.set(-Math.PI/2,0,n*2.399);dummy.scale.setScalar(.23+(n%5)*.065);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}
   mesh.computeBoundingSphere();section.add(mesh);
  }
  for(let color=0;color<4;color++){
   const mesh=new T.InstancedMesh(leafGeometry,leafMaterials[color],2);
   mesh.name='drifting-maple-leaves';mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
   // Fixed bounds cover every flutter position, including after section recycling.
   mesh.boundingSphere=new T.Sphere(new T.Vector3(0,1,-12),15);
   section.add(mesh);drifting.push({mesh,index,color});
  }
  for(const side of [-1,1])for(const z of [-5,-19]){const garland=new T.Mesh(garlandGeometry,garlandMaterial);garland.position.set(side*6.48,5.6,z);garland.rotation.y=-side*Math.PI/2;section.add(garland);}
 });
 function animate(time=0){
  for(const {mesh,index,color} of drifting){
   for(let i=0;i<2;i++){
    const seed=index*8+color*2+i,phase=seed*2.399;
    const progress=(time*(.065+(seed%4)*.008)+seed*.137)%1;
    const lift=Math.sin(progress*Math.PI);
    const direction=index%2?-1:1;
    pose.position.set(direction*(-6+12*progress),.17+lift*(.35+(seed%3)*.23)+.09*Math.sin(time*3+phase),-2-((seed*37)%190)/10+Math.sin(time*.8+phase)*.8);
    pose.rotation.set(-Math.PI/2+Math.sin(time*3.4+phase)*.65,Math.cos(time*2.1+phase)*.45,phase+time*(i?-.8:1));
    // Fade into the side piles by shrinking only at the wrap boundary.
    pose.scale.setScalar((.32+(seed%3)*.07)*Math.min(1,progress*18,(1-progress)*18));
    pose.updateMatrix();mesh.setMatrixAt(i,pose.matrix);
   }
   mesh.instanceMatrix.needsUpdate=true;
  }
 }
 animate(0);return animate;
}
