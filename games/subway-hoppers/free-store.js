import {SKINS,skinById} from './skins.mjs?v=free-skins-1';
import {createSkinPreview} from './skin-preview.js?v=mobile-save-hotfix-20261027';
import {shopIcon} from './shop-icons.js?v=mobile-save-hotfix-20261027';
const KEY='chamber.hoppers.free-skin.v1';
export function createFreeStore(run,{resume,onEquip}){
 let equipped='christina',revived=false,selecting=false;
 try{const saved=localStorage.getItem(KEY);if(skinById(saved))equipped=saved;}catch{}
 const preview=createSkinPreview();document.documentElement.classList.add('store-ui');
 const open=document.createElement('button');open.className='store-open';open.type='button';open.textContent='Skins Store';document.querySelector('.game-controls').before(open);
 const dialog=document.createElement('dialog');dialog.className='gem-store';dialog.setAttribute('aria-labelledby','shop-title');
 dialog.innerHTML='<p class="store-announcement"></p><div class="shop-sticky"><div class="shop-heading"><div><p class="eyebrow">Thanks to britt_banana for edits! &lt;3</p><h2 id="shop-title">Skins Store</h2></div><form method="dialog"><button class="store-close" aria-label="Close store">×</button></form></div></div><div class="shop-content"></div><p class="shop-notice" role="status"></p><div class="shop-bottom"><button type="button" class="shop-done">Back to game →</button></div>';
 dialog.querySelector('.store-announcement').textContent='THINGS HAPPEN, AND I CANNOT LONGER HAVE THE STORE UP. ALL THE SKINS ADDED FROM NOW ON WILL BE FREE FOR ALL.\nSORRY TO EVERYONE <3';
 document.body.append(dialog);dialog.querySelector('.shop-done').onclick=()=>dialog.close();
 const content=dialog.querySelector('.shop-content'),notice=dialog.querySelector('.shop-notice');
 async function equip(id){if(selecting||run.status==='running'||run.status==='paused'||!skinById(id))return false;selecting=true;try{await onEquip(id);equipped=id;try{localStorage.setItem(KEY,id);}catch{}render();return true;}finally{selecting=false;}}
 function render(){
  content.replaceChildren();for(const item of SKINS){
   const card=document.createElement('article');card.className='shop-card skin-card';
   const picture=document.createElement('button');picture.type='button';picture.className='skin-picture';picture.setAttribute('aria-label','Preview '+item.name+' avatar');
   const img=document.createElement('img');img.src='assets/'+(item.photo||item.file)+'.png';img.alt=item.name;img.loading='lazy';picture.append(img);picture.onclick=()=>preview(item);card.append(picture);
   const title=document.createElement('h3');title.textContent=item.name;card.append(title);
   const hint=document.createElement('p');hint.className='item-description';hint.textContent='CLICK PICTURE TO VIEW AVATAR';card.append(hint);
   const button=document.createElement('button');button.type='button';button.className='shop-buy';button.dataset.skin=item.id;button.textContent=equipped===item.id?'Equipped':'Equip';button.disabled=equipped===item.id||run.status==='paused';button.onclick=async()=>{button.disabled=true;if(await equip(item.id))notice.textContent=item.name+' equipped.';};card.append(button);content.append(card);
  }
 }
 open.onclick=()=>{if(run.status==='running')return;notice.textContent='';render();dialog.showModal();dialog.scrollTop=0;};
 const revive=document.createElement('button');revive.type='button';revive.className='revive-button';revive.textContent='Save Me · Free';revive.title='Continue once per run, with 3 seconds of protection.';document.querySelector('#start').before(revive);
 revive.onclick=()=>{if(run.status!=='over'||revived)return;revived=true;revive.disabled=true;run.obstacles=run.obstacles.filter(o=>Math.abs(o.z)>22);run.y=0;run.vy=0;run.surface=0;run.grounded=true;run.landingGrace=3;run.status='paused';sync();resume();};
 const hud=document.createElement('div');hud.className='pickup-timers';document.querySelector('.viewport').append(hud);
 const nodes=Object.fromEntries(['toast','burger','beer'].map(id=>{const el=document.createElement('div');el.className='pickup-timer';el.innerHTML='<span>'+shopIcon(id)+'</span><small></small>';hud.append(el);return[id,el];}));
 function sync(){open.hidden=run.status==='running';revive.hidden=run.status!=='over'||revived;revive.disabled=revived;for(const [id,el] of Object.entries(nodes)){const t=run.powers[id]||0;el.hidden=run.status!=='running'||!t;el.style.setProperty('--progress',String(t/5));el.querySelector('small').textContent=Math.ceil(t)+'s';}}
 render();sync();if(new URL(location.href).searchParams.has('shop')){dialog.showModal();dialog.scrollTop=0;}
 return {dialog,equip,get equipped(){return equipped;},reset(){revived=false;sync();},sync};
}
