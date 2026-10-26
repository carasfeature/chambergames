// Convenience gate only: client-side passwords are not secure authentication.
(()=>{
 const key='chamber-admin-session';
 let user;try{user=sessionStorage.getItem(key)}catch{}
 if(!user){location.replace('/admin/login.html');return}
 addEventListener('DOMContentLoaded',()=>{
  const sidebar=document.querySelector('.sidebar');if(!sidebar)return;
  const box=document.createElement('div'),label=document.createElement('p'),button=document.createElement('button');
  label.textContent='Signed in as '+user;label.className='notice';button.textContent='Log out';
  button.onclick=()=>{sessionStorage.removeItem(key);location.replace('/admin/login.html')};
  box.append(label,button);sidebar.append(box);
 });
})();
