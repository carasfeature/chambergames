// Original procedural ambience: no external sound files or audio downloads.
export function createAmbience(button){
 let ctx,master,bus,musicBus,endingBus,noise,muted=false,wanted=false,ending=false,rail=0,cue=8+Math.random()*7;
 const live=new Set();
 let musicAt=0,musicStep=0;
 const rooBeats=new WeakMap();
 let lastRooBeat=-1;
 const powerLoops={};
 let nextBubble=0,nextSlosh=0;
 // Original minor-mode music-box phrase, not adapted from an existing soundtrack.
 const melody=[76,null,79,78,71,null,74,null,75,null,78,74,70,null,71,null,76,null,83,81,79,null,78,74,75,null,71,70,66,null,71,null];
 const harmony=[[52,59,66],[48,55,63],[45,52,60],[47,54,62]];
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
 function musicNote(at,midi,duration,volume,chime=false){
  const hz=440*Math.pow(2,(midi-69)/12);
  for(const [ratio,level] of (chime?[[1,1],[2,.22],[3,.08]]:[[1,1],[2,.12]])){
   const o=track(ctx.createOscillator());o.type='sine';o.frequency.value=hz*ratio;
   const g=ctx.createGain();g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume*level,at+(chime?.015:.65));g.gain.exponentialRampToValueAtTime(.0001,at+duration);
   const p=ctx.createStereoPanner();p.pan.value=chime?Math.sin(musicStep*.7)*.35:0;
   o.connect(g);g.connect(p);p.connect(musicBus);o.onended=()=>{live.delete(o);[o,g,p].forEach(n=>n.disconnect());};o.start(at);o.stop(at+duration+.05);
  }
 }
 function music(speed){
  if(musicAt<ctx.currentTime-.2)musicAt=ctx.currentTime+.03;
  while(musicAt<ctx.currentTime+.18){
   const chord= harmony[Math.floor(musicStep/32)%4];
   if(musicStep%2===0){
    const note=melody[Math.floor(musicStep/2)%melody.length];
    if(note!==null){musicNote(musicAt,note,1.4,.060,true);musicNote(musicAt+.16,note,1.1,.010,true);}
   }
   if(musicStep%32===0)for(const n of chord)musicNote(musicAt,n,6.5,.018);
   // Short eighth-note bass ostinato and a heartbeat-like kick drive the chase.
   tone(musicAt,.16,440*Math.pow(2,((chord[musicStep%4===3?1:0]-12)-69)/12),440*Math.pow(2,((chord[musicStep%4===3?1:0]-12)-69)/12),.065,0,musicBus);
   if(musicStep%2===0)tone(musicAt,.15,105,42,.16,0,musicBus);
   noiseBurst(musicAt,.045,6500, .7,musicStep%2?.027:.018,musicStep%2?.25:-.25,6500,musicBus);
   if(musicStep%8===4)noiseBurst(musicAt,.12,1500,.8,.075,0,1500,musicBus);
   const bpm=138+Math.min(12,Math.max(0,speed-20)*1.2);
   musicAt+=30/bpm;musicStep++;
  }
 }
 try{muted=localStorage.getItem('hoopers.sound.muted')==='true';}catch{}
 function label(){button.textContent=muted?'Sound: off':'Sound: on';button.setAttribute('aria-pressed',String(!muted));button.setAttribute('aria-label',muted?'Unmute game ambience':'Mute game ambience');}
 function track(node){live.add(node);node.onended=()=>{live.delete(node);try{node.disconnect();}catch{}};return node;}
 function init(){
  if(ctx)return;
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('Audio unavailable');
  ctx=new Audio();master=ctx.createGain();master.gain.value=muted?0:.26;
  const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-18;limiter.ratio.value=8;limiter.attack.value=.01;limiter.release.value=.2;master.connect(limiter);limiter.connect(ctx.destination);
  bus=ctx.createGain();bus.gain.value=0;bus.connect(master);
  musicBus=ctx.createGain();musicBus.connect(bus);
  endingBus=ctx.createGain();endingBus.gain.value=0;endingBus.connect(master);
  noise=ctx.createBuffer(1,ctx.sampleRate*6,ctx.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  for(const [name,frequency,q] of [['toast',340,3.5],['beer',4200,.6]]){
   const source=ctx.createBufferSource();source.buffer=noise;source.loop=true;
   const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=q;
   const gain=ctx.createGain();gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(bus);source.start();
   powerLoops[name]={gain:gain.gain,filter};
  }
  const loop=ctx.createBufferSource();loop.buffer=noise;loop.loop=true;
  const low=ctx.createBiquadFilter();low.type='lowpass';low.frequency.value=160;low.Q.value=.5;
  const gain=ctx.createGain();gain.gain.value=.7;loop.connect(low);low.connect(gain);gain.connect(bus);loop.start();
  const hum=ctx.createOscillator();hum.type='sine';hum.frequency.value=43;const hg=ctx.createGain();hg.gain.value=.055;hum.connect(hg);hg.connect(bus);hum.start();
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
 function distantCue(){
  const t=ctx.currentTime,side=(Math.random()<.5?-1:1)*.7,kind=Math.floor(Math.random()*3);
  if(kind===0){noiseBurst(t,3.5,1700,6,.09,side,650);tone(t,2.8,950,540,.018,side);}
  else if(kind===1){for(let i=0;i<5;i++){const at=t+i*.18;noiseBurst(at,.16,650,1,.07,side-i*.15);tone(at,.10,1800+i*120,1050,.018,side-i*.15);}}
  else{noiseBurst(t,4,430,3,.16,side,190);tone(t,3.7,125,83,.025,-side);tone(t+.5,2.5,132,96,.018,side);}
 }
 function reconcile(){if(!ctx)return;const t=ctx.currentTime;bus.gain.cancelScheduledValues(t);bus.gain.setTargetAtTime(wanted&&!muted&&!document.hidden?1:0,t,.12);endingBus.gain.setTargetAtTime(ending&&!muted&&!document.hidden?1:0,t,.008);}
 document.addEventListener('visibilitychange',reconcile);
 async function unlock(){try{init();await ctx.resume();reconcile();}catch{muted=true;label();}}
 button.onclick=()=>{muted=!muted;try{localStorage.setItem('hoopers.sound.muted',String(muted));}catch{}label();if(!muted)unlock();if(master)master.gain.setTargetAtTime(muted?0:.26,ctx.currentTime,.05);reconcile();};
 label();
 return {
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
  update(dt,speed){
   if(!ctx||ctx.state!=='running'||!wanted||muted||document.hidden)return;
   music(speed);rail-=dt;cue-=dt;
   if(rail<=0){rail=2.4/Math.max(12,speed);const t=ctx.currentTime;noiseBurst(t,.07,280,1,.14,-.3);noiseBurst(t+.055,.06,410,1,.10,.3);}
   if(cue<=0){distantCue();cue=12+Math.random()*16;}
  }
 };
}
