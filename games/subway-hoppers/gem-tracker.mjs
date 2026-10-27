// Shared by rendering and server replay; rewards are never accepted from client balances.
export function createGemTracker(run, multiplier=1, saved){
 let state=saved?structuredClone(saved):{earned:0,distance:run.distance,x:run.x,y:run.y,seen:[],items:[]};
 state.items??=[];state.seen??=[];
 if(!saved&&run.distance===0)for(let at=15;at<=75;at+=5)state.items.push({at,x:0,y:1.1,taken:false});
 return {
  get items(){return state.items;},get earned(){return state.earned;},snapshot(){return structuredClone(state);},
  update(){
   const seen=new Set(state.seen);
   for(const row of run.rows)if(!seen.has(row.id)){seen.add(row.id);for(const offset of [-6,-3,0,3,6])state.items.push({at:row.at+offset,x:row.safe*3.85,y:1.1,taken:false});}
   const travel=run.distance-state.distance;let collected=0;
   for(const gem of state.items){
    if(gem.taken||gem.at<state.distance-.8||gem.at>run.distance+.8)continue;
    const t=travel>0?Math.max(0,Math.min(1,(gem.at-state.distance)/travel)):1;
    const x=state.x+(run.x-state.x)*t,y=state.y+(run.y-state.y)*t;
    if(Math.abs(x-gem.x)<.95&&Math.abs(y+1.1-gem.y)<1.1){gem.taken=true;collected+=multiplier;}
   }
   state.earned+=collected;state.distance=run.distance;state.x=run.x;state.y=run.y;
   state.items=state.items.filter(g=>!g.taken&&g.at>run.distance-3);
   const first=run.rows[0]?.id??0;state.seen=[...seen].filter(id=>id>=first);
   return collected;
  }
 };
}
export function seededRandom(seed){let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};random.state=()=>state;return random;}
