import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {attachBurgerShoes} from './powers.js?v=gameplay-fixes-1';
export async function loadCharacter(parent,name='christina'){
 const files={christina:'christina-clown.glb',amber:'amber-halloween.glb'};
 if(!files[name])throw new Error('Unknown runner');
 const gltf=await new GLTFLoader().loadAsync('./assets/'+files[name]+'?v=run-polish-1');
 const model=gltf.scene;model.rotation.y=Math.PI;parent.add(model);
 const updateShoes=attachBurgerShoes(model);
 const feet=['L','R'].map((side,i)=>{const anchor=new T.Object3D();anchor.position.set(i===0?-.27:.27,.04,.11);model.add(anchor);model.updateMatrixWorld(true);model.getObjectByName('Shin'+side).attach(anchor);return anchor;});
 const mixer=new T.AnimationMixer(model),actions={};
 for(const clip of gltf.animations){const action=mixer.clipAction(clip);actions[clip.name]=action;if(!['Run','Idle','Flight','ToastSlide'].includes(clip.name)){action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;}}
 let active='',wasGrounded=true,wasLane=0,dodge=0,landing=0,previousStatus='ready';
 function play(name){if(name===active)return;const next=actions[name];if(!next)return;next.reset().fadeIn(.12).play();if(actions[active])actions[active].fadeOut(.12);active=name;}
 play('Idle');
 return {model,mixer,feet,update(run,dt){
  updateShoes(run);
  if(run.status==='paused')return;
  const sideways=run.status==='running'&&run.powers.toast>0&&run.grounded&&!run.powers.beer;
  const facing=sideways?Math.PI*3/4:Math.PI;
  model.rotation.y+=(facing-model.rotation.y)*(1-Math.exp(-14*dt));
  if(run.powers.beer>0||run.flightLanding&&run.y>2){play('Flight');mixer.update(dt);wasGrounded=false;previousStatus=run.status;return;}
  if(run.status==='running'&&run.powers.toast>0&&run.grounded){play('ToastSlide');mixer.update(dt);wasGrounded=true;wasLane=run.lane;dodge=0;landing=0;previousStatus=run.status;return;}
  if(run.status==='running'&&previousStatus!=='running'){if(previousStatus!=='paused'){wasLane=run.lane;wasGrounded=true;dodge=0;landing=0;} }
  if(run.status==='running'){
   if(run.lane!==wasLane){dodge=.22;play(run.lane<wasLane?'DodgeLeft':'DodgeRight');wasLane=run.lane;}
   if(run.grounded&&!wasGrounded)landing=.18;
   if(!run.grounded)play('Jump');else if(landing>0){play('Land');landing-=dt;}else if(dodge>0){dodge-=dt;}else play('Run');
  }else play(run.status==='over'?'Crash':'Idle');
  if(actions.Run)actions.Run.setEffectiveTimeScale(Math.min(1.4,Math.max(.9,(run.speed||18.975)/18.975)));
  wasGrounded=run.grounded;previousStatus=run.status;mixer.update(dt);
 }};
}
