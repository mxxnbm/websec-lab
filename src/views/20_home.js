/* ---------- HOME ---------- */
const V_HOME = `
<section class="view active" id="view-home">
  <div class="hero-ascii"><span class="gs">websec.lab</span> <span class="dm">// interactive web security course</span>
$ ./learn --track=<span class="am">web</span> --mode=<span class="am">learn|refresh</span>
<span class="dm">&gt;</span> modules ......... <span class="gs">17</span>   labs ......... <span class="gs">19</span>
<span class="dm">&gt;</span> quizzes ......... <span class="gs">6</span>   cards ........ <span class="gs">72</span>
<span class="dm">&gt;</span> sources: MDN · RFC · OWASP · PortSwigger · web.dev
<span class="dm">&gt;</span> status: <span class="gs">READY</span></div>
  <div class="eyebrow">web security fundamentals · v2.0 · для AppSec</div>
  <h1 class="vtitle">Основы <span class="accent">веба</span> для AppSec-инженера</h1>
  <p class="vlede">Нельзя ломать то, чего не понимаешь. Прежде чем учить XSS, SQLi и SSRF, надо знать, как вообще устроен веб: что происходит между нажатием Enter в адресной строке и появлением пикселей на экране. Здесь этот путь разобран по шагам — от физики сети до модели безопасности браузера. Начинаешь с нуля — читай подряд. Веб знаешь давно, но детали стёрлись — бери секции точечно и проверяй себя квизами. Вся фактура — из отраслевых стандартов и официальной документации: RFC, MDN, WHATWG, OWASP, PortSwigger. Ссылки в каждом модуле.</p>

  <div class="card acc-c">
    <div class="card-t">◇ Как устроен курс</div>
    <p class="tx">Каждый модуль строится одинаково: <span class="hl">теория простым языком</span> → <span class="hl">схема</span> (визуальная память работает лучше текста) → <span class="hl">интерактивная лаба</span> (потрогать механику руками) → <span class="cy">SEC-врезки</span> (угол атакующего) → <span class="pu">«на собесе спросят»</span> → ссылки на первоисточники.</p>
    <p class="tx">В конце каждой секции — <span class="pu">checkpoint-квиз</span> на active recall. Не «вспомни определение», а «узнай концепцию в новой формулировке» — это и проверяют на собеседовании. Плюс отдельный режим <span class="cy">флеш-карт</span> для повторения.</p>
  </div>

  <h2 class="sect">как учиться по этому курсу</h2>
  <div class="grid2">
    <div class="card acc-g">
      <div class="card-t">1 · Не читай подряд за один присест</div>
      <p class="tx" style="font-size:12px">Секция за подход, максимум две. Между ними — пауза. Мозг закрепляет материал в паузах, а не во время чтения.</p>
    </div>
    <div class="card acc-g">
      <div class="card-t">2 · Сначала квиз, потом текст</div>
      <p class="tx" style="font-size:12px">Провальная попытка вспомнить — сильнее, чем чтение. Открой квиз секции до чтения, провались, потом читай. Материал ляжет глубже.</p>
    </div>
    <div class="card acc-g">
      <div class="card-t">3 · Проговаривай вслух</div>
      <p class="tx" style="font-size:12px">После модуля закрой экран и объясни тему вслух, будто интервьюеру. Где запнулся — там дыра. Это Feynman technique в чистом виде.</p>
    </div>
    <div class="card acc-g">
      <div class="card-t">4 · Открывай первоисточники</div>
      <p class="tx" style="font-size:12px">Каждая ссылка в модуле — не для галочки. Читать MDN и RFC — это навык, который отличает инженера от того, кто «смотрел ролики».</p>
    </div>
  </div>

  <h2 class="sect">карта курса</h2>
  <div class="roadmap">
    <div class="rm-stage"><span class="rm-num">SEC 01</span>
      <div class="rm-t">BASICS — что вообще есть<span class="rm-tag now">фундамент</span></div>
      <div class="rm-d">Интернет ≠ веб. История WWW. Клиент-сервер. Слои TCP/IP, IP, порты. DNS от кэша браузера до authoritative. TCP-хендшейк. HTTPS и TLS 1.3, сертификаты, цепочка доверия. URL по RFC 3986, понятия <span class="cy">origin</span> и <span class="cy">site</span>.</div></div>
    <div class="rm-stage"><span class="rm-num">SEC 02</span>
      <div class="rm-t">PROTOCOL — язык веба<span class="rm-tag">HTTP</span></div>
      <div class="rm-d">Структура запроса и ответа. Методы, safe/idempotent. Статус-коды. Заголовки. Почему HTTP stateless. Версии 1.0 → 1.1 → 2 → 3 и что это меняет для безопасности. Прокси, CDN, кэш.</div></div>
    <div class="rm-stage"><span class="rm-num">SEC 03</span>
      <div class="rm-t">CLIENT — из чего состоит страница<span class="rm-tag">браузер</span></div>
      <div class="rm-d">HTML, CSS, JavaScript — роль каждого. MIME-типы. Парсинг, async и defer. Браузер изнутри: DOM, CSSOM, render tree, layout, paint. Многопроцессная архитектура, Site Isolation, sandbox. Storage API.</div></div>
    <div class="rm-stage"><span class="rm-num">SEC 04</span>
      <div class="rm-t">ARCHITECTURE — как это строят<span class="rm-tag">SPA · API</span></div>
      <div class="rm-d">Web 1.0 → AJAX → Web 2.0 → SPA. SSR, CSR, SSG, гидратация. Web3 и почему это не то же самое, что Web 3.0. Монолит против микросервисов. API: REST и шесть ограничений Филдинга, SOAP, GraphQL, gRPC, WebSocket.</div></div>
    <div class="rm-stage"><span class="rm-num">SEC 05</span>
      <div class="rm-t">STATE — как веб тебя помнит<span class="rm-tag next">ключевое</span></div>
      <div class="rm-d">Cookies: все атрибуты и что каждый реально даёт. Sessions против токенов. Аутентификация и авторизация: HTTP-схемы, хранение паролей, MFA, JWT, OAuth 2.0 против OpenID Connect, SSO.</div></div>
    <div class="rm-stage"><span class="rm-num">SEC 06</span>
      <div class="rm-t">BROWSER SECURITY — правила игры<span class="rm-tag next">сердце AppSec</span></div>
      <div class="rm-d">Same-Origin Policy — что реально блокирует, а что нет. CORS: simple против preflight, типовые мисконфиги. CSP: директивы, nonce, strict-dynamic. Полный набор security headers 2026 плюс SRI и Fetch Metadata.</div></div>
    <div class="rm-stage"><span class="rm-num">SEC 07</span>
      <div class="rm-t">NEXT — мост к уязвимостям<span class="rm-tag">OWASP</span></div>
      <div class="rm-d">Карта OWASP Top 10:2025 — где какая уязвимость живёт относительно всего, что ты прошёл. Куда идти дальше: PortSwigger Academy, WSTG, практика.</div></div>
  </div>

  <div class="card acc-a">
    <div class="card-t">⚡ сквозная идея всего курса</div>
    <p class="tx" style="margin:0">Через все модули красной нитью идёт одно правило: <span class="rd">не доверяй клиенту</span>. Браузер, заголовки, cookies, JS-валидация, скрытые поля формы — всё это под полным контролем пользователя, а значит и атакующего. Единственное место, где проверка что-то значит, — сервер. Если поймаешь эту мысль на уровне рефлекса, половина веб-уязвимостей станет очевидной.</p>
  </div>

  <h2 class="sect">чем это заземлено</h2>
  <p class="tx">Порядок подачи не выдуман — он собран из пересечения нескольких независимых источников: Stanford CS253 (лекции идут «браузер → DNS/HTTP → Same-Origin Policy → клиентские атаки → серверные»), книга Andrew Hoffman «Web Application Security» (Part I вводит устройство современного веб-приложения до любых атак), Malcolm McDonald «Grokking Web Application Security» (browser security раньше server security) и учебный трек MDN. Везде фундамент идёт до уязвимостей, а клиентская сторона — до серверной.</p>
  <a class="ref" href="https://web.stanford.edu/class/cs253/" target="_blank" rel="noopener"><span class="r-t">Stanford CS253 — Web Security</span><span class="r-d">университетский курс по веб-безопасности, слайды и видео лекций открыты. Эталон структуры.</span><span class="r-u">web.stanford.edu/class/cs253</span></a>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Learn_web_development" target="_blank" rel="noopener"><span class="r-t">MDN — Learn Web Development</span><span class="r-d">официальная учебная траектория Mozilla. Первоисточник по любому веб-API.</span><span class="r-u">developer.mozilla.org/en-US/docs/Learn_web_development</span></a>
  <a class="ref ps" href="https://portswigger.net/web-security" target="_blank" rel="noopener"><span class="r-t">PortSwigger Web Security Academy</span><span class="r-d">бесплатные лабы по уязвимостям. Твой следующий шаг после этого курса.</span><span class="r-u">portswigger.net/web-security</span></a>
  <a class="ref owasp" href="https://owasp.org/Top10/" target="_blank" rel="noopener"><span class="r-t">OWASP Top 10</span><span class="r-d">общепринятая карта категорий рисков веб-приложений. Актуальная редакция — 2025.</span><span class="r-u">owasp.org/Top10</span></a>

  <h2 class="sect">твой прогресс и перенос между устройствами</h2>
  <p class="tx">Прогресс и результаты квизов хранятся в <code class="ic">localStorage</code> твоего браузера — никуда не отправляются, сервера у курса нет. Отсюда следствие: на другом устройстве или в другом браузере прогресс будет свой. Чтобы перенести — выгрузи код здесь и вставь его там.</p>
  <div id="progressPanel"></div>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="go('web')">начать → что такое веб</button>
    <button class="btn sm gh" onclick="go('cards')">⌸ флеш-карты</button>
    <button class="btn sm gh" onclick="openSearch()">⌕ поиск (Ctrl+K)</button>
    <button class="btn sm gh" onclick="resetProgress()">↻ сбросить прогресс</button>
  </div>
</section>`;
