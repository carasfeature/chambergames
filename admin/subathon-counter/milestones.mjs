export const MILESTONES=[
  {
    "target": 200,
    "name": "Who Reposted This?"
  },
  {
    "target": 300,
    "name": "Guess The Person WLW Edition"
  },
  {
    "target": 400,
    "name": "React to Clip Queue"
  },
  {
    "target": 500,
    "name": "Pictionary C&A vs Chat"
  },
  {
    "target": 700,
    "name": "TikTok Challenges by Amber"
  },
  {
    "target": 900,
    "name": "Acting Classes with a Professional"
  },
  {
    "target": 1100,
    "name": "Choicer Voicer"
  },
  {
    "target": 1300,
    "name": "Do You Know Chamber Inside Jokes?"
  },
  {
    "target": 1500,
    "name": "Ranking WLW Couples"
  },
  {
    "target": 1750,
    "name": "Chamberwood Bar Opens Up"
  },
  {
    "target": 2000,
    "name": "Cards Against Humanity"
  },
  {
    "target": 2250,
    "name": "Beer Pong"
  },
  {
    "target": 2500,
    "name": "Pie In The Face"
  },
  {
    "target": 2750,
    "name": "Smelling Salts For the First Time"
  },
  {
    "target": 3000,
    "name": "Magician Comes Over"
  },
  {
    "target": 3500,
    "name": "Costumes On Gummies"
  },
  {
    "target": 4000,
    "name": "Seafood Boil"
  },
  {
    "target": 4500,
    "name": "Five Nights At Freddy's"
  },
  {
    "target": 5000,
    "name": "Pregame Stream for Amber's Birthday!"
  },
  {
    "target": 5500,
    "name": "Sleepover and Fear Street"
  },
  {
    "target": 6000,
    "name": "Breakfast Date"
  },
  {
    "target": 6500,
    "name": "Giveaway Wheel"
  },
  {
    "target": 7000,
    "name": "Jade and Roxy Comeback!"
  },
  {
    "target": 7500,
    "name": "Disneyland as Disney Adults!"
  }
];
export function milestoneProgress(total){
 const rows=MILESTONES.map(m=>({...m,unlocked:total>=m.target,remaining:Math.max(0,m.target-total)}));
 return {rows,next:rows.find(m=>!m.unlocked)||null};
}
let lastTotal=null;
export function renderMilestones(total){
 if(!Number.isSafeInteger(total)||total<0||lastTotal===total)return;
 lastTotal=total;const {rows,next}=milestoneProgress(total),format=n=>n.toLocaleString('en-US');
 document.getElementById('next-milestone').textContent=next?'Next: '+next.name+' — '+format(next.remaining)+' more '+(next.remaining===1?'sub':'subs')+' needed ('+format(next.target)+' total).':'All milestones unlocked!';
 const body=document.getElementById('milestone-rows');body.replaceChildren();
 for(const m of rows){const tr=document.createElement('tr');tr.className=m.unlocked?'milestone-unlocked':next?.target===m.target?'milestone-next':'';for(const text of [m.name,format(m.target),m.unlocked?'✓ Unlocked':next?.target===m.target?'Next · '+format(m.remaining)+' to go':'Locked']){const td=document.createElement('td');td.textContent=text;tr.append(td);}body.append(tr);}
}
