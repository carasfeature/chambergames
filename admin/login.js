import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {getAuth,signInWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {FIREBASE} from '/shared/config.js';
const app=getApps().find(a=>a.name==='caption')||initializeApp(FIREBASE,'caption'),auth=getAuth(app);
if(new URLSearchParams(location.search).has('logout'))signOut(auth);
document.getElementById('login').addEventListener('submit',async e=>{
 e.preventDefault();const name=document.getElementById('username').value.trim(),password=document.getElementById('password'),error=document.getElementById('error'),button=e.submitter;
 if(!name){error.textContent='Enter your email.';return}button.disabled=true;error.textContent='';
 try{
  if(name.includes('@')){const credential=await signInWithEmailAndPassword(auth,name,password.value);const token=await credential.user.getIdTokenResult();if(token.claims.hoppersPlayer){await signOut(auth);throw Error('Not an admin account');}}
  else if(password.value!=='chamber'){throw Error('Invalid login');}
  sessionStorage.setItem('chamber-admin-session',name);password.value='';
  const next=new URLSearchParams(location.search).get('next');location.replace(next==='/admin/subathon-wheel/'?next:'/admin/');
 }catch{error.textContent='Sign-in failed. Use your admin email and password.';password.value='';password.focus();button.disabled=false;}
});
