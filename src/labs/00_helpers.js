/* ===== LAB HELPERS ===== */
/* Общие движки для лаб. Все onclick-атрибуты генерируются с &quot; внутри,
   чтобы не ломать строки при сборке. */

const LABSTATE={};

function labEsc(s){return String(s);}

/* --- STEP LAB: пошаговое проигрывание --- */
function mkStepLab(elId,ns,steps,opts){
  const el=document.getElementById(elId);if(!el)return;
  opts=opts||{};
  LABSTATE[ns]={cur:-1,timer:null,steps:steps};
  function render(){
    const st=LABSTATE[ns];
    let h='<div style="display:flex;flex-direction:column;gap:7px">';
    steps.forEach(function(s,i){
      const on=i===st.cur, past=i<st.cur;
      const col=s.c||'#38bdf8';
      h+='<div tabindex="0" role="button" aria-label="'+s.t+'" onclick="window._'+ns+'Sel('+i+')"'
        +' onkeydown="if(event.key===&quot;Enter&quot;||event.key===&quot; &quot;){event.preventDefault();window._'+ns+'Sel('+i+')}"'
        +' style="border:1px solid '+(on?col:'rgba(56,189,248,.15)')+';border-left:3px solid '+(on||past?col:'rgba(56,189,248,.15)')
        +';border-radius:8px;padding:'+(on?'12px 14px':'8px 14px')+';cursor:pointer;background:'+(on?'rgba(56,189,248,.06)':'#0f1620')
        +';transition:.16s;opacity:'+(past||on?'1':'.55')+'">'
        +'<div style="display:flex;align-items:center;gap:10px">'
        +'<span style="font-size:10px;color:'+col+';border:1px solid '+col+';border-radius:10px;padding:1px 7px;flex-shrink:0">'+s.n+'</span>'
        +'<span style="font-size:13px;color:'+(on?'#cdd9e5':'#7d8ea3')+';font-weight:'+(on?'600':'400')+'">'+s.t+'</span></div>';
      if(on){
        h+='<div style="font-size:12px;color:#7d8ea3;line-height:1.7;margin-top:9px">'+s.d+'</div>';
        if(s.code)h+='<div class="code" style="margin:10px 0 0;font-size:11.5px">'+s.code+'</div>';
        if(s.sec)h+='<div style="margin-top:10px;padding:9px 11px;background:rgba(255,83,112,.07);border-left:2px solid #ff5370;border-radius:0 6px 6px 0;font-size:11.5px;color:#7d8ea3;line-height:1.65"><span style="color:#ff5370">SEC ▸ </span>'+s.sec+'</div>';
      }
      h+='</div>';
    });
    h+='</div><div class="btn-row" style="margin-top:14px">'
      +'<button class="btn sm gh" onclick="window._'+ns+'Step(-1)">◀ назад</button>'
      +'<button class="btn sm" onclick="window._'+ns+'Step(1)">шаг ▸</button>'
      +'<button class="btn sm gh" onclick="window._'+ns+'Play()">▶ проиграть</button>'
      +'<button class="btn sm gh" onclick="window._'+ns+'Reset()">↻ сброс</button>'
      +'<span style="margin-left:auto;font-size:11px;color:#4a5a6e">'+(st.cur<0?'0':(st.cur+1))+' / '+steps.length+'</span></div>';
    el.innerHTML=h;
  }
  window['_'+ns+'Sel']=function(i){i=Number(i);if(!(i>=0&&i<steps.length))return;LABSTATE[ns].cur=i;render();};
  window['_'+ns+'Step']=function(d){
    const st=LABSTATE[ns];
    st.cur=Math.max(0,Math.min(steps.length-1,st.cur+(Number(d)||0)));render();};
  window['_'+ns+'Reset']=function(){
    const st=LABSTATE[ns];
    if(st.timer){clearInterval(st.timer);st.timer=null;}
    st.cur=-1;render();};
  window['_'+ns+'Play']=function(){
    const st=LABSTATE[ns];
    if(st.timer){clearInterval(st.timer);st.timer=null;return;}
    st.cur=-1;render();
    st.timer=setInterval(function(){
      if(st.cur>=steps.length-1){clearInterval(st.timer);st.timer=null;return;}
      st.cur++;render();
    },1400);};
  render();
}

/* --- SELECT LAB: плитки + панель детали --- */
function mkSelLab(elId,ns,items,opts){
  const el=document.getElementById(elId);if(!el)return;
  opts=opts||{};
  LABSTATE[ns]={cur:opts.start===undefined?0:opts.start,items:items};
  function render(){
    const st=LABSTATE[ns];
    let h=opts.head||'';
    h+='<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px">';
    items.forEach(function(it,i){
      const on=i===st.cur,col=it.c||'#38bdf8';
      h+='<button class="btn sm" style="border-color:'+(on?col:'rgba(56,189,248,.25)')+';color:'+(on?'#04121b':col)
        +';background:'+(on?col:'transparent')+'" onclick="window._'+ns+'Pick('+i+')">'+it.k+'</button>';
    });
    h+='</div>';
    const it=items[st.cur];
    if(it){
      const col=it.c||'#38bdf8';
      h+='<div style="border:1px solid rgba(56,189,248,.2);border-left:3px solid '+col+';border-radius:0 9px 9px 0;padding:14px 16px;background:#0c111a">'
        +'<div style="font-size:14px;color:'+col+';font-weight:600;margin-bottom:8px">'+it.t+'</div>'
        +'<div style="font-size:12.5px;color:#7d8ea3;line-height:1.75">'+it.d+'</div>';
      if(it.code)h+='<div class="code" style="margin:12px 0 0;font-size:11.5px">'+it.code+'</div>';
      if(it.sec)h+='<div style="margin-top:12px;padding:10px 12px;background:rgba(255,83,112,.07);border-left:2px solid #ff5370;border-radius:0 6px 6px 0;font-size:11.5px;color:#7d8ea3;line-height:1.7"><span style="color:#ff5370">SEC ▸ </span>'+it.sec+'</div>';
      h+='</div>';
    }
    el.innerHTML=h;
  }
  window['_'+ns+'Pick']=function(i){i=Number(i);if(!(i>=0&&i<items.length))return;LABSTATE[ns].cur=i;render();};
  render();
}

/* --- TOGGLE LAB: набор флагов + вывод --- */
function mkToggleLab(elId,ns,flags,renderOut){
  const el=document.getElementById(elId);if(!el)return;
  const state={};
  flags.forEach(function(f){state[f.id]=!!f.on;});
  LABSTATE[ns]={flags:state};
  function render(){
    const st=LABSTATE[ns].flags;
    let h='<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px">';
    flags.forEach(function(f){
      const on=st[f.id],col=f.c||'#00e676';
      h+='<button class="btn sm" style="border-color:'+(on?col:'rgba(125,142,163,.3)')+';color:'+(on?'#04121b':'#7d8ea3')
        +';background:'+(on?col:'transparent')+'" onclick="window._'+ns+'T(&quot;'+f.id+'&quot;)">'
        +(on?'✓ ':'○ ')+f.k+'</button>';
    });
    h+='</div>'+renderOut(st);
    el.innerHTML=h;
  }
  window['_'+ns+'T']=function(id){
    if(!(id in LABSTATE[ns].flags))return;
    LABSTATE[ns].flags[id]=!LABSTATE[ns].flags[id];render();};
  render();
}
