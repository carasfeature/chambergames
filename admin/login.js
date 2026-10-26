document.getElementById('login').addEventListener('submit',e=>{
 e.preventDefault();const name=document.getElementById('username').value.trim(),password=document.getElementById('password'),error=document.getElementById('error');
 if(!name){error.textContent='Enter a username.';return}
 if(password.value!=='chamber'){error.textContent='Incorrect password.';password.value='';password.focus();return}
 try{sessionStorage.setItem('chamber-admin-session',name);password.value='';location.replace('/admin/')}catch{error.textContent='Browser storage is unavailable. Enable it to sign in.'}
});
