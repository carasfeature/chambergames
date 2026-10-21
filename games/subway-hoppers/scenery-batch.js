import * as T from './vendor/three.module.js';
// Each tunnel section still recycles independently. Only static boxes are batched.
export function batchStaticBoxes(section){
 const groups=new Map();
 for(const child of [...section.children]){
  if(!child.isMesh||child.geometry.type!=='BoxGeometry')continue;
  if(!groups.has(child.material))groups.set(child.material,[]);
  groups.get(child.material).push(child);
 }
 for(const [material,objects] of groups){
  if(objects.length<2)continue;
  const mesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),material,objects.length);
  const size=new T.Matrix4(),matrix=new T.Matrix4();
  objects.forEach((object,i)=>{
   object.updateMatrix();
   const {width,height,depth}=object.geometry.parameters;
   size.makeScale(width,height,depth);matrix.copy(object.matrix).multiply(size);
   mesh.setMatrixAt(i,matrix);section.remove(object);object.geometry.dispose();
  });
  mesh.computeBoundingSphere();section.add(mesh);
 }
}
