/* ===== BOOT SEQUENCE ===== */
const BOOT=[
  {t:'[    0.000000] AppSec Lab :: Web Security Fundamentals',c:'cy'},
  {t:'[    0.000412] initializing learning kernel v2.0 ...',c:'dim'},
  {t:'[    0.010233] mounting /web ......................... <span class="ok">OK</span>'},
  {t:'[    0.024119] loading section: basics ............... <span class="ok">OK</span>'},
  {t:'[    0.031908] loading section: protocol ............. <span class="ok">OK</span>'},
  {t:'[    0.041355] loading section: client ............... <span class="ok">OK</span>'},
  {t:'[    0.048221] loading section: architecture ......... <span class="ok">OK</span>'},
  {t:'[    0.052744] loading section: state ................ <span class="ok">OK</span>'},
  {t:'[    0.058901] loading section: browser security ..... <span class="ok">OK</span>'},
  {t:'[    0.061355] sources: <span class="cy">MDN · RFC · OWASP · PortSwigger · web.dev</span>'},
  {t:'[    0.077901] scope: <span class="am">от устройства сети до модели безопасности браузера</span>'},
  {t:'[    0.088412] <span class="ok">ready.</span> welcome, future hacker.',c:'ok'},
];
(function(){
  const box=document.getElementById('bootbox');
  BOOT.forEach((l,i)=>{const d=document.createElement('div');d.className='line'+(l.c?' '+l.c:'');d.style.animationDelay=(i*.28)+'s';d.innerHTML=l.t;box.appendChild(d);});
  setTimeout(()=>{if(document.getElementById('app').style.display!=='block')enterApp();},4600);
})();
function enterApp(){
  const b=document.getElementById('boot');if(!b)return;b.style.display='none';
  document.getElementById('app').style.display='block';
  lsMigrate();buildNav();buildViews();initAllLabs();buildAllQuizzes();buildCards();buildProgressPanel();buildSearchIndex();loadProgress();
  const first=(location.hash||'').replace('#','')||'home';
  go(document.getElementById('view-'+first)?first:'home');
}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.getElementById('boot'))enterApp();});

/* ===== MODULES / NAV ===== */
const MODULES=[
  {id:'home',    ico:'▚', title:'Обзор · как учиться',      sec:'START'},
  {id:'web',     ico:'❖', title:'01 · Что такое веб',        sec:'BASICS'},
  {id:'net',     ico:'⇆', title:'02 · Сеть, IP и DNS',       sec:'BASICS'},
  {id:'tls',     ico:'⚿', title:'03 · HTTPS и TLS',          sec:'BASICS'},
  {id:'url',     ico:'⌘', title:'04 · URL, origin и site',   sec:'BASICS'},
  {id:'http',    ico:'⇅', title:'05 · HTTP: язык веба',      sec:'PROTOCOL'},
  {id:'httpv',   ico:'≡', title:'06 · Версии, прокси, кэш',  sec:'PROTOCOL'},
  {id:'html',    ico:'▧', title:'07 · HTML, CSS, JS',        sec:'CLIENT'},
  {id:'browser', ico:'▱', title:'08 · Браузер изнутри',      sec:'CLIENT'},
  {id:'arch',    ico:'◩', title:'09 · Web 1 → 2 → сегодня', sec:'ARCHITECTURE'},
  {id:'api',     ico:'⇄', title:'10 · API: REST и другие',   sec:'ARCHITECTURE'},
  {id:'state',   ico:'⚙', title:'11 · Cookies и сессии',     sec:'STATE'},
  {id:'auth',    ico:'⚿', title:'12 · AuthN и AuthZ',        sec:'STATE'},
  {id:'sop',     ico:'◯', title:'13 · Same-Origin Policy',   sec:'BROWSER SECURITY'},
  {id:'cors',    ico:'↔', title:'14 · CORS',                 sec:'BROWSER SECURITY'},
  {id:'csp',     ico:'⛨', title:'15 · CSP',                  sec:'BROWSER SECURITY'},
  {id:'headers', ico:'☷', title:'16 · Security headers',     sec:'BROWSER SECURITY'},
  {id:'owasp',   ico:'☠', title:'17 · Карта OWASP Top 10',   sec:'NEXT'},
  {id:'cards',   ico:'⌸', title:'Флеш-карты',                sec:'NEXT'},
];
const NOCOUNT=['home','cards'];

function buildNav(){
  const done=getDone();
  const secs=[];MODULES.forEach(m=>{if(secs.indexOf(m.sec)<0)secs.push(m.sec);});
  const total=MODULES.filter(m=>NOCOUNT.indexOf(m.id)<0).length;
  let html='<div class="brand"><div class="logo">◢ websec.lab</div><div class="tag">web fundamentals · for appsec</div></div>'
    +'<div class="progress-wrap"><div class="progress-bar"><div class="progress-fill" id="progFill"></div></div>'
    +'<div class="progress-txt" id="progTxt">0 / '+total+' модулей</div></div>';
  secs.forEach(s=>{
    html+='<div class="navsec">'+s+'</div>';
    MODULES.filter(m=>m.sec===s).forEach(m=>{
      html+='<div class="nav-item '+(done.indexOf(m.id)>=0?'done':'')+'" data-id="'+m.id+'" tabindex="0" role="button" aria-label="'+m.title+'"'
        +' onclick="go(&quot;'+m.id+'&quot;)" onkeydown="if(event.key===&quot;Enter&quot;||event.key===&quot; &quot;){event.preventDefault();go(&quot;'+m.id+'&quot;)}">'
        +'<span class="ico">'+m.ico+'</span><span>'+m.title+'</span><span class="chk">[✓]</span></div>';
    });
  });
  document.getElementById('sidebar').innerHTML=html;
}
function go(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  const v=document.getElementById('view-'+id);if(!v)return;
  v.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.id===id));
  location.hash=id;window.scrollTo({top:0,behavior:'smooth'});
  const a=document.querySelector('aside');if(a)a.classList.remove('open');
}

/* ===== STORAGE (namespaced + migration) ===== */
const LS={p:'wsl.progress',q:'wsl.quiz'};
function lsRead(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v);}catch(e){return d;}}
function lsWrite(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}
function lsMigrate(){
  try{
    if(localStorage.getItem(LS.p)===null){
      const old=localStorage.getItem('websec_progress');
      if(old!==null){localStorage.setItem(LS.p,old);localStorage.removeItem('websec_progress');}
    }
    if(localStorage.getItem(LS.q)===null){
      const oldq=localStorage.getItem('websec_quiz');
      if(oldq!==null){
        const o=JSON.parse(oldq)||{},n={};
        Object.keys(o).forEach(function(k){n[k]={i:0,ans:[],done:false,best:o[k].r};});
        localStorage.setItem(LS.q,JSON.stringify(n));localStorage.removeItem('websec_quiz');
      }
    }
  }catch(e){}
}

/* ===== PROGRESS ===== */
function getDone(){const v=lsRead(LS.p,[]);return Array.isArray(v)?v:[];}
function markDone(id){const d=getDone();if(d.indexOf(id)<0){d.push(id);lsWrite(LS.p,d);}refreshProgress();buildNav();renderProgressPanel();}
function loadProgress(){refreshProgress();}
function refreshProgress(){
  const done=getDone().filter(x=>NOCOUNT.indexOf(x)<0);
  const total=MODULES.filter(m=>NOCOUNT.indexOf(m.id)<0).length;
  const pct=total?Math.round(done.length/total*100):0;
  const f=document.getElementById('progFill');if(f)f.style.width=pct+'%';
  const t=document.getElementById('progTxt');if(t)t.textContent=done.length+' / '+total+' модулей';
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('done',getDone().indexOf(n.dataset.id)>=0));
}
function resetProgress(){
  try{localStorage.removeItem(LS.p);localStorage.removeItem(LS.q);
      localStorage.removeItem('websec_progress');localStorage.removeItem('websec_quiz');}catch(e){}
  QSTATE=null;ensureQState();
  refreshProgress();buildNav();buildAllQuizzes();
  PPSTATE.mode='idle';PPSTATE.msg='Прогресс сброшен.';PPSTATE.ok=true;renderProgressPanel();
}

/* ===== QUIZ ENGINE ===== */
let QSTATE=null;
function loadQuizState(){
  const raw=lsRead(LS.q,{})||{},out={};
  Object.keys(QUIZZES).forEach(function(k){
    const s=(raw&&typeof raw==='object'&&raw[k])?raw[k]:{};
    const n=QUIZZES[k].q.length;
    let ans=Array.isArray(s.ans)?s.ans.slice(0,n):[];
    ans=ans.map(function(a){return (typeof a==='number'&&a>=0&&a<9)?a:null;});
    let i=Number(s.i);if(!(i>=0&&i<n))i=0;
    let best=(typeof s.best==='number'&&s.best>=0&&s.best<=n)?s.best:undefined;
    out[k]={i:i,ans:ans,done:!!s.done,best:best};
  });
  return out;
}
function ensureQState(){if(!QSTATE)QSTATE=loadQuizState();return QSTATE;}
function saveQuizState(){lsWrite(LS.q,ensureQState());}

function buildAllQuizzes(){ensureQState();Object.keys(QUIZZES).forEach(k=>buildQuiz(k));}
function buildQuiz(key){
  const host=document.getElementById('quiz-'+key);if(!host)return;
  ensureQState();
  if(!QSTATE[key])QSTATE[key]={i:0,ans:[],done:false};
  renderQuiz(key);
}
function renderQuiz(key){
  const host=document.getElementById('quiz-'+key);if(!host)return;
  ensureQState();
  const Q=QUIZZES[key],st=QSTATE[key];if(!Q||!st)return;
  const dots=Q.q.map((_,i)=>{
    let c='qdot';const a=st.ans[i];
    if(a!==undefined&&a!==null)c+=(a===Q.q[i].c?' ok':' no');
    if(i===st.i&&!st.done)c+=' cur';
    return '<span class="'+c+'"></span>';
  }).join('');
  let body;
  if(st.done){
    const right=st.ans.filter((a,i)=>a===Q.q[i].c).length;
    const pct=Math.round(right/Q.q.length*100);
    let verdict;
    if(pct===100)verdict='Идеально. Секция закрыта — иди дальше.';
    else if(pct>=70)verdict='Хорошо. Вернись к вопросам с красной точкой и перечитай разбор.';
    else verdict='Слабо. Перечитай модули секции и пройди квиз заново — это и есть learning loop.';
    body='<div class="qscore"><div class="big">'+right+' / '+Q.q.length+'</div>'
      +'<div class="lb">'+pct+'% · '+verdict+'</div></div>'
      +'<div class="qnav"><button class="btn sm" onclick="_qReset(&quot;'+key+'&quot;)">↻ пройти заново</button>'
      +'<button class="btn sm gh" onclick="_qReview(&quot;'+key+'&quot;)">◀ разобрать ответы</button>'
      +'<span class="qdots">'+dots+'</span></div>';
  }else{
    const q=Q.q[st.i],picked=st.ans[st.i];
    const marks=['A','B','C','D','E','F'];
    const opts=q.o.map((o,i)=>{
      let cls='qopt';
      if(picked!==undefined&&picked!==null){
        cls+=' locked';
        if(i===q.c)cls+=' right';
        else if(i===picked)cls+=' wrong';
      }
      return '<button class="'+cls+'" '+(picked!==undefined&&picked!==null?'disabled':'')
        +' onclick="_qPick(&quot;'+key+'&quot;,'+i+')"><span class="mk">'+marks[i]+'</span><span>'+o+'</span></button>';
    }).join('');
    const exp=(picked!==undefined&&picked!==null)?'<div class="qexp"><b>'+(picked===q.c?'✓ верно.':'✗ не то.')+'</b> '+q.e+'</div>':'';
    const isLast=st.i===Q.q.length-1;
    body='<div class="qq">'+(st.i+1)+'. '+q.q+'</div><div class="qopts">'+opts+'</div>'+exp
      +'<div class="qnav">'
      +'<button class="btn sm gh" '+(st.i===0?'disabled':'')+' onclick="_qGo(&quot;'+key+'&quot;,-1)">◀ назад</button>'
      +'<button class="btn sm" '+((picked===undefined||picked===null)?'disabled':'')+' onclick="'+(isLast?'_qFinish':'_qGo')+'(&quot;'+key+'&quot;'+(isLast?'':',1')+')">'
      +(isLast?'подвести итог ✓':'дальше ▶')+'</button>'
      +'<span class="qdots">'+dots+'</span></div>';
  }
  const bestBadge=(st.best!==undefined)
    ?'<span class="qbest">лучший: '+st.best+' / '+Q.q.length+'</span>':'';
  host.innerHTML='<div class="quiz"><div class="quiz-head">◈ checkpoint · '+Q.title+bestBadge
    +'<span class="qcount">active recall · '+Q.q.length+' вопросов</span></div>'
    +'<div class="quiz-body">'+body+'</div></div>';
}
function qOk(key){ensureQState();return !!(QUIZZES[key]&&QSTATE[key]);}
window._qPick=function(key,i){if(!qOk(key))return;const st=QSTATE[key];if(st.ans[st.i]!==undefined&&st.ans[st.i]!==null)return;st.ans[st.i]=i;saveQuizState();renderQuiz(key);};
window._qGo=function(key,d){if(!qOk(key))return;const st=QSTATE[key],Q=QUIZZES[key];st.i=Math.max(0,Math.min(Q.q.length-1,st.i+(d||0)));renderQuiz(key);};
window._qFinish=function(key){if(!qOk(key))return;const st=QSTATE[key],Q=QUIZZES[key];st.done=true;
  const right=st.ans.filter((a,i)=>a===Q.q[i].c).length;
  if(st.best===undefined||right>st.best)st.best=right;
  saveQuizState();renderQuiz(key);renderProgressPanel();};
window._qReset=function(key){if(!QUIZZES[key])return;ensureQState();const b=QSTATE[key]?QSTATE[key].best:undefined;
  QSTATE[key]={i:0,ans:[],done:false,best:b};saveQuizState();renderQuiz(key);};
window._qReview=function(key){if(!qOk(key))return;QSTATE[key].done=false;QSTATE[key].i=0;saveQuizState();renderQuiz(key);};

/* ===== FLASHCARDS ===== */
const FCSTATE={tag:'all',i:0,flipped:false,deck:[]};
function fcTags(){const t=['all'];CARDS.forEach(c=>{if(t.indexOf(c.t)<0)t.push(c.t);});return t;}
function fcBuildDeck(){
  FCSTATE.deck=CARDS.filter(c=>FCSTATE.tag==='all'||c.t===FCSTATE.tag);
  FCSTATE.i=0;FCSTATE.flipped=false;
}
function buildCards(){
  const host=document.getElementById('cardsHost');if(!host)return;
  if(!FCSTATE.deck.length)fcBuildDeck();
  renderCards();
}
function renderCards(){
  const host=document.getElementById('cardsHost');if(!host)return;
  const tags=fcTags().map(t=>'<span class="chip'+(FCSTATE.tag===t?' on':'')+'" tabindex="0" role="button"'
    +' onclick="_fcTag(&quot;'+t+'&quot;)" onkeydown="if(event.key===&quot;Enter&quot;){_fcTag(&quot;'+t+'&quot;)}">'+t+'</span>').join('');
  const d=FCSTATE.deck;
  let face;
  if(!d.length){face='<div class="fc"><div class="fc-q">пусто</div></div>';}
  else{
    const c=d[Math.max(0,Math.min(d.length-1,FCSTATE.i))];
    face='<div class="fc" tabindex="0" role="button" aria-label="Перевернуть карточку" onclick="_fcFlip()" onkeydown="if(event.key===&quot;Enter&quot;||event.key===&quot; &quot;){event.preventDefault();_fcFlip()}">'
      +'<div class="fc-side">'+(FCSTATE.flipped?'ответ':'вопрос')+'</div><div class="fc-tag">'+c.t+'</div>'
      +(FCSTATE.flipped?'<div class="fc-a">'+c.a+'</div>':'<div class="fc-q">'+c.q+'</div>')
      +'<div class="fc-hint">'+(FCSTATE.flipped?'клик — назад к вопросу':'клик — показать ответ')+'</div></div>';
  }
  host.innerHTML='<div class="fc-wrap"><div class="fc-filters">'+tags+'</div>'+face
    +'<div class="fc-bar"><button class="btn sm gh" onclick="_fcStep(-1)">◀ пред</button>'
    +'<button class="btn sm" onclick="_fcStep(1)">след ▶</button>'
    +'<button class="btn sm gh" onclick="_fcShuffle()">⇄ перемешать</button>'
    +'<span class="cnt">'+(d.length?(FCSTATE.i+1):0)+' / '+d.length+'</span></div></div>';
}
window._fcTag=function(t){if(fcTags().indexOf(t)<0)return;FCSTATE.tag=t;fcBuildDeck();renderCards();};
window._fcFlip=function(){FCSTATE.flipped=!FCSTATE.flipped;renderCards();};
window._fcStep=function(d){
  d=Number(d)||0;
  if(!FCSTATE.deck.length)return;
  const n=FCSTATE.deck.length;
  FCSTATE.i=((FCSTATE.i+d)%n+n)%n;FCSTATE.flipped=false;renderCards();};
window._fcShuffle=function(){
  const a=FCSTATE.deck;
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}
  FCSTATE.i=0;FCSTATE.flipped=false;renderCards();};

/* ===== SEARCH (Ctrl+K) ===== */
let SIDX=[],SSEL=0;
function buildSearchIndex(){
  SIDX=[];
  MODULES.forEach(m=>{
    SIDX.push({id:m.id,txt:m.title,sub:m.sec});
    const v=document.getElementById('view-'+m.id);if(!v)return;
    v.querySelectorAll('.sect').forEach(h=>{const t=(h.textContent||'').trim();if(t)SIDX.push({id:m.id,txt:t,sub:m.title});});
    v.querySelectorAll('.card-t').forEach(h=>{const t=(h.textContent||'').trim();if(t)SIDX.push({id:m.id,txt:t,sub:m.title});});
  });
}
function openSearch(){
  const o=document.getElementById('searchOverlay');if(!o)return;
  o.classList.add('on');const i=document.getElementById('searchInput');
  if(i){i.value='';i.focus();}
  SSEL=0;renderSearch('');
}
function closeSearch(){const o=document.getElementById('searchOverlay');if(o)o.classList.remove('on');}
function searchHits(q){
  q=(q||'').trim().toLowerCase();
  if(!q)return SIDX.slice(0,9);
  return SIDX.filter(x=>x.txt.toLowerCase().indexOf(q)>=0||x.sub.toLowerCase().indexOf(q)>=0).slice(0,40);
}
function renderSearch(q){
  const box=document.getElementById('searchRes');if(!box)return;
  const hits=searchHits(q);
  if(!hits.length){box.innerHTML='<div class="sres-empty">ничего не найдено</div>';return;}
  if(SSEL>=hits.length)SSEL=hits.length-1;if(SSEL<0)SSEL=0;
  box.innerHTML=hits.map((h,i)=>'<div class="sres-item'+(i===SSEL?' sel':'')+'" onclick="go(&quot;'+h.id+'&quot;);closeSearch()">'
    +h.txt+'<span class="sm">'+h.sub+'</span></div>').join('');
}
document.addEventListener('keydown',function(e){
  const o=document.getElementById('searchOverlay');
  const open=o&&o.classList.contains('on');
  if((e.ctrlKey||e.metaKey)&&(e.key==='k'||e.key==='K')){e.preventDefault();open?closeSearch():openSearch();return;}
  if(!open)return;
  if(e.key==='Escape'){closeSearch();return;}
  const q=(document.getElementById('searchInput')||{}).value||'';
  const hits=searchHits(q);
  if(e.key==='ArrowDown'){e.preventDefault();SSEL=Math.min(hits.length-1,SSEL+1);renderSearch(q);}
  else if(e.key==='ArrowUp'){e.preventDefault();SSEL=Math.max(0,SSEL-1);renderSearch(q);}
  else if(e.key==='Enter'){e.preventDefault();if(hits[SSEL]){go(hits[SSEL].id);closeSearch();}}
});
document.addEventListener('input',function(e){
  if(e.target&&e.target.id==='searchInput'){SSEL=0;renderSearch(e.target.value);}
});

/* ===== PROGRESS PANEL: export / import ===== */
const PPSTATE={mode:'idle',msg:'',ok:true,code:''};
function b64enc(str){try{return btoa(unescape(encodeURIComponent(str)));}catch(e){return '';}}
function b64dec(str){try{return decodeURIComponent(escape(atob(str)));}catch(e){return '';}}
function exportProgress(){
  ensureQState();
  const q={};
  Object.keys(QSTATE).forEach(function(k){
    const st=QSTATE[k];
    q[k]={i:st.i,ans:st.ans,done:st.done,best:st.best};
  });
  return b64enc(JSON.stringify({v:2,prog:getDone(),quiz:q}));
}
function importProgress(str){
  const raw=b64dec(String(str||'').replace(/\s+/g,''));
  if(!raw)return false;
  let d;try{d=JSON.parse(raw);}catch(e){return false;}
  if(!d||d.v!==2||!Array.isArray(d.prog))return false;
  const ids=MODULES.map(function(m){return m.id;});
  lsWrite(LS.p,d.prog.filter(function(x){return typeof x==='string'&&ids.indexOf(x)>=0;}));
  if(d.quiz&&typeof d.quiz==='object')lsWrite(LS.q,d.quiz);
  QSTATE=null;ensureQState();
  refreshProgress();buildNav();buildAllQuizzes();
  return true;
}
function buildProgressPanel(){renderProgressPanel();}
function renderProgressPanel(){
  const el=document.getElementById('progressPanel');if(!el)return;
  ensureQState();
  const done=getDone().filter(function(x){return NOCOUNT.indexOf(x)<0;});
  const total=MODULES.filter(function(m){return NOCOUNT.indexOf(m.id)<0;}).length;
  const qk=Object.keys(QUIZZES);
  const passed=qk.filter(function(k){return QSTATE[k]&&QSTATE[k].best!==undefined;});
  const sum=passed.reduce(function(a,k){return a+QSTATE[k].best;},0);
  const max=passed.reduce(function(a,k){return a+QUIZZES[k].q.length;},0);

  let h='<div class="kv" style="margin-top:0">'
    +'<div class="kv-row"><div class="kv-k">Модули</div><div class="kv-v"><span class="gs">'+done.length+'</span> / '+total+' пройдено</div></div>'
    +'<div class="kv-row"><div class="kv-k">Квизы</div><div class="kv-v">'
    +(passed.length?('<span class="gs">'+passed.length+'</span> / '+qk.length+' пройдено · лучшие результаты в сумме <span class="cy">'+sum+' / '+max+'</span>')
                   :'<span class="dm">ни один ещё не пройден</span>')
    +'</div></div></div>';

  h+='<div class="btn-row" style="margin-top:12px">'
    +'<button class="btn sm" onclick="_ppMode(&quot;export&quot;)">⇧ выгрузить код</button>'
    +'<button class="btn sm" onclick="_ppMode(&quot;import&quot;)">⇩ загрузить код</button>'
    +'<button class="btn sm gh" onclick="_ppMode(&quot;idle&quot;)">свернуть</button>'
    +'<button class="btn sm gh" onclick="resetProgress()">↻ сбросить всё</button></div>';

  if(PPSTATE.mode==='export'){
    const code=exportProgress();
    h+='<div class="code" style="margin-top:12px;max-height:150px;overflow:auto;word-break:break-all;white-space:pre-wrap">'
      +'<span class="code-label">код прогресса</span>'+code+'</div>'
      +'<div class="btn-row"><button class="btn sm" onclick="_ppCopy()">⧉ скопировать</button>'
      +'<span style="font-size:11px;color:#4a5a6e">вставь этот код на другом устройстве</span></div>';
  }
  if(PPSTATE.mode==='import'){
    h+='<div style="margin-top:12px"><input id="ppInput" type="text" placeholder="вставь код прогресса сюда" '
      +'style="width:100%;background:#05090f;border:1px solid rgba(56,189,248,.3);color:#cdd9e5;font-family:inherit;'
      +'font-size:12px;padding:10px 12px;border-radius:7px;outline:none"></div>'
      +'<div class="btn-row"><button class="btn sm" onclick="_ppApply()">применить</button></div>';
  }
  if(PPSTATE.msg){
    h+='<div style="margin-top:10px;font-size:12px;color:'+(PPSTATE.ok?'#00e676':'#ff5370')+'">'+PPSTATE.msg+'</div>';
  }
  el.innerHTML=h;
}
window._ppMode=function(m){PPSTATE.mode=m;PPSTATE.msg='';renderProgressPanel();};
window._ppCopy=function(){
  const code=exportProgress();
  let done=false;
  try{
    if(typeof navigator!=='undefined'&&navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(code);done=true;
    }
  }catch(e){}
  PPSTATE.ok=true;
  PPSTATE.msg=done?'Скопировано в буфер обмена.':'Скопируй код выделением — буфер обмена недоступен.';
  renderProgressPanel();
};
window._ppApply=function(){
  const inp=document.getElementById('ppInput');
  const val=inp?inp.value:'';
  if(importProgress(val)){PPSTATE.ok=true;PPSTATE.msg='Прогресс загружен.';PPSTATE.mode='idle';}
  else{PPSTATE.ok=false;PPSTATE.msg='Не похоже на код прогресса. Проверь, что скопировал строку целиком.';}
  renderProgressPanel();
};
