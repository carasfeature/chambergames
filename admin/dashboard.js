const routes = {
  home: ['Production Team'], content: ['Content Team','home'], technical: ['Technical Production','home'],
  stream: ['For Stream','home'], controls: ['Controls Panel','home'], games: ['Games','controls'],
  tournaments: ['Tournaments','controls'], settings: ['Website Settings','controls'],
  wheel: ['Autumn Luck','stream'], caption: ['Caption This v2','games']
};
function route() {
  const hash = location.hash.slice(1);
  const key = Object.hasOwn(routes, hash) ? hash : 'home';
  for (const section of document.querySelectorAll('main > section')) section.hidden = section.id !== key;
  const [title,parent] = routes[key];
  document.querySelector('#heading').textContent = title;
  document.querySelector('#backbar').hidden = !parent;
  document.querySelector('#back').href = '#' + (parent || 'home');
  const frame = document.getElementById(key).querySelector('iframe');
  if (frame && !frame.hasAttribute('src')) frame.src = frame.dataset.src;
  window.scrollTo(0,0);
}
addEventListener('hashchange',route);
route();
function theme(mode) {
  document.documentElement.classList.toggle('light',mode === 'light');
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.mode === mode)));
}
theme(localStorage.getItem('production-theme') || 'dark');
document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => {
  theme(b.dataset.mode);
  localStorage.setItem('production-theme',b.dataset.mode);
});
const clocks = [...document.querySelectorAll('[data-zone]')].map(clock => ({
    clock,
    format: new Intl.DateTimeFormat('en-GB', {
      timeZone: clock.dataset.zone, hour: '2-digit', minute: '2-digit'
    })
  }));
  function updateTimes() {
    const now = new Date();
    clocks.forEach(({clock, format}) => { clock.textContent = format.format(now); });
  }
  updateTimes();
  setInterval(updateTimes, 1000);
const date=document.getElementById('release-date'),tba=document.getElementById('release-tba'),zone=Intl.DateTimeFormat().resolvedOptions().timeZone;
document.getElementById('timezone').textContent='Timezone: '+zone+'. The release represents the same moment for all viewers.';
const saved=JSON.parse(localStorage.getItem('chamber-admin-local-db')||'{}').tournament?.gameRelease;
if(saved?.at){const d=new Date(saved.at);date.value=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}
tba.checked=!saved?.at;date.disabled=tba.checked;tba.onchange=()=>date.disabled=tba.checked;
document.getElementById('settings-form').onsubmit=async e=>{e.preventDefault();const status=document.getElementById('settings-status');if(!tba.checked&&!date.value){status.textContent='Choose a date and time or select TBA.';return}try{await localFirebase.set('tournament/gameRelease',tba.checked?null:{at:new Date(date.value).getTime(),timeZone:zone});status.textContent='Saved locally. The live website is unchanged.'}catch{status.textContent='Unable to save. Check browser storage availability.'}};
