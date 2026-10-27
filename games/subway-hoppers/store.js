import {SKINS} from './skins.mjs?v=store-release-20261027';
import {createSkinPreview} from './skin-preview.js?v=store-release-20261027';
import {POWERS,UPGRADES,SAVE_ME_PRICE} from './economy.mjs?v=store-release-20261027';
import {shopIcon} from './shop-icons.js?v=store-release-20261027';
const fmt=n=>n.toLocaleString('en-US');
const beforeRun=['shield','double','head'];
const short={shield:'Shield',double:'×2 Gems',head:'Head Start'};
const when={double:'SELECT BEFORE RUN',shield:'SELECT BEFORE RUN',head:'SELECT BEFORE RUN',save:'USE AFTER CRASH'};
export function createStore(run,wallet,{resume,demo=false,onEquip=()=>{}}){
 const previewSkin=createSkinPreview();
 let tab='skins',revived=false,multiplier=1,shield=false,levels={powers:0},notice='',flashUntil=0,flashText='';
 document.documentElement.classList.add('store-ui');
 const purchases=new Map();
 const open=document.createElement('button');open.type='button';open.className='store-open';document.querySelector('.game-controls').before(open);
 const dialog=document.createElement('dialog');dialog.className='gem-store';dialog.setAttribute('aria-labelledby','shop-title');
 dialog.innerHTML='<div class="shop-sticky"><div class="shop-heading"><div><p class="eyebrow">Thanks to britt_banana for edits! &lt;3</p><h2 id="shop-title">Tooth Gem Store</h2></div><form method="dialog"><button class="store-close" aria-label="Close store">×</button></form></div><div class="shop-wallet"><span>◆ <strong></strong></span><small>TOOTH GEMS</small></div><nav class="shop-tabs" aria-label="Store sections"></nav></div><p class="shop-intro"></p><div class="shop-content"></div><p class="shop-notice" role="status" aria-live="polite"></p><div class="shop-bottom"><p class="wallet-note"></p><button type="button" class="shop-done">Back to game →</button></div>';
 document.body.append(dialog);
 const content=dialog.querySelector('.shop-content'),tabs=dialog.querySelector('.shop-tabs');
 dialog.querySelector('.shop-done').onclick=()=>dialog.close();
 for(const [id,label] of [['skins','Skins'],['powers','Powers'],['upgrades','Upgrades']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.tab=id;b.onclick=()=>{tab=id;notice='';render();};tabs.append(b);}
 const viewport=document.querySelector('.viewport');
 const shieldMark=document.createElement('span');shieldMark.className='shield-mark';shieldMark.innerHTML=shopIcon('shield');shieldMark.setAttribute('aria-label','Shield active');document.querySelector('.overlay').append(shieldMark);
 const doubleMark=document.createElement('span');doubleMark.className='double-mark';doubleMark.textContent='×2';doubleMark.setAttribute('aria-label','Double Gems active');
 const flash=document.createElement('div');flash.className='run-flash';flash.setAttribute('role','status');viewport.append(flash);
 const pickupHud=document.createElement('div');pickupHud.className='pickup-timers';pickupHud.setAttribute('aria-label','Active powers');viewport.append(pickupHud);
 const pickupNodes=Object.fromEntries(['toast','burger','beer'].map(id=>{const el=document.createElement('div');el.className='pickup-timer';el.innerHTML='<span>'+shopIcon(id)+'</span><small></small>';pickupHud.append(el);return [id,el];}));
 const loadout=document.createElement('div');loadout.className='run-loadout';loadout.innerHTML='<p>FOR YOUR NEXT RUN <small>Tap to select · uses 1</small></p><div></div>';document.querySelector('#start').before(loadout);
 const loadoutButtons={};
 for(const id of beforeRun){const b=document.createElement('button');b.type='button';b.innerHTML=shopIcon(id)+'<span>'+short[id]+'</span><b></b>';b.onclick=async()=>{if(wallet.busy)return;if(!wallet.state.inventory[id]){showStore();tab='powers';notice='Buy '+short[id]+' below, then select it for your next run.';render();dialog.querySelector('[data-item="'+id+'"]').scrollIntoView({block:'nearest'});return;}await wallet.arm(id);render();};loadout.querySelector('div').append(b);loadoutButtons[id]=b;}
 const revive=document.createElement('button');revive.type='button';revive.className='revive-button';document.querySelector('#start').before(revive);
 const collect=run.collect.bind(run);run.collect=type=>{collect(type);run.powers[type]=UPGRADES.powers.durations[levels.powers];};
 const die=run.die.bind(run);
 run.die=reason=>{if(shield){shield=false;run.landingGrace=2.5;showFlash('Shield saved you',2);render();return;}die(reason);};
 function showFlash(text,seconds){flashText=text;flashUntil=run.time+seconds;}
 function showStore(){if(run.status==='running')return;tab='skins';notice='';if(!dialog.open)dialog.showModal();render();}
 open.onclick=showStore;
 revive.onclick=async()=>{
  if(run.status!=='over'||revived||wallet.busy)return;revive.disabled=true;
  if(!await wallet.payForRevive()){revive.textContent=wallet.state.balance<SAVE_ME_PRICE?'Save Me · need '+fmt(SAVE_ME_PRICE-wallet.state.balance)+' more gems':'Could not save purchase · try again';return;}
  revived=true;run.obstacles=run.obstacles.filter(o=>Math.abs(o.z)>22);run.y=0;run.vy=0;run.surface=0;run.grounded=true;run.landingGrace=3;
  run.status='paused';showFlash('Back in the run',2);render();resume();
 };
 function start(session){
  levels=session?{powers:session.level}:wallet.state.levels;revived=false;shield=false;multiplier=1;notice='';flashUntil=0;
  const selected=wallet.state.armed,load=session?session.load:wallet.takeLoadout();multiplier=load.includes('double')?2:1;shield=load.includes('shield');
  if(selected.length&&!load.length)showFlash('Boosts could not be saved. Running without them.',3);
  if(load.includes('head')){run.distance=1000;run.rows=[];run.obstacles=[];run.pickups=[];run.nextRow=1050;run.rowId=40;run.safeLane=0;run.fillTrack();run.landingGrace=3;showFlash('HEAD START · 1,000m',2.5);}
  render();
 }
 function card(id,name,description){const c=document.createElement('article');c.className='shop-card';c.dataset.item=id;c.innerHTML='<div class="item-top"><span class="shop-icon">'+shopIcon(id)+'</span><div><h3></h3><p class="item-kind"></p></div></div><p class="item-description"></p>';c.querySelector('h3').textContent=name;c.querySelector('.item-description').textContent=description;return c;}
 function action(c,label,disabled,callback,key,cls=''){const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=disabled||!!wallet.busy;b.onclick=()=>{if(!wallet.busy)return callback();};b.dataset.action=key;b.className=cls;c.append(b);return b;}
 async function purchase(id){if(performance.now()-(purchases.get(id)??-Infinity)<400)return;purchases.set(id,performance.now());const label=POWERS.find(p=>p.id===id)?.name||UPGRADES[id.slice(8)]?.name;notice=await wallet.buy(id)?label+' added.':'Could not buy. Check your gems or browser storage.';render();}
 function render(){
  const s=wallet.state;open.textContent='◆ Store · '+fmt(s.balance);dialog.querySelector('.shop-wallet strong').textContent=fmt(s.balance);
  if(!dialog.open){sync();return;}
  const focus=document.activeElement?.dataset?.action,scroll=dialog.scrollTop;
  for(const b of tabs.children)b.setAttribute('aria-pressed',String(b.dataset.tab===tab));
  dialog.querySelector('.shop-intro').textContent=tab==='powers'?'Buy one. Keep it until you use it.':tab==='upgrades'?'Buy once. Enjoy longer powers on every run.':'';
  content.replaceChildren();
  if(tab==='skins')for(const item of SKINS.filter(x=>!x.starter)){
   const c=document.createElement('article');c.className='shop-card skin-card';
   const picture=document.createElement('button');picture.type='button';picture.className='skin-picture';picture.setAttribute('aria-label','Preview '+item.name+' avatar');
   const img=document.createElement('img');img.src='assets/'+(item.photo||item.file)+'.png';img.alt=item.name;img.loading='lazy';picture.append(img);picture.onclick=()=>previewSkin(item);c.append(picture);
   const title=document.createElement('h3');title.textContent=item.name;c.append(title);
   const hint=document.createElement('p');hint.className='item-description';hint.textContent='CLICK PICTURE TO VIEW AVATAR';c.append(hint);
   const owned=s.skins.includes(item.id),equipped=s.equipped===item.id;
   action(c,item.price===0?'Claim Free':owned?(equipped?'✓ Equipped':'Equip'):'Unlock · ◆ '+fmt(item.price),run.status==='paused'||equipped||(!owned&&s.balance<item.price),async()=>{
    if(!owned){notice=await wallet.buySkin(item.id)?item.name+' unlocked.':'Could not save. Please try again.';render();return;}
    if(await wallet.equipSkin(item.id)){await onEquip(item.id);notice=item.name+' equipped.';}else notice='Could not save selection.';render();
   },'skin-'+item.id,'shop-buy');content.append(c);
  }
  if(tab==='powers')for(const item of POWERS){
   const description=item.description;
   const c=card(item.id,item.name,description);c.querySelector('.item-kind').textContent=when[item.id];
   const owned=document.createElement('span');owned.className='owned';owned.textContent='Owned '+fmt(s.inventory[item.id]);c.querySelector('.item-top').append(owned);
   const afford=s.balance>=item.price;
   action(c,'Buy 1 · ◆ '+fmt(item.price),!afford,()=>purchase(item.id),'buy-'+item.id,'shop-buy');
   const hint=document.createElement('small');hint.className='price-hint';hint.textContent=afford?'':fmt(item.price-s.balance)+' more gems needed';c.append(hint);
   content.append(c);
  }
  if(tab==='upgrades')for(const [id,u] of Object.entries(UPGRADES)){
   const level=s.levels[id],c=card(id,u.name,u.description);c.querySelector('.item-kind').textContent='PERMANENT · LEVEL '+level+' / 3';
   const preview=document.createElement('p');preview.className='duration-preview';preview.innerHTML='<strong>'+u.durations[level]+'s</strong>'+(level<3?' <span>→</span> <strong>'+u.durations[level+1]+'s</strong>':' <span>MAX</span>');c.append(preview);
   const steps=document.createElement('div');steps.className='upgrade-steps';
   u.prices.forEach((price,i)=>{const cell=document.createElement('div');cell.className=i<level?'complete':i===level?'next':'';cell.innerHTML='<b>'+u.durations[i+1]+'s</b><small>'+(i<level?'✓ Owned':'◆ '+fmt(price))+'</small>';steps.append(cell);});c.append(steps);
   const price=u.prices[level];action(c,level===3?'Fully upgraded':'Upgrade · ◆ '+fmt(price),level===3||s.balance<price,()=>purchase('upgrade-'+id),'upgrade-'+id,'shop-buy');
   const hint=document.createElement('small');hint.className='price-hint';hint.textContent=level<3&&s.balance<price?fmt(price-s.balance)+' more gems needed':'';c.append(hint);content.append(c);
  }
  dialog.querySelector('.shop-notice').textContent=notice;
  dialog.querySelector('.wallet-note').textContent=wallet.cloud?(wallet.error|| (wallet.busy?'Saving to your account…':'Saved to your Twitch account')):wallet.persisted?(demo?'Demo wallet · separate from your gems':'Saved on this browser · Local preview'):'Saving unavailable. Purchases cannot complete.';
  if(focus){const target=[...content.querySelectorAll('button')].find(b=>b.dataset.action===focus);if(target&&!target.disabled)target.focus({preventScroll:true});}
  dialog.scrollTop=scroll;sync();
 }
 function sync(){
  const s=wallet.state,running=run.status==='running';open.hidden=running;loadout.hidden=running||run.status==='paused';
  for(const id of beforeRun){const b=loadoutButtons[id],owned=s.inventory[id],selected=s.armed.includes(id);b.setAttribute('aria-pressed',String(selected));b.setAttribute('aria-label',short[id]+': '+owned+' owned. '+(selected?'Selected. Tap to deselect.':owned?'Tap to select.':'Open Store to buy.'));b.querySelector('b').textContent=selected?'✓':owned?String(owned):'+';}
  shieldMark.hidden=!running||!shield;
  const gemHud=document.querySelector('.gem-hud');if(gemHud&&!doubleMark.parentElement)gemHud.append(doubleMark);doubleMark.hidden=!running||multiplier!==2;
  flash.hidden=!running||run.time>=flashUntil;flash.textContent=flash.hidden?'':flashText;
  for(const [id,el] of Object.entries(pickupNodes)){const t=run.powers[id]||0;el.hidden=!running||!t;el.style.setProperty('--progress',String(t/UPGRADES.powers.durations[levels.powers]));el.querySelector('small').textContent=Math.ceil(t)+'s';el.setAttribute('aria-label',({toast:'Vegemite Slide',burger:'Burger Shoes',beer:'Jetpack'})[id]+' '+Math.ceil(t)+' seconds');}
  revive.hidden=run.status!=='over'||revived;revive.disabled=s.balance<SAVE_ME_PRICE||!!wallet.busy;revive.textContent='Save Me · ◆ '+fmt(SAVE_ME_PRICE);revive.title='Continue this run with 3 seconds of protection. Once per run.';
 }
 if(wallet.cloud){const retry=document.createElement('button');retry.type='button';retry.textContent='Retry saving';retry.hidden=true;dialog.querySelector('.shop-bottom').prepend(retry);retry.onclick=()=>wallet.retry();wallet.subscribe(()=>{retry.hidden=!wallet.error;});}
 render();
 if(new URL(location.href).searchParams.has('shop'))showStore();
 return {dialog,start,render,sync,get multiplier(){return multiplier;},get magnetActive(){return false;}};
}
