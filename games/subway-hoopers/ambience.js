// Supplied music and button recordings with original gameplay effects.
export function createAmbience(button,slider){
 let ctx,master,bus,musicBus,endingBus,noise,muted=false,wanted=false,ending=false;
 const live=new Set();
 let volume=70,lastVolume=70,screen="ready",unlocked=false;
 const tracks={menu:new Audio(new URL("./audio/menus.mp3",import.meta.url)),game:new Audio(new URL("./audio/game.mp3",import.meta.url))};
 const clickAudio=new Audio(new URL("./audio/buttons.mp3",import.meta.url));
 Object.values(tracks).forEach(a=>{a.loop=true;a.preload="auto";});clickAudio.preload="auto";
 for(const a of [...Object.values(tracks),clickAudio]){a.hidden=true;document.body.append(a);}
 const rooBeats=new WeakMap();
 let lastRooBeat=-1;
 const powerLoops={};
 let nextBubble=0,nextSlosh=0;
 function eatingCrunch(at,strength,rate){
  // Original granular chew texture: clustered crunchy transients, no sampled game audio.
  const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.145),ctx.sampleRate);
  const data=buffer.getChannelData(0);let low=0,grain=0;
  for(let i=0;i<data.length;i++){
   const time=i/ctx.sampleRate;
   if(i%5===0)grain=Math.random()*2-1;
   low+=.12*(grain-low);
   let envelope=0;
   for(const [onset,weight] of [[0,1],[.024,.75],[.059,.50],[.096,.30]]){
    const age=time-onset;if(age>=0)envelope+=weight*(1-Math.exp(-age*2200))*Math.exp(-age*110);
   }
   data[i]=(low*.8+grain*.35)*envelope;
  }
  const source=track(ctx.createBufferSource());source.buffer=buffer;source.playbackRate.value=rate;
  const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2900;
  const gain=ctx.createGain();gain.gain.value=strength;
  source.connect(filter);filter.connect(gain);gain.connect(bus);
  source.onended=()=>{live.delete(source);[source,filter,gain].forEach(n=>n.disconnect());};source.start(at);
 }
 try{const saved=localStorage.getItem('hoopers.sound.volume');if(saved!==null&&Number.isFinite(Number(saved)))volume=Math.max(0,Math.min(100,Number(saved)));else if(localStorage.getItem('hoopers.sound.muted')==='true')volume=0;}catch{}
 muted=volume===0;if(volume>0)lastVolume=volume;
 function label(){slider.value=String(volume);document.querySelector('#volume-value').textContent=volume+'%';button.textContent=muted?'🔇':'🔊';button.setAttribute('aria-pressed',String(muted));button.setAttribute('aria-label',muted?'Unmute sound':'Mute sound');}
 function syncMusic(){
  const selected=(screen==='running'||screen==='over')?'game':'menu';
  for(const [name,a] of Object.entries(tracks)){
   if(name!==selected||document.hidden||muted||!unlocked)a.pause();
   else if(a.paused)a.play().catch(()=>{});
  }
 }
 function setVolume(value){
  volume=Math.max(0,Math.min(100,Number(value)));muted=volume===0;if(volume>0)lastVolume=volume;
  try{localStorage.setItem('hoopers.sound.volume',String(volume));localStorage.setItem('hoopers.sound.muted',String(muted));}catch{}
  label();if(master)master.gain.setTargetAtTime(.26*volume/100,ctx.currentTime,.03);reconcile();syncMusic();
 }
 function track(node){live.add(node);node.onended=()=>{live.delete(node);try{node.disconnect();}catch{}};return node;}
 function init(){
  if(ctx)return;
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('Audio unavailable');
  ctx=new Audio();master=ctx.createGain();master.gain.value=.26*volume/100;
  const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-18;limiter.ratio.value=8;limiter.attack.value=.01;limiter.release.value=.2;master.connect(limiter);limiter.connect(ctx.destination);
  bus=ctx.createGain();bus.gain.value=0;bus.connect(master);
  musicBus=ctx.createGain();musicBus.connect(master);
  for(const a of Object.values(tracks))ctx.createMediaElementSource(a).connect(musicBus);
  ctx.createMediaElementSource(clickAudio).connect(master);
  endingBus=ctx.createGain();endingBus.gain.value=0;endingBus.connect(master);
  noise=ctx.createBuffer(1,ctx.sampleRate*6,ctx.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  for(const [name,frequency,q] of [['toast',340,3.5],['beer',4200,.6]]){
   const source=ctx.createBufferSource();source.buffer=noise;source.loop=true;
   const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=q;
   const gain=ctx.createGain();gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(bus);source.start();
   powerLoops[name]={gain:gain.gain,filter};
  }
 }
 function noiseBurst(at,duration,freq,q,volume,pan=0,endFreq=freq,destination=bus){
  const s=track(ctx.createBufferSource());s.buffer=noise;s.loop=true;
  const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(freq,at);f.frequency.exponentialRampToValueAtTime(Math.max(30,endFreq),at+duration);f.Q.value=q;
  const g=ctx.createGain();g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(volume,at+Math.min(.25,duration*.2));g.gain.exponentialRampToValueAtTime(.0001,at+duration);
  const p=ctx.createStereoPanner();p.pan.value=pan;s.connect(f);f.connect(g);g.connect(p);p.connect(destination);s.onended=()=>{live.delete(s);[s,f,g,p].forEach(n=>n.disconnect());};s.start(at);s.stop(at+duration+.05);
 }
 function tone(at,duration,start,end,volume,pan=0,destination=bus,attack=.035){
  const o=track(ctx.createOscillator());o.type='sine';o.frequency.setValueAtTime(start,at);o.frequency.exponentialRampToValueAtTime(end,at+duration);
  const g=ctx.createGain();g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+attack);g.gain.exponentialRampToValueAtTime(.0001,at+duration);
  const p=ctx.createStereoPanner();p.pan.value=pan;o.connect(g);g.connect(p);p.connect(destination);o.onended=()=>{live.delete(o);[o,g,p].forEach(n=>n.disconnect());};o.start(at);o.stop(at+duration+.03);
 }
 function reconcile(){if(!ctx)return;const t=ctx.currentTime;bus.gain.cancelScheduledValues(t);bus.gain.setTargetAtTime(wanted&&!muted&&!document.hidden?1:0,t,.12);endingBus.gain.setTargetAtTime(ending&&!muted&&!document.hidden?1:0,t,.008);}
 document.addEventListener('visibilitychange',()=>{reconcile();syncMusic();if(document.hidden)clickAudio.pause();});
 async function unlock(){try{init();unlocked=true;await ctx.resume();reconcile();syncMusic();}catch(error){console.warn('Audio could not start',error);}}
 button.onclick=()=>{setVolume(muted?lastVolume:0);unlock();};
 slider.addEventListener('input',()=>{setVolume(slider.value);unlock();});
 document.addEventListener('pointerdown',()=>unlock(),{once:true});
 document.addEventListener('keydown',()=>unlock(),{once:true});
 document.addEventListener('click',event=>{
  const target=event.target.closest('button');if(!target||target.disabled)return;
  unlock();if(muted||document.hidden)return;clickAudio.currentTime=0;clickAudio.play().catch(()=>{});
 },true);
 label();syncMusic();
 return {
  setScreen(value){screen=value;syncMusic();},
  start(){wanted=true;ending=false;if(!muted)unlock();reconcile();},
  setRunning(value){wanted=value;reconcile();},
  difficulty(){
   if(!wanted||ctx?.state!=='running'||muted||document.hidden)return;
   const t=ctx.currentTime;
   // Two clean station-chime notes, with a quiet bell overtone.
   for(const [delay,hz] of [[0,880],[.28,659.25]]){
    tone(t+delay,.65,hz,hz,.18,0,bus,.006);
    tone(t+delay,.35,hz*2,hz*2,.035,0,bus,.004);
   }
  },
  gameOver(){
   if(ctx?.state!=='running'||muted||document.hidden)return;
   ending=true;reconcile();const t=ctx.currentTime+.012;
   // Cartoon whack followed by a short descending musical ending.
   tone(t,.20,220,52,.975,0,endingBus,.002);
   tone(t,.16,520,140,.30,0,endingBus,.003);
   noiseBurst(t,.11,1250,.8,.72,0,450,endingBus);
   for(const [delay,hz] of [[.24,392],[.44,329.63],[.64,246.94]]){
    tone(t+delay,.4,hz,hz,.285,0,endingBus,.012);
    tone(t+delay,.42,hz/2,hz/2,.15,0,endingBus,.012);
   }
  },
  pickup(type){
   if(!wanted||ctx?.state!=='running'||muted||document.hidden)return;
   const t=ctx.currentTime;
   if(type==='toast'){
    noiseBurst(t,.16,650,2,.32,0,190);
    tone(t,.17,310,65,.26,0,bus,.006);
    for(let i=0;i<3;i++)tone(t+.045+i*.045,.075,480-i*75,130,.09,0,bus,.004);
   }else if(type==='burger'){
    for(const [delay,strength,rate] of [[0,.95,1],[.15,.88,.88],[.31,1.0,1.08],[.48,.78,.94]])eatingCrunch(t+delay,strength,rate);
    musicBus.gain.cancelScheduledValues(t);musicBus.gain.setValueAtTime(.55,t);
    musicBus.gain.setValueAtTime(.55,t+.58);musicBus.gain.linearRampToValueAtTime(1,t+.78);
   }else if(type==='beer'){
    for(const [delay,hz] of [[0,1950],[.055,2670]])tone(t+delay,.24,hz,hz*.98,.09,0,bus,.002);
    tone(t+.14,.085,680,180,.14,0,bus,.002);
    noiseBurst(t+.145,.08,2400,.7,.12);
   }
  },
  powers(run){
   if(!ctx)return;
   const t=ctx.currentTime,active=run.status==='running';
   const sliding=active&&run.powers.toast>0&&run.grounded&&!run.powers.beer;
   const flying=active&&run.powers.beer>0;
   powerLoops.toast.gain.setTargetAtTime(sliding?.035:0,t,.07);
   powerLoops.toast.filter.frequency.setTargetAtTime(330+Math.sin(run.time*7)*160,t,.07);
   if(sliding&&wanted&&!muted&&!document.hidden&&ctx.state==='running'&&t>=nextSlosh){
    const pan=Math.sin(run.time*5)*.35;
    // Resonant liquid swoops and rounded bubbles replace the dry scraping hiss.
    noiseBurst(t,.24,480,5,.19,pan,135);
    tone(t+.035,.14,570,155,.075,pan,bus,.012);
    tone(t+.12,.09,340,110,.05,-pan,bus,.008);
    nextSlosh=t+.23+Math.random()*.12;
   }
   powerLoops.beer.gain.setTargetAtTime(flying?.08:0,t,.10);
   if(flying&&wanted&&!muted&&!document.hidden&&ctx.state==='running'&&t>=nextBubble){
    tone(t,.075,550+Math.random()*250,210,.0175,Math.random()*.5-.25,bus,.004);
    nextBubble=t+.10+Math.random()*.14;
   }
  },
  movement(kind,direction=0,sand=false){
   if(!wanted||ctx?.state!=='running'||muted||document.hidden)return;
   const t=ctx.currentTime;
   if(kind==='lane')noiseBurst(t,.12,1300,.6,.075,direction*.3,650);
   if(kind==='burgerJump'){
    tone(t,.10,420,1150,.16,0,bus,.008);
    tone(t+.085,.14,1150,530,.12,0,bus,.008);
   }
   if(kind==='jump'||kind==='burgerJump'){
    noiseBurst(t,.09,2200,.55,.085,0,1100);
    noiseBurst(t+.035,.075,900,.7,.045);
   }
   if(kind==='land'){
    tone(t,.19,145,52,.34);
    noiseBurst(t,.075,460,1,.34,0,180);
    noiseBurst(t,sand?.25:.13,sand?1450:1900,.65,sand?.34:.24,0,650);
   }
  },
  kangaroos(run){
   if(!wanted||run.status!=='running'||ctx?.state!=='running'||muted||document.hidden)return;
   const t=ctx.currentTime;
   const approaching=run.obstacles.filter(o=>o.type==='roo'&&o.z<0&&o.z>=-38).sort((a,b)=>b.z-a.z).slice(0,1);
   for(const o of approaching){
    const proximity=1+o.z/38;
    if(t<(rooBeats.get(o)??0)||t-lastRooBeat<.42)continue;
    const pan=Math.max(-.75,Math.min(.75,(o.x-run.x)/6));
    const volume=.15+.27*proximity*proximity;
    // Two weighty impacts: deep body plus a hollow upper resonance, no sandy noise.
    for(const [delay,strength] of [[0,1],[.12,.72]]){
     tone(t+delay,.24,135,48,volume*strength,pan,bus,.004);
     tone(t+delay,.115,310,165,volume*.42*strength,pan,bus,.003);
     tone(t+delay,.055,540,280,volume*.16*strength,pan,bus,.002);
    }
    const gain=musicBus.gain;
    gain.cancelScheduledValues(t);gain.setValueAtTime(1,t);
    gain.linearRampToValueAtTime(.62,t+.025);
    gain.setValueAtTime(.62,t+.18);gain.linearRampToValueAtTime(1,t+.36);
    rooBeats.set(o,t+.68-.20*proximity);lastRooBeat=t;
   }
  },
  footsteps(run,contacts){
   const walking=run.status==='running'&&run.grounded&&run.surface>.05&&!run.powers.toast&&!run.powers.beer;
   contacts.forEach(i=>{
    if(walking&&ctx?.state==='running'&&!muted&&!document.hidden){
     const t=ctx.currentTime,pan=i===0?-.18:.18,variation=.9+Math.random()*.2;
     if(run.surface>.05){
      noiseBurst(t,.18,1100,.65,.24*variation,pan,550);
      noiseBurst(t+.025,.11,3400,.7,.10*variation,pan,1800);
     }
    }
   });
  },
 };
}
