import {SKINS,skinById} from './skins.mjs';
export const SAVE_ME_PRICE=1000;
export const POWERS=[
 {id:'double',name:'Double Gems',price:300,icon:'×2',description:'Double every tooth gem you collect during your next run.'},
 {id:'shield',name:'Shield',price:1000,icon:'⬡',description:'Absorb one collision. Equip before starting a run.'},
 {id:'head',name:'Head Start',price:500,icon:'»',description:'Start at 1,000m. Skipped distance awards no tooth gems.'}
];
export const UPGRADES={
 powers:{name:'Longer Powers',prices:[3000,7500,15000],durations:[5,8,10,12],description:'Extends toast, burger shoes and jetpack pickups.'},
};
const KEY='chamber.hoppers.store.preview.v1';
export function createWallet(storage){
 const empty=()=>({balance:0,inventory:Object.fromEntries(POWERS.map(p=>[p.id,0])),levels:{powers:0},armed:[],skins:[],equipped:'christina'});
 let data=empty(),persisted=true;
 try{
  const raw=storage.getItem(KEY);
  if(raw){const s=JSON.parse(raw);if(Number.isSafeInteger(s.balance)&&s.balance>=0)data.balance=s.balance;
   for(const p of POWERS)if(Number.isSafeInteger(s.inventory?.[p.id])&&s.inventory[p.id]>=0)data.inventory[p.id]=s.inventory[p.id];
   for(const id of Object.keys(UPGRADES))if(Number.isInteger(s.levels?.[id])&&s.levels[id]>=0&&s.levels[id]<=3)data.levels[id]=s.levels[id];
   data.skins=SKINS.filter(x=>!x.starter&&s.skins?.includes(x.id)).map(x=>x.id);
   if(skinById(s.equipped)&&(skinById(s.equipped).starter||data.skins.includes(s.equipped)))data.equipped=s.equipped;
   data.armed=['double','shield','head'].filter(id=>s.armed?.includes(id)&&data.inventory[id]>0);
  }else{const old=Number(storage.getItem('chamber.hoppers.tooth-gems.preview.v1'));if(Number.isSafeInteger(old)&&old>=0)data.balance=old;}
 }catch{persisted=false;}
 function commit(next){try{storage.setItem(KEY,JSON.stringify(next));persisted=true;data=next;return true;}catch{persisted=false;return false;}}
 return {
  get state(){return structuredClone(data);},get persisted(){return persisted;},
  award(n){if(!Number.isSafeInteger(n)||n<1)return false;const next=structuredClone(data);next.balance+=n;
   if(!commit(next)){data=next;return false;}return true;},
  buy(id){const next=structuredClone(data),item=POWERS.find(p=>p.id===id),upgrade=UPGRADES[id.replace('upgrade-','')];let price;
   if(item)price=item.price;
   else if(id.startsWith('upgrade-')&&upgrade){const level=next.levels[id.slice(8)];if(level>=3)return false;price=upgrade.prices[level];}
   else return false;
   if(next.balance<price)return false;next.balance-=price;
   if(item)next.inventory[id]++;else next.levels[id.slice(8)]++;
   return commit(next);},
  payForRevive(){if(data.balance<SAVE_ME_PRICE)return false;const next=structuredClone(data);next.balance-=SAVE_ME_PRICE;return commit(next);},
  buySkin(id){const item=skinById(id);if(!item||item.starter||data.skins.includes(id)||data.balance<item.price)return false;const next=structuredClone(data);next.balance-=item.price;next.skins.push(id);return commit(next);},
  equipSkin(id){const item=skinById(id);if(!item||(!item.starter&&!data.skins.includes(id)))return false;return commit({...structuredClone(data),equipped:id});},
  arm(id){if(!['double','shield','head'].includes(id)||!data.inventory[id])return false;
   const next=structuredClone(data);next.armed=next.armed.includes(id)?next.armed.filter(x=>x!==id):[...next.armed,id];return commit(next);},
  consume(id){if(!data.inventory[id])return false;const next=structuredClone(data);next.inventory[id]--;next.armed=next.armed.filter(x=>x!==id);return commit(next);},
  takeLoadout(){const next=structuredClone(data),used=next.armed.filter(id=>next.inventory[id]>0);used.forEach(id=>next.inventory[id]--);next.armed=[];return commit(next)?used:[];}
 };
}

