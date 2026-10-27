export const SKINS=[
 {id:'christina',name:'Christina',file:'christina-main',price:0,starter:true},
 {id:'amber',name:'Amber',file:'amber-main',price:0,starter:true},
 {id:'ChristinaNovember',name:'Turkey Christina',file:'christina-turkey',photo:'store/turkey',price:15000},
 {id:'AmberNovember',name:'Pumpkin Amber',file:'amber-pumpkin',photo:'store/pumpkin',price:15000},
 {id:'Krispy',name:'Krispy',file:'krispy',photo:'store/krispy',price:20000},
 {id:'Eloise',name:'Eloise',file:'eloise',photo:'store/eloise-illustrated',price:20000},
 {id:'ChristinaOctober',name:'Halloween Christina',file:'christina-clown',price:0},
 {id:'AmberOctober',name:'Halloween Amber',file:'amber-halloween',price:0}
];
export const skinById=id=>SKINS.find(s=>s.id===id);
