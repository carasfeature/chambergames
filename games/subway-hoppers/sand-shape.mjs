// One mesh defines both the visible sand and its physical surface.
export const SAND_HEIGHT=3.675*.9,SAND_HALF_WIDTH=1.875;
export const SAND_RINGS=[[0,1,8.8],[.03,.98,8.55],[.23,.93,8.1],[.66,.83,7.3],[.93,.71,6.65],[1,.58,6.3]].map(([y,x,z])=>[y*SAND_HEIGHT,x*SAND_HALF_WIDTH,z]);
// Keep the approach ramp; shorten the exit from 6.65m to 2.8m past centre.
export const sandDepth=(radius,z)=>z<0?2.45+(radius-6.3)*.14:radius;
export const SAND_SEGMENTS=64;
const positions=[],uvs=[],indices=[];
for(const [height,rx,rz] of SAND_RINGS)for(let i=0;i<=SAND_SEGMENTS;i++){
 const a=i/SAND_SEGMENTS*Math.PI*2,co=Math.cos(a),si=Math.sin(a);
 positions.push(Math.sign(co)*Math.pow(Math.abs(co),.55)*rx,height,Math.sign(si)*Math.pow(Math.abs(si),.55)*sandDepth(rz,si));uvs.push(i/SAND_SEGMENTS*4,height/3);
}
for(let row=0;row<SAND_RINGS.length-1;row++)for(let i=0;i<SAND_SEGMENTS;i++){const a=row*(SAND_SEGMENTS+1)+i,b=a+SAND_SEGMENTS+1;indices.push(a,b,a+1,a+1,b,b+1);}
const top=positions.length/3;positions.push(0,SAND_HEIGHT,0);uvs.push(.5,.5);
for(let i=0;i<SAND_SEGMENTS;i++){const a=(SAND_RINGS.length-1)*(SAND_SEGMENTS+1)+i;indices.push(top,a+1,a);}
// Use the renderer's Float32 coordinates in collision calculations too.
export const SAND_POSITIONS=new Float32Array(positions);
export const SAND_UVS=new Float32Array(uvs);
export const SAND_INDICES=new Uint16Array(indices);
// Spatial buckets avoid scanning the entire mesh on every mobile physics step.
const buckets=new Map(),cell=.5;
for(let i=0;i<indices.length;i+=3){
 const [a,b,c]=indices.slice(i,i+3).map(j=>Array.from(SAND_POSITIONS.slice(j*3,j*3+3)));
 const den=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);if(Math.abs(den)<1e-12)continue;
 const tri={a,b,c,den};
 for(let x=Math.floor(Math.min(a[0],b[0],c[0])/cell);x<=Math.floor(Math.max(a[0],b[0],c[0])/cell);x++)for(let z=Math.floor(Math.min(a[2],b[2],c[2])/cell);z<=Math.floor(Math.max(a[2],b[2],c[2])/cell);z++){
  const key=x+','+z;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(tri);
 }
}
export function sandSurface(x,z){
 const candidates=buckets.get(Math.floor(x/cell)+','+Math.floor(z/cell));if(!candidates)return null;
 for(const {a,b,c,den} of candidates){
  const u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/den;
  const v=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/den;
  if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)return Math.max(0,u*a[1]+v*b[1]+(1-u-v)*c[1]);
 }
 return null;
}
