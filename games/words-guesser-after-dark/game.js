import {WORDS} from './words.js?v=ordered-14';
const TRIES=6,$=id=>document.getElementById(id);
const board=$('board'),keysEl=$('keys'),toast=$('toast'),veilEnd=$('veilEnd');
const layout=["qwertyuiop","asdfghjkl","*zxcvbnm<"];
keysEl.innerHTML=layout.map(line=>'<div class="krow">'+[...line].map(key=>key==='*'?'<button class="key wide" data-k="Enter">Enter</button>':key==='<'?'<button class="key wide" data-k="Backspace" aria-label="Delete">⌫</button>':'<button class="key" data-k="'+key+'">'+key+'</button>').join('')+'</div>').join('');
const words=[...new Set(WORDS.map(w=>String(w).trim().toLowerCase()).filter(w=>/^[a-z]{5}$/.test(w)))];
let nextWord=0,answer='',progress,state='empty',timer;
const blank=()=>({guesses:[],draft:'',done:false,won:false});
function score(guess, target){
  const result = Array(5).fill("miss"), left = {};
  for(let i=0;i<5;i++){
    if(guess[i] === target[i]) result[i] = "hit";
    else left[target[i]] = (left[target[i]] || 0) + 1;
  }
  for(let i=0;i<5;i++){
    if(result[i] !== "hit" && left[guess[i]] > 0){ result[i] = "near"; left[guess[i]]--; }
  }
  return result;
}
function paint(animateLast=false){
  const best = {}, rank = { miss:0, near:1, hit:2 };
  board.innerHTML = Array.from({length:TRIES}, (_, row) => {
    const guess = progress.guesses[row] || (row === progress.guesses.length ? progress.draft : "");
    const result = row < progress.guesses.length ? score(guess, answer) : null;
    return `<div class="row">${Array.from({length:5}, (_, col) => {
      const letter = guess[col] || "";
      if(result && (!best[letter] || rank[result[col]] > rank[best[letter]])) best[letter] = result[col];
      const classes = ["tile", letter && !result ? "filled" : "", result ? result[col] : "", animateLast && row === progress.guesses.length - 1 ? "flip" : ""].filter(Boolean).join(" ");
      const delay = animateLast && row === progress.guesses.length - 1 ? ` style="animation-delay:${col * 90}ms"` : "";
      return `<div class="${classes}"${delay}>${letter}</div>`;
    }).join("")}</div>`;
  }).join("");
  keysEl.querySelectorAll(".key").forEach(key => {
    key.classList.remove("hit","near","miss");
    if(best[key.dataset.k]) key.classList.add(best[key.dataset.k]);
    key.disabled = state !== "playing";
  });
}

function startRound(){
 clearTimeout(timer);veilEnd.classList.remove('on');toast.textContent='';progress=blank();$('nextRound').hidden=true;
 if(!words.length){answer='';state='empty';$('empty').hidden=false;paint();return;}
 $('empty').hidden=true;
 answer=words[nextWord];nextWord=(nextWord+1)%words.length;state='playing';paint();
}
function resultOverlay(){
 $('endTitle').textContent=progress.won?'Congratulations!':'One that got away.';
 $('endWord').textContent=answer;
 $('endSub').textContent=progress.won?'Solved in '+progress.guesses.length+' of 6 guesses. Ready for another?':'That was the word. Try your luck with the next one.';
 veilEnd.classList.add('on');$('btnAgain').focus();
}
function finish(won){
 progress.done=true;progress.won=won;progress.draft='';state='done';paint(true);
 $('nextRound').hidden=false;timer=setTimeout(resultOverlay,900);
}
function flash(message){
  toast.textContent = message;
  const row = board.children[progress.guesses.length];
  if(row){ row.classList.remove("shake"); void row.offsetWidth; row.classList.add("shake"); }
}
function submit(){
  if(progress.draft.length < 5) return flash("Not enough letters");
  const guess = progress.draft;
  progress.guesses.push(guess);
  progress.draft = "";

  toast.textContent = "";
  if(guess === answer || progress.guesses.length >= TRIES){
    finish(guess === answer);
  }else{
    paint(true);
  }
}
function press(key){
  if(document.getElementById("welcome")?.open)return;
  if(state !== "playing") return;
  if(key === "Enter") return submit();
  if(key === "Backspace") progress.draft = progress.draft.slice(0,-1);
  else if(/^[a-z]$/.test(key) && progress.draft.length < 5) progress.draft += key;
  else return;
 paint();
}
keysEl.addEventListener("click", event => {
  const button = event.target.closest(".key");
  if(button){ press(button.dataset.k); button.blur(); }
});
document.addEventListener("keydown", event => {
  if(document.getElementById("welcome")?.open)return;
  if(event.ctrlKey || event.metaKey || event.altKey || state !== "playing") return;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if(key === "Enter" || key === "Backspace" || /^[a-z]$/.test(key)){
    event.preventDefault(); press(key);
  }
});

$('btnLook').onclick=()=>{veilEnd.classList.remove('on');$('nextRound').focus();};
$('btnAgain').onclick=startRound;$('nextRound').onclick=startRound;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&veilEnd.classList.contains('on'))$('btnLook').click();});
startRound();

const welcome=document.getElementById('welcome');
document.getElementById('welcome-close').onclick=()=>welcome.close();
welcome.showModal();
