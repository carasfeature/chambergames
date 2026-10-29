import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {getAuth,signInWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {FIREBASE} from '/shared/config.js';
const app=getApps().find(a=>a.name==='caption')||initializeApp(FIREBASE,'caption'),auth=getAuth(app);
const params=new URLSearchParams(location.search),next=params.get('next');
const needsDatabaseLogin=['/admin/subathon-wheel/','/admin/subathon-counter/'].includes(next);
const logoutReady=params.has('logout')?signOut(auth):Promise.resolve();
if(needsDatabaseLogin){document.querySelector('label[for="username"]').textContent='Firebase admin email';document.getElementById('username').type='email';document.querySelector('.notice').textContent='This tool uses the private database. Sign in with your Firebase admin email and password; the shared chamber login only opens the dashboard.';}
document.getElementById('login').addEventListener('submit',async e=>{
 e.preventDefault();const name=document.getElementById('username').value.trim(),password=document.getElementById('password'),error=document.getElementById('error'),button=e.submitter;
 if(!name){error.textContent='Enter your email.';return}button.disabled=true;error.textContent='';
 try{
  await logoutReady;
  if(needsDatabaseLogin&&!name.includes('@')){throw Error('Database login required');}
  if(name.includes('@')){const credential=await signInWithEmailAndPassword(auth,name,password.value);const token=await credential.user.getIdTokenResult();if(token.claims.hoppersPlayer){await signOut(auth);throw Error('Not an admin account');}}
  else if(password.value!=='chamber'){throw Error('Invalid login');}
  sessionStorage.setItem('chamber-admin-session',name);password.value='';
  location.replace(['/admin/subathon-wheel/','/admin/subathon-counter/'].includes(next)?next:'/admin/');
 }catch{error.textContent=needsDatabaseLogin?'Use a Firebase admin email and password for this private tool. The shared chamber password does not grant database access.':'Sign-in failed. Use your admin email and password.';password.value='';password.focus();button.disabled=false;}
});
