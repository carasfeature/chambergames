import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {getAuth,signInWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {FIREBASE} from '/shared/config.js';
const app=getApps().find(a=>a.name==='caption')||initializeApp(FIREBASE,'caption'),auth=getAuth(app);
const params=new URLSearchParams(location.search),next=params.get('next');
const needsDatabaseLogin=next==='/admin/subathon-wheel/';
const endpoint='https://chamber-production-counter.swer538.chatgpt.site/api/counter';
if(params.has('logout'))sessionStorage.removeItem('chamber-admin-token');
async function sharedLogin(data){const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',...data})});const result=await response.json();if(!response.ok)throw Error(result.error||'Sign-in failed.');sessionStorage.setItem('chamber-admin-token',result.token);}
const logoutReady=params.has('logout')?signOut(auth):Promise.resolve();
if(needsDatabaseLogin){document.querySelector('label[for="username"]').textContent='Firebase admin email';document.getElementById('username').type='email';document.querySelector('.notice').textContent='This tool uses the private database. Sign in with your Firebase admin email and password; the shared chamber login only opens the dashboard.';}
document.getElementById('login').addEventListener('submit',async e=>{
 e.preventDefault();const name=document.getElementById('username').value.trim(),password=document.getElementById('password'),error=document.getElementById('error'),button=e.submitter;
 if(!name){error.textContent='Enter your username.';return}button.disabled=true;error.textContent='';
 try{
  await logoutReady;
  if(needsDatabaseLogin&&!name.includes('@')){throw Error('Database login required');}
  if(!needsDatabaseLogin){try{await sharedLogin({name,password:password.value});sessionStorage.setItem('chamber-admin-session',name);password.value='';location.replace(next==='/admin/subathon-counter/'?next:'/admin/');return;}catch(error){if(!name.includes('@'))throw error;}}
  if(name.includes('@')){const credential=await signInWithEmailAndPassword(auth,name,password.value);const token=await credential.user.getIdTokenResult();if(token.claims.hoppersPlayer){await signOut(auth);throw Error('Not an admin account');}await sharedLogin({firebaseToken:await credential.user.getIdToken()});}
  else {throw Error('Use your Firebase admin email for this tool.');}
  sessionStorage.setItem('chamber-admin-session',name);password.value='';
  location.replace(['/admin/subathon-wheel/','/admin/subathon-counter/'].includes(next)?next:'/admin/');
 }catch(cause){error.textContent=needsDatabaseLogin?'Use a Firebase admin email and password for this private tool. The shared chamber password does not grant database access.':(cause.message||'Sign-in failed. Use your usual admin username and password.');password.value='';password.focus();button.disabled=false;}
});
