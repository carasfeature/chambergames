import * as T from './vendor/three.module.js';
import {mergeGeometries} from './vendor/utils/BufferGeometryUtils.js';
function decal(draw){const c=document.createElement('canvas');c.width=c.height=512;draw(c.getContext('2d'));const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map,transparent:true,depthWrite:false,roughness:.7,side:T.DoubleSide});}
const wetBlood=new T.MeshPhysicalMaterial({color:'#570810',roughness:.23,clearcoat:1,clearcoatRoughness:.16});
const bloodVariants=[0,1,2,3].map(seed=>decal(c=>{
 const wash=c.createLinearGradient(0,20,0,500);wash.addColorStop(0,'#40070bec');wash.addColorStop(.45,'#610b13c9');wash.addColorStop(1,'#31070c32');c.fillStyle=wash;
 // Four silhouettes: pooled seep, radial splatter, dragged handprint, broad smear.
 if(seed===0)for(let i=0;i<12;i++){const x=100+i*25,y=36+18*Math.sin(i*2);c.beginPath();c.ellipse(x,y,18+i%3*7,8+i%4*3,.15*Math.sin(i),0,Math.PI*2);c.fill();}
 if(seed===1){for(let i=0;i<65;i++){const a=i*2.399,r=18+(i*47)%195;c.beginPath();c.ellipse(256+Math.cos(a)*r,130+Math.sin(a)*r*.52,3+i%9,2+i%6,a,0,Math.PI*2);c.fill();}c.beginPath();c.ellipse(256,125,63,40,.2,0,Math.PI*2);c.fill();}
 if(seed===2){c.beginPath();c.ellipse(258,156,56,63,-.25,0,Math.PI*2);c.fill();c.lineCap='round';c.strokeStyle=wash;for(let i=0;i<5;i++){c.lineWidth=15-i%2*3;c.beginPath();c.moveTo(205+i*24,135);c.lineTo(180+i*30,45+Math.abs(i-2)*15);c.stroke();}for(let i=0;i<4;i++){c.lineWidth=13;c.beginPath();c.moveTo(225+i*18,185);c.lineTo(235+i*20,285-i*11);c.stroke();}}
 if(seed===3){for(let i=0;i<22;i++){c.globalAlpha=.35+(i%4)*.15;c.beginPath();c.ellipse(100+i*14,55+i*3.4,43,13+i%5,-.24,0,Math.PI*2);c.fill();}c.globalAlpha=1;}
 for(let i=0;i<19;i++){const x=80+i*19,start=32+Math.sin(i+seed)*14,len=150+((i*73+seed*51)%300);c.lineCap='round';c.strokeStyle=wash;c.lineWidth=2+(i%4)*1.5;c.beginPath();c.moveTo(x,start);c.bezierCurveTo(x+3,start+len*.3,x-4,start+len*.7,x+1,start+len);c.stroke();c.fillStyle='#44080dc0';c.beginPath();c.ellipse(x+1,start+len,2.5,5,0,0,Math.PI*2);c.fill();}
}));
const web=decal(c=>{
 const cx=256,cy=230,n=15;c.strokeStyle='#ede6d1cc';c.lineWidth=1.8;
 const point=(a,r)=>[cx+Math.cos(a)*r,cy+Math.sin(a)*r];
 for(let i=0;i<n;i++){const a=i/n*Math.PI*2,p=point(a,270);c.beginPath();c.moveTo(cx,cy);c.lineTo(...p);c.stroke();}
 for(let r=28;r<260;r+=28){c.beginPath();for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,p=point(a,r);if(!i)c.moveTo(...p);else{const mid=point(a-Math.PI/n,r*.87);c.quadraticCurveTo(...mid,...p);}}c.stroke();}
});
const shell=new T.MeshStandardMaterial({color:'#201718',roughness:.38}),eyeMat=new T.MeshBasicMaterial({color:'#9b351c'});
const sphere=new T.SphereGeometry(1,12,8),legGeo=new T.CylinderGeometry(.018,.025,1,6);
function blob(g,x,y,z,sx,sy,sz,mat=shell){const m=new T.Mesh(sphere,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);g.add(m);}
function limb(g,a,b){const start=new T.Vector3(...a),end=new T.Vector3(...b),m=new T.Mesh(legGeo,shell);m.position.copy(start).add(end).multiplyScalar(.5);m.scale.y=start.distanceTo(end);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),end.sub(start).normalize());g.add(m);}
export function decorateTunnel(sections){
 const spiders=[],drips=[];
 sections.forEach((section,index)=>{
  const trails=[];
  for(const side of [-1,1]){
   for(let i=0;i<8;i++){
    const source=2.9+((index*3+i*4+(side>0?2:0))%7)*.95,length=Math.min(source-.4,2.1+((index+i)%3)*.8);
    const stain=new T.Mesh(new T.PlaneGeometry(2.8,length),bloodVariants[(index+i+(side>0?2:0))%4]);stain.position.set(side*6.50,source-length/2,-1.5-i*3);stain.rotation.y=-side*Math.PI/2;section.add(stain);
    // Wet raised rivulets and travelling drops sit just in front of the tile surface.
    const flow=new T.Group();flow.position.set(side*6.47,source-.12,stain.position.z);flow.rotation.y=-side*Math.PI/2;section.add(flow);
    for(let k=0;k<6;k++){
     const x=-.82+k*.32,fall=length*(.55+(k%3)*.14);
     const trail=new T.Mesh(new T.CylinderGeometry(.009,.016,fall,7),wetBlood);trail.position.set(x,-fall/2,0);trail.scale.z=.35;trail.updateMatrix();flow.updateMatrix();trail.geometry.applyMatrix4(trail.matrix).applyMatrix4(flow.matrix);trails.push(trail.geometry);
     const drop=new T.Mesh(sphere,wetBlood);flow.add(drop);drips.push({drop,x,fall,phase:index*.37+i*.6+k*.17,speed:.09+(k%3)*.025});
    }
    if(i<2){const cobweb=new T.Mesh(new T.PlaneGeometry(4.2,4.2),web);cobweb.position.set(side*6.48,6.5+(index%2)*.6,-6-i*13);cobweb.rotation.y=-side*Math.PI/2;cobweb.rotation.z=(index+i)*.4;section.add(cobweb);}
   }
  }
  section.add(new T.Mesh(mergeGeometries(trails),wetBlood));for(const geometry of trails)geometry.dispose();
  for(let j=0;j<3;j++){
   const g=new T.Group();section.add(g);blob(g,0,.2,.09,.16,.12,.23);blob(g,0,.18,-.13,.115,.10,.12);
   for(const side of [-1,1])blob(g,side*.046,.215,-.23,.022,.018,.015,eyeMat);
   const legs=[];
   for(const side of [-1,1])for(let k=0;k<4;k++){const leg=new T.Group();g.add(leg);const z=-.17+k*.1;limb(leg,[side*.07,.18,z],[side*.28,.29,z+(k-1.5)*.07]);limb(leg,[side*.28,.29,z+(k-1.5)*.07],[side*.46,.035,z+(k-1.5)*.14]);legs.push({leg,k,side});}
   spiders.push({g,legs,phase:index*1.7+j*2.1,z:-4-j*7});
  }
 });
 return time=>{
  for(const d of drips){const age=(time*d.speed+d.phase)%1,ease=age*age;d.drop.position.set(d.x,-ease*d.fall,.01);const size=Math.min(1,age*12,(1-age)*15);d.drop.scale.set(.025*size,.052*size*(1+age),.012*size);}
  for(const s of spiders){const a=time*.5+s.phase;s.g.position.set(Math.sin(a)*5.4,.015,s.z+Math.sin(a*.7)*.6);s.g.rotation.y=Math.cos(a)>0?-Math.PI/2:Math.PI/2;for(const {leg,k,side} of s.legs){const step=time*17+k*Math.PI*.7+side*1.7;leg.rotation.y=Math.sin(step)*.18;leg.rotation.z=Math.max(0,Math.cos(step))*.13*side;}}
 };
}
