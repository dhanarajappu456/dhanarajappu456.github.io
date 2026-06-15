const navToggle=document.querySelector('.nav-toggle');
const nav=document.querySelector('.site-nav');
function setMenu(open){
  nav?.classList.toggle('open',open);
  navToggle?.classList.toggle('active',open);
  document.body.classList.toggle('nav-open',open);
  navToggle?.setAttribute('aria-expanded',String(open));
  navToggle?.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');
}
navToggle?.addEventListener('click',()=>setMenu(!nav?.classList.contains('open')));
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
window.addEventListener('resize',()=>{if(innerWidth>980)setMenu(false)},{passive:true});

const typingTarget=document.getElementById('typewriter');
const typingPhrases=[
  'Building Scalable Software',
  'Designing Intelligent AI Systems',
  'Creating Full-Stack Applications',
  'Engineering Developer Tools',
  'Building Distributed Systems',
  'Automating Real-World Workflows',
  'Solving DSA & System Design Problems',
  'Mentoring Future Engineers'
];
let phraseIndex=0,charIndex=0,deleting=false;
function typeLoop(){
  if(!typingTarget)return;
  const phrase=typingPhrases[phraseIndex];
  typingTarget.textContent=phrase.slice(0,charIndex);
  if(!deleting && charIndex<phrase.length){charIndex++;setTimeout(typeLoop,62);return;}
  if(!deleting && charIndex===phrase.length){deleting=true;setTimeout(typeLoop,1150);return;}
  if(deleting && charIndex>0){charIndex--;setTimeout(typeLoop,28);return;}
  deleting=false;phraseIndex=(phraseIndex+1)%typingPhrases.length;setTimeout(typeLoop,260);
}
typeLoop();

const reveals=document.querySelectorAll('.reveal');
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});
reveals.forEach(el=>io.observe(el));

const sections=[...document.querySelectorAll('section[id]')];
const links=[...document.querySelectorAll('.site-nav a')];
window.addEventListener('scroll',()=>{
  document.querySelector('.scroll-up-btn')?.classList.toggle('show',scrollY>500);
  let current='home';
  sections.forEach(s=>{if(scrollY>=s.offsetTop-160) current=s.id});
  links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current));
},{passive:true});

// Lightweight desktop-only animated mesh. Disabled on phones to avoid flicker.
const canvas=document.getElementById('meshCanvas');
const ctx=canvas?.getContext('2d');
const mobile=matchMedia('(max-width: 980px)').matches;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let dots=[];
function resizeCanvas(){
  if(!canvas||!ctx)return;
  canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;
  canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  dots=Array.from({length:75},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*2+1,h:190+Math.random()*130}));
}
function drawMesh(){
  if(!ctx)return;
  ctx.clearRect(0,0,innerWidth,innerHeight);
  for(const p of dots){
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0||p.x>innerWidth)p.vx*=-1;if(p.y<0||p.y>innerHeight)p.vy*=-1;
    ctx.beginPath();ctx.fillStyle=`hsla(${p.h},100%,65%,.55)`;ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
  }
  for(let i=0;i<dots.length;i++)for(let j=i+1;j<dots.length;j++){
    const a=dots[i],b=dots[j],d=Math.hypot(a.x-b.x,a.y-b.y);
    if(d<130){ctx.strokeStyle=`rgba(73,167,255,${(1-d/130)*.13})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  }
  requestAnimationFrame(drawMesh);
}
if(canvas&&!mobile&&!reduce){resizeCanvas();drawMesh();addEventListener('resize',resizeCanvas,{passive:true});}else{canvas?.remove();}

// Contact form: FormSubmit requires localhost or a hosted deployment, not file://.
const contactForm=document.getElementById('contactForm');
contactForm?.addEventListener('submit',e=>{
  if(location.protocol==='file:'){
    e.preventDefault();
    const note=contactForm.querySelector('.form-note');
    const msg='Open through localhost or deployment to submit: python -m http.server 5500';
    if(note) note.textContent=msg;
    alert(msg);
  }
});

// LeetCode stats. Uses multiple public APIs and avoids fake zero rendering when an API fails.
const LEETCODE_USER='dan_stark123';
const statSources=[
  `https://leet-code-api-opal.vercel.app/userInfo/${LEETCODE_USER}`,
  `https://leetcode-stats-api.herokuapp.com/${LEETCODE_USER}`,
  `https://alfa-leetcode-api.onrender.com/${LEETCODE_USER}/solved`,
  `https://leetcode-api-faisalshohag.vercel.app/${LEETCODE_USER}`
];
const toNum=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const pick=(obj,paths)=>{for(const path of paths){let cur=obj;for(const key of path.split('.'))cur=cur?.[key];const n=toNum(cur);if(n!==null)return n}return null};
function parseAcSubmissionArray(arr){
  if(!Array.isArray(arr))return null;const out={};
  for(const item of arr){const diff=String(item.difficulty||'').toLowerCase();const count=toNum(item.count);if(diff==='all')out.total=count;if(diff==='easy')out.easy=count;if(diff==='medium')out.medium=count;if(diff==='hard')out.hard=count}
  return Object.keys(out).length?out:null;
}
function normalizeLeetCode(data){
  const graphStats=parseAcSubmissionArray(data?.matchedUser?.submitStats?.acSubmissionNum)||parseAcSubmissionArray(data?.submitStats?.acSubmissionNum)||parseAcSubmissionArray(data?.acSubmissionNum);
  const easy=pick(data,['easySolved','easy','solvedStats.easy.count','problemsSolved.easy','data.easySolved']) ?? graphStats?.easy;
  const medium=pick(data,['mediumSolved','medium','solvedStats.medium.count','problemsSolved.medium','data.mediumSolved']) ?? graphStats?.medium;
  const hard=pick(data,['hardSolved','hard','solvedStats.hard.count','problemsSolved.hard','data.hardSolved']) ?? graphStats?.hard;
  const total=pick(data,['totalSolved','total','solvedProblem','totalProblemsSolved','data.totalSolved']) ?? graphStats?.total ?? ([easy,medium,hard].every(v=>v!==null&&v!==undefined)?easy+medium+hard:null);
  const totalEasy=pick(data,['totalEasy','totalQuestions.easy','allQuestionsCount.1.count','data.totalEasy']) ?? 873;
  const totalMedium=pick(data,['totalMedium','totalQuestions.medium','allQuestionsCount.2.count','data.totalMedium']) ?? 1823;
  const totalHard=pick(data,['totalHard','totalQuestions.hard','allQuestionsCount.3.count','data.totalHard']) ?? 839;
  if([easy,medium,hard,total].some(v=>v===null||v===undefined))return null;
  return {easy,medium,hard,total,totalEasy,totalMedium,totalHard};
}
function animateNumber(el,end){if(!el)return;const start=0,dur=800,t0=performance.now();function frame(t){const p=Math.min(1,(t-t0)/dur);el.textContent=Math.round(start+(end-start)*(1-Math.pow(1-p,3))).toLocaleString();if(p<1)requestAnimationFrame(frame)}requestAnimationFrame(frame)}
function setRing(selector,count,total){const ring=document.querySelector(selector);if(!ring)return;const pct=Math.max(1,Math.min(100,Math.round((count*100)/Math.max(1,total))));ring.style.setProperty('--p',pct);animateNumber(ring.querySelector('span'),count)}
function renderLeetCode(stats){animateNumber(document.querySelector('.prob-count'),stats.total);setRing('.ring-easy',stats.easy,stats.totalEasy);setRing('.ring-medium',stats.medium,stats.totalMedium);setRing('.ring-hard',stats.hard,stats.totalHard)}
async function loadLeetCode(){
  for(const url of statSources){try{const resp=await fetch(url,{cache:'no-store'});if(!resp.ok)continue;const json=await resp.json();const stats=normalizeLeetCode(json);if(stats){renderLeetCode(stats);return;}}catch(err){}}
  const fallback=Number(document.querySelector('.prob-count')?.dataset.fallback)||1020;
  document.querySelector('.prob-count').textContent=fallback.toLocaleString();
  document.querySelectorAll('.ring span').forEach(s=>s.textContent='—');
  document.querySelectorAll('.ring').forEach(r=>r.style.setProperty('--p',68));
}
loadLeetCode();
