import {createGemTracker,seededRandom} from './gem-tracker.mjs';
import {createCloudWallet} from './cloud-wallet.mjs?v=mobile-save-hotfix-20261027';
import * as T from './vendor/three.module.js';
import {createWallet} from './economy.mjs?v=mobile-save-hotfix-20261027';
import {createStore} from './store.js?v=mobile-save-hotfix-20261027';
export async function createGems(scene,run,options){
 let storage;try{storage=localStorage;}catch{storage={getItem(){return null;},setItem(){throw Error('Unavailable');}};}
 const demo=['localhost','127.0.0.1'].includes(location.hostname)&&new URL(location.href).searchParams.get('demo')==='1';
 if(demo){const original=storage;storage={getItem:k=>original.getItem('demo-v2.'+k),setItem:(k,v)=>original.setItem('demo-v2.'+k,v)};}
 let freshDemo=false;try{freshDemo=demo&&!storage.getItem('chamber.hoppers.store.preview.v1');}catch{}
 const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
 const cloud=!local||new URL(location.href).searchParams.has('cloud');
 const wallet=cloud?await createCloudWallet():createWallet(storage);if(freshDemo&&!cloud)wallet.award(25000);
 const shop=createStore(run,wallet,{...options,demo});
 let earned=0,tracker=createGemTracker(run),items=[],flying=[];
 if(wallet.cloud){
  for(const [method,action] of [['move',null],['jump','jump'],['fastDescend','down']]){const original=run[method].bind(run);run[method]=(...args)=>{if(run.status==='running')wallet.recordAction(action||(args[0]<0?'left':'right'));return original(...args);};}
  const update=run.update.bind(run);run.update=dt=>{const running=run.status==='running';update(dt);if(running)wallet.recordFrame(dt,run.status);};
 }
 const hud=document.createElement('div');hud.className='gem-hud';hud.innerHTML='<span class="gem-icon" aria-hidden="true">◆</span><span id="gem-count">0</span>';hud.setAttribute('aria-label','Tooth gems collected this run');document.querySelector('.viewport').append(hud);
 function render(){hud.querySelector('#gem-count').textContent=earned;shop.render();}
 render();
 const geometry=new T.OctahedronGeometry(.32,0);
 const material=new T.MeshStandardMaterial({color:'#c8f0ff',metalness:.55,roughness:.13,emissive:'#599bbd',emissiveIntensity:.55,flatShading:true});
 const edgeMaterial=new T.LineBasicMaterial({color:'#f1fcff',transparent:true,opacity:.75});
 const edgeGeometry=new T.EdgesGeometry(geometry);
 const pool=Array.from({length:100},()=>{const g=new T.Group(),m=new T.Mesh(geometry,material);m.scale.set(1,.85,.55);g.add(m);const edge=new T.LineSegments(edgeGeometry,edgeMaterial);edge.scale.copy(m.scale);g.add(edge);g.visible=false;scene.add(g);return g;});
 async function reset(){
  let session;
  if(wallet.cloud){session=await wallet.startRun(run.mode);if(!session)return false;run.random=seededRandom(session.seed);run.reset();}
  shop.start(session);earned=0;tracker=createGemTracker(run,shop.multiplier);items=tracker.items;flying=[];render();return true;
 }
 function update(dt){
  const collected=tracker.update();earned=tracker.earned;items=tracker.items;
  if(collected){if(!wallet.cloud)wallet.award(collected);render();hud.classList.remove('collected');void hud.offsetWidth;hud.classList.add('collected');}
  else shop.sync();
  pool.forEach(g=>g.visible=false);
  let n=0;for(const gem of items){const z=run.distance-gem.at;if(z < -105||z>3||n>=pool.length)continue;const g=pool[n++];g.visible=true;g.position.set(gem.x,gem.y+Math.sin(run.time*3+gem.at)*.09,z);g.rotation.y=run.time*2+gem.at;}

  flying=flying.filter(p=>p.t<1);for(const p of flying){p.t+=dt*5;if(n>=pool.length)break;const g=pool[n++],t=Math.min(1,p.t);g.visible=true;g.position.set(p.x+(run.x-p.x)*t,p.y+(run.y+1.2-p.y)*t,p.z*(1-t));g.rotation.y=run.time*5;}
 }
 function sync(){shop.sync();hud.hidden=run.status==='ready';}
 if(wallet.cloud)wallet.subscribe(()=>{render();if(wallet.error||wallet.needsRestart)options.onError?.(wallet.error||'This run could not be continued. Start a new run; saved gems and purchases are safe.');});
 return {reset,update,sync,wallet,dialog:shop.dialog,get earned(){return earned;},get balance(){return wallet.state.balance;}};
}

