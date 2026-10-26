(function(){
 const key='chamber-admin-local-db', watchers=new Set();
 const load=()=>JSON.parse(localStorage.getItem(key)||'{}');
 const value=path=>path.split('/').filter(Boolean).reduce((v,k)=>v?.[k],load())??null;
 const snap=path=>({val:()=>value(path),forEach:fn=>Object.entries(value(path)||{}).forEach(([k,v])=>fn({key:k,val:()=>v}))});
 function notify(){watchers.forEach(w=>w.fn(snap(w.path)))}
 async function set(path,val){const data=load(),parts=path.split('/').filter(Boolean);let p=data;parts.slice(0,-1).forEach(k=>p=p[k]??={});p[parts.at(-1)]=val;localStorage.setItem(key,JSON.stringify(data));notify()}
 async function update(path,val){return set(path,{...value(path),...val})}
 const ref=(db,path)=>path;
 window.localFirebase={ref,set,update,serverTimestamp:()=>Date.now(),get:async p=>snap(p),onValue(path,fn){const w={path,fn};watchers.add(w);queueMicrotask(()=>fn(snap(path)));return ()=>watchers.delete(w)},async runTransaction(path,fn){await set(path,fn(value(path)));return {committed:true,snapshot:snap(path)}}};
 window.firebase={auth:()=>({signInWithEmailAndPassword:async()=>{}}),database:()=>({ref:path=>({once:async()=>snap(path),set:v=>set(path,v),update:v=>update(path,v),on:(event,fn)=>window.localFirebase.onValue(path,fn)})})};
 window.addEventListener('storage',e=>{if(e.key===key)notify()});
})();
