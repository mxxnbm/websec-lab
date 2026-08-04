/* ---------- m06 · HTTP VERSIONS / PROXY / CACHE ---------- */
const V_HTTPV = `
<section class="view" id="view-httpv">
  <div class="eyebrow">protocol · модуль 06 · источники: RFC 9112-9114 · MDN · PortSwigger</div>
  <h1 class="vtitle">Версии HTTP, прокси и <span class="accent">кэш</span></h1>
  <p class="vlede">HTTP один, но версий у него четыре, и разница между ними — не академическая. Между твоим браузером и приложением почти всегда стоит цепочка посредников: CDN, балансировщик, reverse proxy, кэш. Каждый из них по-своему разбирает HTTP-сообщения — и именно на расхождениях в разборе живут одни из самых красивых атак в вебе.</p>

  <h2 class="sect">эволюция протокола</h2>
  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>http-versions.live · как грузится страница в разных версиях</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Переключай версию — увидишь, как меняется схема загрузки одной и той же страницы из четырёх файлов:</p>
      <div id="httpvLab"></div>
    </div>
  </div>

  <div class="twrap"><table class="t">
    <tr><th>Версия</th><th>Год · RFC</th><th>Что принесла</th><th>Значение для AppSec</th></tr>
    <tr>
      <td class="dm">HTTP/1.0</td><td>1996 · RFC 1945</td>
      <td>Каждый запрос — новое TCP-соединение. Заголовок <code class="ic">Host</code> необязателен.</td>
      <td>Практически не встречается. Иногда всплывает в легаси-инфраструктуре и в обходах прокси.</td>
    </tr>
    <tr>
      <td class="cy">HTTP/1.1</td><td>1997 · сейчас RFC 9112</td>
      <td>Постоянные соединения (keep-alive), конвейеризация, чанкованное тело, <code class="ic">Host</code> стал обязательным.</td>
      <td><span class="rd">Здесь живёт HTTP request smuggling</span>: длину тела можно задать двумя способами — <code class="ic">Content-Length</code> и <code class="ic">Transfer-Encoding: chunked</code>, и разные серверы решают конфликт по-разному.</td>
    </tr>
    <tr>
      <td class="gs">HTTP/2</td><td>2015 · изначально RFC 7540,<br>сейчас RFC 9113</td>
      <td>Бинарный формат вместо текста. Мультиплексирование: много запросов параллельно в одном соединении. Сжатие заголовков HPACK. Server push (сейчас признан неудачным и выключен).</td>
      <td>Двойной задачи длины тела нет by design, поэтому классический smuggling невозможен. Но появился <span class="rd">downgrade smuggling</span>: фронтенд говорит по HTTP/2, а с бэкендом — по HTTP/1.1, и проблема возвращается при конвертации.</td>
    </tr>
    <tr>
      <td class="pu">HTTP/3</td><td>2022 · RFC 9114</td>
      <td>Работает поверх <span class="hl">QUIC (UDP)</span>, а не TCP. Шифрование встроено в транспорт, установка соединения быстрее, потеря пакета не тормозит остальные потоки.</td>
      <td>Меняет модель для сетевых средств защиты: трафик по UDP/443, старые IDS и фаерволы его часто не разбирают.</td>
    </tr>
  </table></div>

  <div class="card acc-a">
    <div class="card-t">⚡ head-of-line blocking — зачем всё это затевалось</div>
    <p class="tx" style="margin:0">В HTTP/1.1 по одному соединению запросы идут строго по очереди: пока не пришёл ответ на первый, второй ждёт. Браузеры обходили это, открывая по 6 соединений на домен, а разработчики — склеивая все скрипты в один файл и картинки в спрайты. HTTP/2 решил это мультиплексированием на уровне протокола, но блокировка осталась на уровне TCP: потерянный пакет тормозит все потоки сразу. HTTP/3 убрал и это, потому что QUIC ведёт потоки независимо. Практический вывод: <span class="hl">многие приёмы «оптимизации», которым учили в 2015, сегодня вредны</span>.</p>
  </div>

  <h2 class="sect">кто стоит между тобой и приложением</h2>
  <p class="tx">В продакшене запрос почти никогда не приходит напрямую в код приложения. Между ними — цепочка посредников, и AppSec обязан знать, кто за что отвечает.</p>

  <div class="svgbox">
    <svg viewBox="0 0 740 250" role="img" aria-label="Цепочка посредников между браузером и приложением">
      <text x="370" y="18" font-size="12" fill="#38bdf8" text-anchor="middle">ПУТЬ ЗАПРОСА В ПРОДАКШЕНЕ</text>
      <g font-size="10.5">
        <rect x="14" y="72" width="96" height="58" rx="7" fill="#0f1620" stroke="#38bdf8" stroke-opacity=".5"/>
        <text x="62" y="96" fill="#38bdf8" text-anchor="middle">Браузер</text>
        <text x="62" y="113" fill="#4a5a6e" text-anchor="middle">клиент</text>

        <rect x="140" y="72" width="96" height="58" rx="7" fill="#0f1620" stroke="#ffb020" stroke-opacity=".5"/>
        <text x="188" y="90" fill="#ffb020" text-anchor="middle">CDN</text>
        <text x="188" y="106" fill="#4a5a6e" text-anchor="middle">кэш + WAF</text>
        <text x="188" y="120" fill="#4a5a6e" text-anchor="middle">+ анти-DDoS</text>

        <rect x="266" y="72" width="96" height="58" rx="7" fill="#0f1620" stroke="#ffb020" stroke-opacity=".5"/>
        <text x="314" y="90" fill="#ffb020" text-anchor="middle">Load</text>
        <text x="314" y="105" fill="#ffb020" text-anchor="middle">balancer</text>
        <text x="314" y="121" fill="#4a5a6e" text-anchor="middle">TLS termination</text>

        <rect x="392" y="72" width="106" height="58" rx="7" fill="#0f1620" stroke="#c792ea" stroke-opacity=".5"/>
        <text x="445" y="90" fill="#c792ea" text-anchor="middle">Reverse proxy</text>
        <text x="445" y="105" fill="#c792ea" text-anchor="middle">/ API gateway</text>
        <text x="445" y="121" fill="#4a5a6e" text-anchor="middle">routing, authn</text>

        <rect x="528" y="72" width="96" height="58" rx="7" fill="#0f1620" stroke="#00e676" stroke-opacity=".5"/>
        <text x="576" y="96" fill="#00e676" text-anchor="middle">App server</text>
        <text x="576" y="113" fill="#4a5a6e" text-anchor="middle">твой код</text>

        <rect x="654" y="72" width="76" height="58" rx="7" fill="#0f1620" stroke="#5c9eff" stroke-opacity=".5"/>
        <text x="692" y="96" fill="#5c9eff" text-anchor="middle">DB</text>
        <text x="692" y="113" fill="#4a5a6e" text-anchor="middle">данные</text>
      </g>
      <g stroke="#0ea5c4" stroke-width="1.4" marker-end="url(#ar3)">
        <line x1="112" y1="101" x2="136" y2="101"/><line x1="238" y1="101" x2="262" y2="101"/>
        <line x1="364" y1="101" x2="388" y2="101"/><line x1="500" y1="101" x2="524" y2="101"/>
        <line x1="626" y1="101" x2="650" y2="101"/>
      </g>
      <defs><marker id="ar3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#0ea5c4"/></marker></defs>
      <line x1="140" y1="152" x2="500" y2="152" stroke="#ff5370" stroke-width="1" stroke-dasharray="5 4"/>
      <text x="320" y="172" font-size="10.5" fill="#ff5370" text-anchor="middle">каждая пара соседей = свой парсер HTTP</text>
      <text x="320" y="188" font-size="10.5" fill="#ff5370" text-anchor="middle">расхождение в трактовке одного и того же запроса = smuggling / cache poisoning</text>
      <text x="370" y="220" font-size="10" fill="#4a5a6e" text-anchor="middle">TLS обычно терминируется на балансировщике: дальше внутри периметра трафик часто идёт открытым HTTP</text>
    </svg>
    <div class="svgcap">Важный факт для AppSec: <span class="hl">приложение видит не тот запрос, что отправил браузер</span>. По пути его переписывали, добавляли заголовки, нормализовывали путь.</div>
  </div>

  <div class="kv">
    <div class="kv-row"><div class="kv-k">Forward proxy</div><div class="kv-v">Стоит на стороне клиента, ходит в интернет от его имени. Так работает корпоративный прокси и так работает Burp Suite: браузер шлёт запросы ему, он показывает их тебе и отправляет дальше.</div></div>
    <div class="kv-row"><div class="kv-k">Reverse proxy</div><div class="kv-v">Стоит на стороне сервера. Клиент думает, что говорит с приложением, а говорит с nginx, который решает, на какой бэкенд отдать запрос. Терминирует TLS, режет заголовки, делает rate limiting.</div></div>
    <div class="kv-row"><div class="kv-k">Load balancer</div><div class="kv-v">Распределяет запросы между копиями приложения. Отсюда требование <span class="hl">stateless-бэкенда</span>: следующий запрос той же сессии может попасть на другой сервер, поэтому сессию нельзя хранить в памяти процесса.</div></div>
    <div class="kv-row"><div class="kv-k">CDN</div><div class="kv-v">Сеть кэширующих узлов по всему миру. Отдаёт статику из ближайшей точки, попутно работает щитом от DDoS и часто содержит WAF.</div></div>
    <div class="kv-row"><div class="kv-k">API gateway</div><div class="kv-v">Единая точка входа в микросервисы: маршрутизация, аутентификация, квоты, версионирование. С точки зрения безопасности — <span class="hl">место, где централизуют проверки</span>, и одновременно единая точка отказа.</div></div>
    <div class="kv-row"><div class="kv-k">WAF</div><div class="kv-v">Web Application Firewall: фильтрует запросы по сигнатурам и правилам. Полезен, но это <span class="rd">компенсирующая мера, а не исправление</span>. На собеседовании ответ «поставим WAF» вместо «починим код» считается неверным.</div></div>
  </div>

  <h2 class="sect">кэширование</h2>
  <p class="tx">Кэш хранит ответ и отдаёт его следующим запросам, не беспокоя сервер. Кэш бывает приватный (в браузере, только для тебя) и общий (CDN, прокси — <span class="hl">один ответ на многих пользователей</span>). Именно вторая разновидность интересна атакующему.</p>
  <div class="code"><span class="code-label">cache headers</span><span class="cmt"># сервер управляет кэшем через заголовки ответа</span>
<span class="fn">Cache-Control</span>: public, max-age=3600        <span class="cmt">← можно кэшировать всем на час</span>
<span class="fn">Cache-Control</span>: private, no-cache          <span class="cmt">← только браузер, и каждый раз перепроверять</span>
<span class="fn">Cache-Control</span>: no-store                   <span class="cmt">← не хранить нигде (для персональных данных)</span>
<span class="fn">ETag</span>: "a3f5b1"                            <span class="cmt">← отпечаток версии ресурса</span>
<span class="fn">Vary</span>: Origin, Accept-Encoding             <span class="cmt">← от каких заголовков зависит ответ</span></div>

  <p class="tx"><span class="hl">Ключ кэша</span> — то, по чему кэш решает «это тот же самый запрос». Обычно это метод + хост + путь + query. А вот заголовки в ключ по умолчанию <span class="rd">не входят</span> — если только их не перечислили в <code class="ic">Vary</code>. Заголовок, который влияет на ответ, но не входит в ключ, называется <span class="cy">unkeyed input</span>, и это фундамент двух атак.</p>

  <div class="sec-box">
    <div class="sb-t">SEC ▸ две атаки на кэш — не путать</div>
    <p class="tx"><span class="hl">Web Cache Poisoning (отравление)</span> — атакующий отправляет запрос со специальным unkeyed-заголовком, сервер генерирует <span class="rd">вредоносный ответ</span>, кэш его сохраняет под обычным ключом и раздаёт всем последующим пользователям. Направление: атакующий → кэш → жертвы. Результат — массовый XSS или редирект для всех посетителей страницы.</p>
    <p class="tx"><span class="hl">Web Cache Deception (обман)</span> — атакующий заманивает жертву на ссылку вида <code class="ic">/account/profile.css</code>. Приложение игнорирует лишнее расширение и отдаёт <span class="rd">персональные данные жертвы</span>, а кэш видит «.css» и решает, что это публичная статика, — и сохраняет. Дальше атакующий сам открывает этот URL и читает чужие данные. Направление: жертва → кэш → атакующий.</p>
    <p class="tx" style="margin-bottom:0">Мнемоника: <span class="cy">poisoning</span> — атакующий кладёт своё в кэш <span class="hl">для других</span>. <span class="cy">deception</span> — атакующий заставляет кэш сохранить чужое <span class="hl">для себя</span>.</p>
  </div>

  <div class="sec-box">
    <div class="sb-t">SEC ▸ request smuggling в двух абзацах</div>
    <p class="tx">В HTTP/1.1 по одному соединению между фронтендом и бэкендом идут запросы разных пользователей подряд. Длину тела можно указать двумя способами: <code class="ic">Content-Length</code> (число байт) и <code class="ic">Transfer-Encoding: chunked</code> (кусками, до нулевого чанка). Спецификация говорит: если есть оба — приоритет у <code class="ic">Transfer-Encoding</code>. Но на практике разные серверы решают конфликт по-разному.</p>
    <p class="tx" style="margin-bottom:0">Если фронтенд поверил одному заголовку, а бэкенд другому, они <span class="rd">разойдутся в том, где кончается запрос</span>. «Лишний» хвост останется в буфере бэкенда и приклеится к началу следующего запроса — который принадлежит другому пользователю. Так атакующий подменяет чужой запрос: угоняет сессии, обходит контроль доступа, доставляет XSS. Варианты называются <code class="ic">CL.TE</code>, <code class="ic">TE.CL</code> и <code class="ic">TE.TE</code> по тому, кто чему поверил. Глубоко разберёшь на PortSwigger — сейчас достаточно понимать причину: <span class="hl">два парсера, одна строка, разные выводы</span>.</p>
  </div>

  <div class="ask-box">
    <div class="sb-t">на собесе спросят</div>
    <div class="q">— Почему HTTP/2 в принципе не подвержен классическому request smuggling?</div>
    <div class="a">Потому что в HTTP/2 длина тела определяется структурой бинарных фреймов, а не текстовыми заголовками — двусмысленности «CL против TE» просто нет. Но если фронтенд принимает HTTP/2 и понижает соединение до HTTP/1.1 к бэкенду, он конвертирует запрос обратно в текст — и если внутри HTTP/2-запроса протащить скрытый заголовок <code class="ic">Transfer-Encoding</code>, он материализуется на этапе конвертации. Это <span class="cy">H2.CL</span> и <span class="cy">H2.TE</span> downgrade-атаки.</div>
    <div class="q">— В чём разница между cache poisoning и cache deception?</div>
    <div class="a">В том, кто жертва и что попадает в кэш. При <span class="cy">poisoning</span> атакующий кладёт в общий кэш свой вредоносный ответ, и его получают все остальные пользователи. При <span class="cy">deception</span> в кэш попадает приватный ответ жертвы, и его забирает атакующий. Первое — атака на многих, второе — кража у одного.</div>
    <div class="q">— Зачем нужен заголовок <code class="ic">Vary</code> и что будет, если его забыть?</div>
    <div class="a"><code class="ic">Vary</code> добавляет перечисленные заголовки в ключ кэша. Классический промах: сервер динамически отражает <code class="ic">Origin</code> в <code class="ic">Access-Control-Allow-Origin</code>, но не ставит <code class="ic">Vary: Origin</code>. Тогда кэш сохранит ответ с ACAO для одного origin и отдаст его всем — и политика CORS для остальных клиентов окажется чужой. Это уже уязвимость, а не только баг производительности.</div>
  </div>

  <h2 class="sect">референсы модуля</h2>
  <a class="ref rfc" href="https://www.rfc-editor.org/rfc/rfc9112.html" target="_blank" rel="noopener"><span class="r-t">RFC 9112 — HTTP/1.1</span><span class="r-d">актуальная спецификация синтаксиса 1.1: тут же формальные правила про Content-Length и Transfer-Encoding.</span><span class="r-u">rfc-editor.org/rfc/rfc9112.html</span></a>
  <a class="ref rfc" href="https://www.rfc-editor.org/rfc/rfc9114.html" target="_blank" rel="noopener"><span class="r-t">RFC 9114 — HTTP/3</span><span class="r-d">отображение семантики HTTP на QUIC.</span><span class="r-u">rfc-editor.org/rfc/rfc9114.html</span></a>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching" target="_blank" rel="noopener"><span class="r-t">MDN — HTTP Caching</span><span class="r-d">Cache-Control, ETag, ревалидация, приватный и общий кэш.</span><span class="r-u">developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching</span></a>
  <a class="ref ps" href="https://portswigger.net/web-security/request-smuggling" target="_blank" rel="noopener"><span class="r-t">PortSwigger — HTTP request smuggling</span><span class="r-d">лучший в мире материал по теме, с лабами. Возвращайся сюда после курса.</span><span class="r-u">portswigger.net/web-security/request-smuggling</span></a>
  <a class="ref ps" href="https://portswigger.net/web-security/web-cache-poisoning" target="_blank" rel="noopener"><span class="r-t">PortSwigger — Web cache poisoning</span><span class="r-d">unkeyed inputs, практика поиска и эксплуатации.</span><span class="r-u">portswigger.net/web-security/web-cache-poisoning</span></a>

  <h2 class="sect">checkpoint: секция PROTOCOL</h2>
  <p class="tx">Два модуля про HTTP позади. Проверь себя — вопросы построены так, как их задают на собеседовании: не «что такое GET», а «что из этого следует».</p>
  <div id="quiz-protocol"></div>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('httpv');go('html')">[✓] завершить секцию → HTML, CSS, JS</button>
  </div>
</section>`;
