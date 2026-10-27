import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
export function createSkinPreview(){
 const dialog=document.createElement('dialog');dialog.className='skin-preview';dialog.innerHTML='<form method="dialog"><button aria-label="Close avatar preview">×</button></form><h2></h2><p class="preview-status" role="status"></p><canvas aria-label="Rotating 3D avatar"></canvas><p>Avatar preview</p>';document.body.append(dialog);
 let renderer,scene,camera,model,mixer,frame,last=0,request=0,spinTime=0;
 const canvas=dialog.querySelector('canvas'),status=dialog.querySelector('.preview-status');
 function clear(){cancelAnimationFrame(frame);if(model){scene.remove(model);model.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of [].concat(o.material)){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}});model=null;}mixer=null;}
 dialog.addEventListener('close',()=>{request++;clear();});
 function tick(t){if(!dialog.open)return;const dt=Math.min(.05,(t-last)/1000||0);last=t;mixer?.update(dt);spinTime+=dt;if(model&&spinTime>1)model.rotation.y+=dt*.25;renderer.render(scene,camera);frame=requestAnimationFrame(tick);}
 return async skin=>{const token=++request;clear();dialog.querySelector('h2').textContent=skin.name;status.textContent='Loading avatar…';if(!dialog.open)dialog.showModal();try{
 if(!renderer){renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));scene=new T.Scene();scene.add(new T.HemisphereLight(0xffffff,0x655652,2.5));const key=new T.DirectionalLight(0xffffff,3);key.position.set(3,5,4);scene.add(key);camera=new T.PerspectiveCamera(35,1,.1,100);}
 const width=Math.max(200,canvas.clientWidth),height=360;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();camera.position.set(0,1.3,4.8);camera.lookAt(0,1.15,0);
 const gltf=await new GLTFLoader().loadAsync('./assets/'+skin.file+(matchMedia('(pointer:coarse), (max-width:700px)').matches?'.mobile.glb':'.glb')+'?v=mobile-save-hotfix-20261027');
 if(token!==request||!dialog.open){gltf.scene.traverse(o=>{o.geometry?.dispose();if(o.material)[].concat(o.material).forEach(m=>m.dispose());});return;}
 model=gltf.scene;model.rotation.y=0;scene.add(model);mixer=new T.AnimationMixer(model);const idle=gltf.animations.find(a=>a.name==='Idle');if(idle)mixer.clipAction(idle).play();status.textContent='';spinTime=0;last=performance.now();renderer.render(scene,camera);frame=requestAnimationFrame(tick);
 }catch(e){if(token===request)status.textContent='Avatar could not load. Close and try again.';console.error(e);}};
}
