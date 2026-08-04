/* ---------- m14 · CORS ---------- */
const V_CORS = `
<section class="view" id="view-cors">
  <div class="eyebrow">browser security · модуль 14 · источники: Fetch Standard · MDN · PortSwigger</div>
  <h1 class="vtitle"><span class="accent">CORS</span> — контролируемое ослабление SOP</h1>
  <p class="vlede">SOP запрещает читать чужие ответы. Но современному вебу это нужно постоянно: SPA на <code class="ic">app.example.com</code> ходит в API на <code class="ic">api.example.com</code>, партнёрский виджет тянет данные с чужого сервиса. CORS — механизм, которым сервер говорит браузеру: «этому origin читать мой ответ можно». Запомни главное с первой строки: <span class="hl">CORS не добавляет защиту, а снимает её</span>.</p>

  <h2 class="sect">кто кому что разрешает</h2>
  <div class="ascii">  браузер                              сервер api.example.com
     │                                        │
     │  fetch('https://api.example.com/me')   │
     │  <span class="a">Origin: https://app.example.com</span>       │   <span class="f">← браузер САМ добавляет</span>
     │ ──────────────────────────────────────▶│      заголовок Origin
     │                                        │
     │  200 OK                                │
     │  <span class="g">Access-Control-Allow-Origin:</span>          │   <span class="f">← сервер решает,</span>
     │  <span class="g">   https://app.example.com</span>            │      кому можно читать
     │ ◀──────────────────────────────────────│
     │                                        │
     ▼
  <span class="h">браузер сверяет: Origin в списке разрешённых?</span>
     <span class="g">да</span>  → отдаёт ответ скрипту
     <span class="r">нет</span> → ответ УЖЕ ПОЛУЧЕН, но скрипту не отдаётся,
           в консоли — CORS error</div>

  <div class="card acc-r">
    <div class="card-t">⚡ проверка происходит в браузере, а не на сервере</div>
    <p class="tx" style="margin:0">CORS — это <span class="hl">поведение браузера</span>. Сервер лишь присылает подсказки в заголовках. Из этого два практических следствия. Первое: <code class="ic">curl</code>, Postman, Burp и любой скрипт на бэкенде <span class="rd">игнорируют CORS полностью</span> — там нет браузера, который бы применял правило. Второе: CORS не защищает сервер ни от чего. Он защищает <span class="hl">данные пользователя от чужого скрипта в его браузере</span>. Настоящая защита эндпоинта — авторизация на сервере.</p>
  </div>

  <h2 class="sect">simple request против preflight</h2>
  <p class="tx">Часть запросов браузер отправляет сразу, а часть — только после предварительного разрешения. Граница проходит по историческому принципу: <span class="hl">если такой запрос можно было сделать HTML-формой ещё до появления CORS, он «простой»</span> и разрешение не требуется — ведь атакующий и так мог его отправить.</p>

  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>preflight-check.live · будет ли OPTIONS?</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Собери запрос — метод, Content-Type, дополнительный заголовок — и увидишь, полетит ли preflight и почему:</p>
      <div id="corsLab"></div>
    </div>
  </div>

  <div class="twrap"><table class="t">
    <tr><th></th><th>Simple (без preflight)</th><th>Требует preflight</th></tr>
    <tr><td class="cy">Метод</td><td class="gs">GET, HEAD, POST</td><td class="am">PUT, PATCH, DELETE и любые другие</td></tr>
    <tr><td class="cy">Content-Type</td><td class="gs"><code class="ic">application/x-www-form-urlencoded</code><br><code class="ic">multipart/form-data</code><br><code class="ic">text/plain</code></td><td class="am"><code class="ic">application/json</code> и всё остальное</td></tr>
    <tr><td class="cy">Заголовки</td><td class="gs">только safelisted: Accept, Accept-Language, Content-Language, Content-Type (с ограничением выше), Range</td><td class="am">любой кастомный: <code class="ic">Authorization</code>, <code class="ic">X-CSRF-Token</code>, <code class="ic">X-Requested-With</code></td></tr>
    <tr><td class="cy">Прочее</td><td class="gs">без обработчиков на upload, без ReadableStream в теле</td><td class="am">—</td></tr>
  </table></div>

  <div class="card acc-a">
    <div class="card-t">◇ уточнение про X-Requested-With</div>
    <p class="tx" style="margin:0">Заголовок <code class="ic">X-Requested-With</code> <span class="hl">не входит</span> в список CORS-safelisted request headers по спецификации Fetch. Значит, его добавление <span class="hl">триггерит preflight</span> — и именно поэтому его исторически использовали как признак «этот запрос сделан нашим JS, а не сторонней формой». В конспектах и статьях встречается обратное утверждение — это ошибка, сверяйся со спецификацией. При этом как самостоятельная защита от CSRF этот приём слабый: он ломается, если на сервере разрешена широкая CORS-политика или где-то есть обход preflight.</p>
  </div>

  <h2 class="sect">как выглядит preflight</h2>
  <div class="code"><span class="code-label">1 · браузер спрашивает разрешение</span><span class="kw">OPTIONS</span> /api/orders/42 HTTP/1.1
Host: api.example.com
<span class="fn">Origin</span>: https://app.example.com
<span class="fn">Access-Control-Request-Method</span>: DELETE
<span class="fn">Access-Control-Request-Headers</span>: authorization</div>
  <div class="code"><span class="code-label">2 · сервер отвечает</span>HTTP/1.1 <span class="op">204</span> No Content
<span class="fn">Access-Control-Allow-Origin</span>: https://app.example.com
<span class="fn">Access-Control-Allow-Methods</span>: GET, POST, DELETE
<span class="fn">Access-Control-Allow-Headers</span>: authorization
<span class="fn">Access-Control-Allow-Credentials</span>: true
<span class="fn">Access-Control-Max-Age</span>: 600
<span class="fn">Vary</span>: Origin</div>
  <p class="tx">Только после этого уходит настоящий <code class="ic">DELETE</code>. Ответ preflight кэшируется на <code class="ic">Access-Control-Max-Age</code> секунд — но это <span class="hl">пожелание</span>: браузеры ограничивают значение своим потолком, так что рассчитывать на сутки кэша не стоит.</p>

  <div class="kv">
    <div class="kv-row"><div class="kv-k">Access-Control-Allow-Origin</div><div class="kv-v">Кому можно читать ответ. Либо конкретный origin, либо <code class="ic">*</code>. <span class="hl">Списка несколько значений тут быть не может</span> — сервер обязан выбрать один и подставить его.</div></div>
    <div class="kv-row"><div class="kv-k">Access-Control-Allow-Credentials</div><div class="kv-v"><code class="ic">true</code> разрешает браузеру приложить и прочитать <span class="hl">credentials</span> — то есть cookies, клиентский TLS-сертификат и данные HTTP-аутентификации через браузерный диалог. Внимание на частую путаницу: <span class="rd">заголовок <code class="ic">Authorization: Bearer ...</code>, который приложение проставляет само из JS, сюда не относится</span> — это обычный несафлистовый заголовок, и разрешается он через <code class="ic">Access-Control-Allow-Headers</code>. Bearer-токен спокойно ходит cross-origin и без этого заголовка; ограничение на сочетание с <code class="ic">*</code> касается именно cookies.</div></div>
    <div class="kv-row"><div class="kv-k">Access-Control-Allow-Methods</div><div class="kv-v">Какие методы разрешены (только в ответе на preflight).</div></div>
    <div class="kv-row"><div class="kv-k">Access-Control-Allow-Headers</div><div class="kv-v">Какие нестандартные заголовки разрешены в запросе.</div></div>
    <div class="kv-row"><div class="kv-k">Access-Control-Expose-Headers</div><div class="kv-v">Какие заголовки <span class="hl">ответа</span> скрипт сможет прочитать. По умолчанию доступно лишь несколько базовых.</div></div>
    <div class="kv-row"><div class="kv-k">Vary: Origin</div><div class="kv-v">Обязателен, если ACAO формируется динамически. Иначе кэш сохранит ответ для одного origin и раздаст его другим.</div></div>
  </div>

  <div class="card acc-c">
    <div class="card-t">◇ почему <code class="ic">*</code> и credentials несовместимы</div>
    <p class="tx" style="margin:0">Спецификация запрещает сочетание <code class="ic">Access-Control-Allow-Origin: *</code> с <code class="ic">Access-Control-Allow-Credentials: true</code>, и браузер такой ответ отвергнет. Логика простая: «*» означает «любому сайту», а credentials означает «с cookies пользователя». Вместе это давало бы любому сайту в интернете право читать твои персональные данные с любого сервиса, где ты залогинен, — то есть полную отмену SOP.</p>
  </div>

  <h2 class="sect">типовые мисконфиги</h2>
  <div class="sec-box">
    <div class="sb-t">SEC ▸ 1 · отражение Origin</div>
    <p class="tx">Разработчику нужен «список разрешённых», а заголовок принимает только одно значение. Быстрое решение — вернуть то, что пришло:</p>
    <div class="code"><span class="code-label">уязвимо</span>origin = request.headers[<span class="st">'Origin'</span>]
response.headers[<span class="st">'Access-Control-Allow-Origin'</span>] = origin   <span class="cmt">← любой домен</span>
response.headers[<span class="st">'Access-Control-Allow-Credentials'</span>] = <span class="st">'true'</span></div>
    <p class="tx" style="margin-bottom:0">Формально это не <code class="ic">*</code>, поэтому запрет спецификации не срабатывает. Фактически — <span class="rd">любой сайт может читать данные любого залогиненного пользователя</span>. Правильно — сверять со списком строгим равенством и не забыть <code class="ic">Vary: Origin</code>.</p>
  </div>
  <div class="sec-box">
    <div class="sb-t">SEC ▸ 2 · кривая проверка списка</div>
    <p class="tx" style="margin-bottom:0">Сравнение по вхождению подстроки вместо равенства: <code class="ic">origin.endsWith('example.com')</code> пропустит <code class="ic">evilexample.com</code>, а <code class="ic">origin.includes('example.com')</code> — ещё и <code class="ic">example.com.evil.com</code>. Отдельно: разрешение всех поддоменов означает, что <span class="hl">любой захваченный поддомен получает доступ к API</span>. И ещё одна классика — оставить в списке <code class="ic">http://localhost:3000</code> с прода.</p>
  </div>
  <div class="sec-box">
    <div class="sb-t">SEC ▸ 3 · доверие к origin «null»</div>
    <p class="tx" style="margin-bottom:0">Значение <code class="ic">null</code> в заголовке Origin приходит из документов без origin: песочничного iframe (<code class="ic">sandbox</code>), страницы с локального файла, некоторых редиректов. Если сервер отвечает <code class="ic">Access-Control-Allow-Origin: null</code>, атакующий <span class="rd">воспроизводит такой контекст на своей странице</span> и получает доступ. Значение <code class="ic">null</code> в allowlist — всегда находка.</p>
  </div>

  <div class="ask-box">
    <div class="sb-t">на собесе спросят</div>
    <div class="q">— Запрос дошёл до сервера и отработал, но в консоли CORS error. Как так?</div>
    <div class="a">Это нормальное поведение, а не баг. Браузер отправляет запрос, сервер его обрабатывает и отвечает; браузер получает ответ, не находит нужного <code class="ic">Access-Control-Allow-Origin</code> и <span class="hl">не отдаёт ответ скрипту</span>, показывая ошибку. Побочный эффект на сервере при этом уже произошёл. Единственное исключение — если запрос требовал preflight и OPTIONS не был разрешён: тогда основной запрос вообще не уйдёт.</div>
    <div class="q">— Защищает ли CORS от CSRF?</div>
    <div class="a">Нет, и это отдельная ловушка. Классический CSRF использует «простые» запросы — автоотправку HTML-формы или загрузку изображения, — которые preflight не порождают вовсе. Более того, неправильно настроенный CORS <span class="rd">усиливает</span> атакующего: если сервер отражает Origin и разрешает credentials, атакующий получает возможность не только отправлять запросы, но и читать ответы. От CSRF защищают SameSite, CSRF-токены и проверка Origin на сервере.</div>
    <div class="q">— Что не так с конфигурацией <code class="ic">ACAO: *</code> на публичном API без авторизации?</div>
    <div class="a">Само по себе — ничего страшного, если эндпоинт действительно публичный и не отдаёт персональные данные: он и так доступен всем. Проблема начинается, когда рядом с таким API живёт внутренняя сеть или когда тот же обработчик обслуживает и авторизованные запросы. Хороший ответ на собесе: «зависит от того, что отдаёт эндпоинт и есть ли доступ по cookies; для публичной статики нормально, для чего-либо с сессией — нет».</div>
  </div>

  <h2 class="sect">референсы модуля</h2>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS" target="_blank" rel="noopener"><span class="r-t">MDN — Cross-Origin Resource Sharing</span><span class="r-d">полный разбор: условия simple request, все заголовки, схемы обмена.</span><span class="r-u">developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS</span></a>
  <a class="ref" href="https://fetch.spec.whatwg.org/" target="_blank" rel="noopener"><span class="r-t">WHATWG Fetch Standard</span><span class="r-d">первоисточник: определение CORS-safelisted request-header и алгоритм проверки. Именно им сверяются спорные утверждения.</span><span class="r-u">fetch.spec.whatwg.org</span></a>
  <a class="ref ps" href="https://portswigger.net/web-security/cors" target="_blank" rel="noopener"><span class="r-t">PortSwigger — CORS</span><span class="r-d">все мисконфиги с лабами: отражение origin, null, доверие поддоменам.</span><span class="r-u">portswigger.net/web-security/cors</span></a>
  <a class="ref owasp" href="https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side_Testing/07-Testing_Cross_Origin_Resource_Sharing" target="_blank" rel="noopener"><span class="r-t">OWASP WSTG — Testing CORS</span><span class="r-d">методика проверки: что и чем тестировать, какие заголовки смотреть.</span><span class="r-u">owasp.org/.../07-Testing_Cross_Origin_Resource_Sharing</span></a>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('cors');go('csp')">[✓] завершить → CSP</button>
  </div>
</section>`;
