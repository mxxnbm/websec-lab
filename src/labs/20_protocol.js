/* ===== LAB: m05 HTTP builder ===== */
function buildHttpLab(){
  const el=document.getElementById('httpLab');if(!el)return;
  const M=[
    {k:'GET',c:'#38bdf8',
     req:'<span class="fn">GET</span> /api/orders/42 HTTP/1.1\nHost: shop.example.com\nCookie: sid=a3f9c1\nAccept: application/json\nUser-Agent: Mozilla/5.0\n<span class="cmt">(тела нет)</span>',
     res:'HTTP/1.1 <span class="op">200</span> OK\nContent-Type: application/json\nCache-Control: private, no-store\n\n{"id":42,"total":1990,"status":"paid"}',
     n:'Читаем ресурс. Тела нет, все параметры — в URL. Safe и idempotent, кэшируется.',
     s:'Параметры видны в логах, в истории и в Referer — секретам тут не место. И помни: <b>GET, меняющий состояние, не блокируется SameSite=Lax</b>.'},
    {k:'POST',c:'#00e676',
     req:'<span class="fn">POST</span> /api/orders HTTP/1.1\nHost: shop.example.com\nCookie: sid=a3f9c1\n<span class="op">Content-Type: application/json</span>\nContent-Length: 38\n\n{"item_id":7,"qty":2,"promo":"NEW"}',
     res:'HTTP/1.1 <span class="op">201</span> Created\nLocation: /api/orders/43\nContent-Type: application/json\n\n{"id":43,"status":"pending"}',
     n:'Создаём ресурс. Данные в теле. Ни safe, ни idempotent — повтор создаст второй заказ.',
     s:'Не-idempotent значит, что гонка запросов даёт двойное списание. Отсюда требование идемпотентных ключей в платежах. <code class="ic">Content-Type: application/json</code> требует preflight при cross-origin — а вот form-urlencoded не требует, поэтому именно он используется в CSRF.'},
    {k:'PUT',c:'#ffb020',
     req:'<span class="fn">PUT</span> /api/orders/42 HTTP/1.1\nHost: shop.example.com\nAuthorization: Bearer eyJhbGci...\nContent-Type: application/json\n\n{"item_id":7,"qty":5,"status":"paid"}',
     res:'HTTP/1.1 <span class="op">200</span> OK\nContent-Type: application/json\n\n{"id":42,"qty":5,"status":"paid"}',
     n:'Заменяем ресурс целиком. Idempotent: сколько раз ни повтори — результат один.',
     s:'Проверь, не даёт ли PUT переписать поля, которые клиент менять не должен (<code class="ic">status</code>, <code class="ic">owner_id</code>, <code class="ic">price</code>) — это mass assignment. И отдельно: есть ли вообще проверка, что заказ 42 принадлежит тебе.'},
    {k:'DELETE',c:'#ff5370',
     req:'<span class="fn">DELETE</span> /api/orders/42 HTTP/1.1\nHost: shop.example.com\nAuthorization: Bearer eyJhbGci...',
     res:'HTTP/1.1 <span class="op">204</span> No Content\n<span class="cmt">(тела нет)</span>',
     n:'Удаляем. Idempotent: повторное удаление ничего не меняет.',
     s:'Классическое место для BFLA: эндпоинт закрыт только в интерфейсе, а в API проверки роли нет. Пробуй вызывать напрямую из-под обычного пользователя.'},
    {k:'OPTIONS',c:'#ff6ac1',
     req:'<span class="fn">OPTIONS</span> /api/orders/42 HTTP/1.1\nHost: shop.example.com\n<span class="op">Origin: https://app.example.com</span>\n<span class="op">Access-Control-Request-Method: DELETE</span>\nAccess-Control-Request-Headers: authorization',
     res:'HTTP/1.1 <span class="op">204</span> No Content\nAccess-Control-Allow-Origin: https://app.example.com\nAccess-Control-Allow-Methods: GET, POST, DELETE\nAccess-Control-Allow-Headers: authorization\nAccess-Control-Max-Age: 600\nVary: Origin',
     n:'Спрашиваем, что разрешено. Это и есть CORS preflight — браузер шлёт его сам перед «непростым» запросом.',
     s:'Самый информативный запрос при разведке: показывает разрешённые методы и политику CORS. Если в ответе отражается любой присланный Origin вместе с <code class="ic">Allow-Credentials: true</code> — это находка.'}
  ];
  let cur=0;
  function render(){
    const m=M[cur];
    let h='<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px">';
    M.forEach(function(x,i){
      const on=i===cur;
      h+='<button class="btn sm" style="border-color:'+(on?x.c:'rgba(56,189,248,.25)')+';color:'+(on?'#04121b':x.c)
        +';background:'+(on?x.c:'transparent')+'" onclick="window._httpPick('+i+')">'+x.k+'</button>';
    });
    h+='</div><div style="font-size:12.5px;color:#7d8ea3;line-height:1.7;margin-bottom:12px">'+m.n+'</div>'
      +'<div class="grid2" style="gap:10px">'
      +'<div class="code" style="margin:0"><span class="code-label">запрос</span>'+m.req+'</div>'
      +'<div class="code" style="margin:0"><span class="code-label">ответ</span>'+m.res+'</div></div>'
      +'<div style="margin-top:12px;padding:10px 12px;background:rgba(255,83,112,.07);border-left:2px solid #ff5370;border-radius:0 6px 6px 0;font-size:11.5px;color:#7d8ea3;line-height:1.7">'
      +'<span style="color:#ff5370">SEC ▸ </span>'+m.s+'</div>';
    el.innerHTML=h;
  }
  window._httpPick=function(i){i=Number(i);if(!(i>=0&&i<M.length))return;cur=i;render();};
  render();
}

/* ===== LAB: m05 status codes ===== */
function buildStatusLab(){
  mkSelLab('statusLab','st',[
    {k:'1xx',c:'#7d8ea3',t:'1xx — информационные',
     d:'Промежуточные ответы: <code class="ic">100 Continue</code> — «шли тело дальше», <code class="ic">101 Switching Protocols</code> — переключение на WebSocket. В обычной работе видны редко.',
     sec:'<code class="ic">101</code> — сигнал, что на этом эндпоинте живёт WebSocket. Проверь, валидируется ли <code class="ic">Origin</code> при рукопожатии: SOP на WebSocket не действует, и без проверки возможен cross-site WebSocket hijacking.'},
    {k:'2xx',c:'#00e676',t:'2xx — успех',
     d:'<code class="ic">200 OK</code> — всё хорошо. <code class="ic">201 Created</code> — ресурс создан, адрес в заголовке Location. <code class="ic">204 No Content</code> — успех без тела, типичный ответ на DELETE и на preflight.',
     sec:'<code class="ic">200</code> там, где должно быть <code class="ic">403</code>, — прямой признак Broken Access Control. При переборе идентификаторов смотри именно на коды: 200 на чужом объекте и есть находка.'},
    {k:'3xx',c:'#38bdf8',t:'3xx — перенаправления',
     d:'<code class="ic">301</code> — навсегда, <code class="ic">302</code> и <code class="ic">307</code> — временно, <code class="ic">304 Not Modified</code> — «бери из кэша». Адрес назначения — в заголовке <code class="ic">Location</code>.',
     sec:'<b>Open redirect</b>: если адрес назначения берётся из параметра без проверки, ссылка на легитимном домене уводит жертву на фишинг. Плюс это ступень для обхода валидации <code class="ic">redirect_uri</code> в OAuth и для обхода SSRF-фильтров через редирект на внутренний адрес.'},
    {k:'4xx',c:'#ffb020',t:'4xx — ошибка клиента',
     d:'<code class="ic">400</code> — некорректный запрос, <code class="ic">401</code> — не аутентифицирован, <code class="ic">403</code> — нет прав, <code class="ic">404</code> — не найдено, <code class="ic">405</code> — метод не разрешён, <code class="ic">429</code> — слишком много запросов.',
     sec:'<code class="ic">401</code> и <code class="ic">403</code> — разные вещи: «не знаю кто ты» и «знаю, но нельзя». На чувствительных ресурсах <code class="ic">403</code> подтверждает существование объекта — иногда правильнее <code class="ic">404</code>. Отсутствие <code class="ic">429</code> означает, что rate limiting не настроен: перебор паролей и идентификаторов ничем не ограничен.'},
    {k:'5xx',c:'#ff5370',t:'5xx — ошибка сервера',
     d:'<code class="ic">500</code> — внутренняя ошибка, <code class="ic">502</code> — плохой ответ от вышестоящего сервиса, <code class="ic">503</code> — сервис недоступен, <code class="ic">504</code> — таймаут.',
     sec:'Золотая жила при тестировании. Стектрейс в ответе выдаёт версии, пути на диске, имена таблиц и внутренние адреса. Разница между <code class="ic">500</code> и <code class="ic">200</code> при разных входных данных — канал для слепых инъекций. И отдельно A10:2025 — неверная обработка краевых состояний: падение с fail-open вместо fail-closed.'}
  ]);
}

/* ===== LAB: m06 HTTP versions ===== */
function buildHttpvLab(){
  mkSelLab('httpvLab','hv',[
    {k:'HTTP/1.0',c:'#7d8ea3',t:'HTTP/1.0 — соединение на каждый файл',
     d:'Загрузка страницы из четырёх файлов = четыре отдельных TCP-соединения, каждое со своим рукопожатием.',
     code:'соединение 1: [TCP][GET index.html ][закрыть]\nсоединение 2:      [TCP][GET style.css ][закрыть]\nсоединение 3:           [TCP][GET app.js  ][закрыть]\nсоединение 4:                [TCP][GET logo.png][закрыть]\n<span class="cmt">                       время →  очень медленно</span>',
     sec:'Заголовок <code class="ic">Host</code> необязателен — на таких стеках возможна путаница с virtual hosting. В диком вебе почти не встречается, но иногда всплывает как способ обойти прокси, который разбирает только HTTP/1.1.'},
    {k:'HTTP/1.1',c:'#38bdf8',t:'HTTP/1.1 — одно соединение, очередь',
     d:'Соединение переиспользуется (keep-alive), но запросы идут строго по очереди: пока не пришёл первый ответ, второй ждёт. Браузеры обходили это, открывая до 6 соединений на домен.',
     code:'соединение: [TCP][GET index.html]──▶[GET style.css]──▶[GET app.js]──▶[GET logo.png]\n<span class="cmt">              head-of-line blocking: каждый ждёт предыдущего</span>',
     sec:'<b>Здесь живёт request smuggling.</b> Длину тела можно задать двумя способами — Content-Length и Transfer-Encoding — и если фронтенд с бэкендом решат конфликт по-разному, хвост одного запроса приклеится к следующему запросу другого пользователя.'},
    {k:'HTTP/2',c:'#00e676',t:'HTTP/2 — мультиплексирование',
     d:'Бинарный формат вместо текста. Все четыре запроса летят параллельно в одном соединении, разбитые на фреймы с идентификатором потока. Заголовки сжимаются HPACK.',
     code:'соединение: [TCP+TLS]\n  поток 1 ═══════ index.html ═══\n  поток 3 ═══════ style.css ════   <span class="cmt">все одновременно</span>\n  поток 5 ═══════ app.js ═══════\n  поток 7 ═══════ logo.png ═════',
     sec:'Классического smuggling нет: длина задана структурой фреймов. Но появляется <b>downgrade smuggling</b> (H2.CL, H2.TE) — если фронтенд конвертирует запрос в HTTP/1.1 для бэкенда, протащенный внутри заголовок материализуется. Плюс блокировка осталась на уровне TCP: потерянный пакет тормозит все потоки.'},
    {k:'HTTP/3',c:'#c792ea',t:'HTTP/3 — поверх QUIC и UDP',
     d:'Транспорт QUIC вместо TCP. Шифрование встроено в транспорт, установка соединения совмещена с TLS-рукопожатием, потоки независимы — потеря пакета не тормозит остальные. Соединение переживает смену сети.',
     code:'соединение: [QUIC over UDP/443 — TLS уже внутри]\n  поток 1 ═══ index.html ═══\n  поток 2 ═══ style.css ════   <span class="cmt">потеря в одном потоке</span>\n  поток 3 ═══ app.js ═══════   <span class="cmt">не тормозит остальные</span>',
     sec:'Меняет картину для средств сетевой защиты: трафик идёт по UDP/443, и старые IDS, фаерволы и DPI его часто просто не разбирают. Плюс из-за встроенного шифрования меньше возможностей для инспекции на периметре.'}
  ],{start:1});
}
