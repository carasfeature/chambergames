export const START=Date.parse('2026-10-29T18:00:00Z');
export const CHANNEL='christinaandamber';
const safe=s=>typeof s==='string'&&/^[a-zA-Z0-9_-]{1,160}$/.test(s);
export function normalize(event,metadata,broadcaster){
 const at=Date.parse(metadata?.message_timestamp);
 if(!Number.isFinite(at)||at<START||event?.broadcaster_user_id!==broadcaster)return null;
 if(event.source_broadcaster_user_id&&event.source_broadcaster_user_id!==broadcaster)return null;
 const id=event.message_id;if(!safe(id))return null;
 const actor=event.chatter_is_anonymous?'Anonymous':String(event.chatter_user_name||event.chatter_user_login||'Unknown').slice(0,80);
 const kind=event.notice_type;
 if(kind==='sub'||(kind==='resub'&&!event.resub?.is_gift))return {actor,key:'event_'+id,kind,at,count:1};
 if(kind==='community_sub_gift'){
  const g=event.community_sub_gift;
  if(!safe(g?.id)||!Number.isSafeInteger(g.total)||g.total<1)return null;
  return {actor,key:'gift_'+g.id,kind:'gift',at,total:g.total};
 }
 if(kind==='sub_gift'){
  const g=event.sub_gift;
  if(g?.community_gift_id){if(!safe(g.community_gift_id)||!safe(g.recipient_user_id))return null;return {actor,key:'gift_'+g.community_gift_id,kind:'gift',at,recipient:g.recipient_user_id};}
  return {actor,key:'event_'+id,kind:'gift',at,count:1};
 }
 return null;
}
export function mergeRecord(previous,event){
 const next=previous?{...previous,members:{...(previous.members||{})}}:{kind:event.kind,at:event.at,count:0};
 if(event.recipient){next.members={...(next.members||{}),[event.recipient]:true};}
 if(event.total)next.total=Math.max(next.total||0,event.total);
 next.count=Math.max(next.count||0,event.count||0,next.total||0,Object.keys(next.members||{}).length);
 return next;
}
export function totalRecords(records){return Object.values(records||{}).reduce((n,v)=>n+(Number.isSafeInteger(v.count)&&v.count>0?v.count:0),0);}
