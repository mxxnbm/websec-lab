/* ---------- m16 · SECURITY HEADERS ---------- */
const V_HEADERS = `
<section class="view" id="view-headers">
  <div class="eyebrow">browser security · модуль 16 · источники: MDN · OWASP · web.dev</div>
  <h1 class="vtitle">Security <span class="accent">headers</span></h1>
  <p class="vlede">CSP разобрали отдельно, потому что он большой. Но вокруг него — целый набор заголовков, каждый из которых закрывает свой класс проблем. В реальных отчётах по безопасности этот раздел встречается чаще всех остальных, и на собеседовании любят просить объяснить, <span class="hl">от чего именно</span> защищает каждый — а не просто перечислить названия.</p>

  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>headers-check.live · разбери набор заголовков</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Кликай заголовки — увидишь, от какой атаки защищает каждый, что бывает при его отсутствии и какое значение считается правильным:</p>
      <div id="headersLab"></div>
    </div>
  </div>

  <h2 class="sect">базовый набор</h2>
  <div class="kv">
    <div class="kv-row"><div class="kv-k">Strict-Transport-Security</div><div class="kv-v">Только HTTPS, N секунд. Против SSL stripping и понижения соединения. Разбирали в модуле 03. Значение: <code class="ic">max-age=31536000; includeSubDomains; preload</code>.</div></div>
    <div class="kv-row"><div class="kv-k">Content-Security-Policy</div><div class="kv-v">Какие ресурсы можно грузить и исполнять. Модуль 15.</div></div>
    <div class="kv-row"><div class="kv-k">X-Content-Type-Options</div><div class="kv-v">Единственное значение — <code class="ic">nosniff</code>. Запрещает браузеру угадывать MIME-тип по содержимому. Без него загруженный «файл-картинка» с HTML внутри может быть разобран как страница и дать <span class="rd">stored XSS</span>.</div></div>
    <div class="kv-row"><div class="kv-k">X-Frame-Options</div><div class="kv-v"><code class="ic">DENY</code> или <code class="ic">SAMEORIGIN</code> — запрет встраивания в iframe, защита от clickjacking. Значение <code class="ic">ALLOW-FROM</code> устарело и игнорируется. <span class="hl">Современная замена — <code class="ic">frame-ancestors</code> в CSP</span>, она поддерживает список origin. При наличии обоих заголовков CSP побеждает. Оставляют оба ради старых браузеров.</div></div>
    <div class="kv-row"><div class="kv-k">Referrer-Policy</div><div class="kv-v">Сколько информации уходит в заголовке <code class="ic">Referer</code> при переходе. Дефолт современных браузеров — <code class="ic">strict-origin-when-cross-origin</code>: своим отдаём полный URL, чужим только origin, по HTTP не отдаём ничего. Зачем: полный URL часто содержит <span class="rd">токены сброса пароля, идентификаторы сессий, приватные пути</span>, и всё это утекает третьей стороне.</div></div>
    <div class="kv-row"><div class="kv-k">Permissions-Policy</div><div class="kv-v">Разрешает или запрещает мощные API: камера, микрофон, геолокация, платежи — для самой страницы и для вложенных iframe. <code class="ic">camera=(), microphone=(), geolocation=()</code> отключает всё. Особенно важно там, где встраиваются сторонние виджеты.</div></div>
    <div class="kv-row"><div class="kv-k">X-XSS-Protection</div><div class="kv-v"><span class="rd">Устарел и нестандартен.</span> Старый встроенный фильтр отражённого XSS в IE и старом Chrome. MDN прямо предупреждает, что он <span class="hl">сам мог создавать уязвимости</span> на безопасных сайтах. Правильно — либо не ставить вовсе, либо <code class="ic">X-XSS-Protection: 0</code>. Если увидишь в чек-листе рекомендацию «поставьте 1; mode=block» — чек-лист устарел, и это хороший повод показать на собесе, что ты следишь за актуальностью.</div></div>
  </div>

  <h2 class="sect">cross-origin изоляция: COOP, COEP, CORP</h2>
  <p class="tx">Троица, которая появилась после Spectre. Смысл: <span class="hl">не дать чужим документам оказаться в одном процессе и в одной памяти с твоим</span>.</p>
  <div class="grid3">
    <div class="card acc-c"><div class="card-t">COOP</div><p class="tx" style="font-size:12px;margin:0"><code class="ic">Cross-Origin-Opener-Policy: same-origin</code> — разрывает связь с окном, которое тебя открыло, и с окнами, которые открываешь ты. Убирает доступ через <code class="ic">window.opener</code>, закрывает часть XS-Leaks и tabnabbing.</p></div>
    <div class="card acc-g"><div class="card-t">COEP</div><p class="tx" style="font-size:12px;margin:0"><code class="ic">Cross-Origin-Embedder-Policy: require-corp</code> — страница может встраивать только те ресурсы, которые явно разрешили себя встраивать. Вместе с COOP включает cross-origin isolation, без которой недоступны <code class="ic">SharedArrayBuffer</code> и точные таймеры.</p></div>
    <div class="card acc-a"><div class="card-t">CORP</div><p class="tx" style="font-size:12px;margin:0"><code class="ic">Cross-Origin-Resource-Policy: same-origin</code> — ресурс сам заявляет, кто может его загружать. Защищает от утечки содержимого через побочные каналы: запрос уходит, но браузер не даёт телу ответа попасть в чужой процесс.</p></div>
  </div>

  <h2 class="sect">Fetch Metadata — новый способ отсекать чужие запросы</h2>
  <p class="tx">Браузер сам добавляет к запросам служебные заголовки, описывающие <span class="hl">контекст</span>: откуда и зачем запрос пришёл. Их нельзя подделать из JS — их проставляет сам браузер.</p>
  <div class="kv">
    <div class="kv-row"><div class="kv-k">Sec-Fetch-Site</div><div class="kv-v"><code class="ic">same-origin</code> / <code class="ic">same-site</code> / <code class="ic">cross-site</code> / <code class="ic">none</code> — отношение между инициатором и целью. <code class="ic">none</code> означает прямой ввод адреса пользователем.</div></div>
    <div class="kv-row"><div class="kv-k">Sec-Fetch-Mode</div><div class="kv-v"><code class="ic">navigate</code>, <code class="ic">cors</code>, <code class="ic">no-cors</code>, <code class="ic">same-origin</code> — как именно сделан запрос.</div></div>
    <div class="kv-row"><div class="kv-k">Sec-Fetch-Dest</div><div class="kv-v">Куда пойдёт результат: <code class="ic">document</code>, <code class="ic">script</code>, <code class="ic">image</code>, <code class="ic">iframe</code>, <code class="ic">empty</code>. Позволяет ловить, когда JSON пытаются загрузить как скрипт.</div></div>
    <div class="kv-row"><div class="kv-k">Sec-Fetch-User</div><div class="kv-v"><code class="ic">?1</code> — навигация инициирована действием пользователя, а не скриптом.</div></div>
  </div>
  <div class="card acc-p">
    <div class="card-t">◇ Resource Isolation Policy на пальцах</div>
    <p class="tx" style="margin:0">Простое серверное правило поверх этих заголовков: <span class="hl">отклонять запросы, у которых <code class="ic">Sec-Fetch-Site: cross-site</code> и при этом <code class="ic">Sec-Fetch-Mode</code> не <code class="ic">navigate</code></span>. Это одной проверкой отсекает CSRF, часть XS-Leaks и попытки встроить твои эндпоинты как скрипт или картинку. Заголовки добавляет браузер, JS их подделать не может — в отличие от <code class="ic">Referer</code>, который легко скрыть. На собеседовании на вопрос «что нового кроме SameSite» это ровно тот ответ, которого ждут.</p>
  </div>

  <h2 class="sect">SRI — защита от подмены стороннего кода</h2>
  <p class="tx">Ты подключаешь библиотеку с CDN. Если CDN скомпрометируют или подменят файл, твоя страница исполнит чужой код с полными правами. <span class="cy">Subresource Integrity</span> закрывает это: указываешь хеш ожидаемого файла, и браузер сверяет его перед исполнением.</p>
  <div class="code"><span class="code-label">SRI</span>&lt;script src=<span class="st">"https://cdn.example.com/lib.js"</span>
        <span class="op">integrity</span>=<span class="st">"sha384-oqVuAfXRKap7fdgcCY5uykM6+R9G"</span>
        <span class="op">crossorigin</span>=<span class="st">"anonymous"</span>&gt;&lt;/script&gt;
<span class="cmt">   ↑ не совпал хеш — файл не исполняется вообще</span></div>
  <p class="tx" style="font-size:12px">Ограничение, которое надо знать: SRI работает только для <span class="hl">неизменяемых</span> файлов с фиксированной версией. Для скриптов, которые обновляются на стороне поставщика (например, счётчик аналитики), он неприменим — там остаются CSP и минимизация количества сторонних скриптов. Атрибут <code class="ic">crossorigin</code> обязателен, иначе браузер не сможет проверить содержимое.</p>

  <h2 class="sect">итоговый набор для типичного приложения</h2>
  <div class="code"><span class="code-label">baseline 2026</span><span class="fn">Strict-Transport-Security</span>: max-age=31536000; includeSubDomains; preload
<span class="fn">Content-Security-Policy</span>: script-src 'nonce-{RANDOM}' 'strict-dynamic' https: 'unsafe-inline';
                          object-src 'none'; base-uri 'none'; frame-ancestors 'none';
                          form-action 'self'
<span class="fn">X-Content-Type-Options</span>: nosniff
<span class="fn">X-Frame-Options</span>: DENY
<span class="fn">Referrer-Policy</span>: strict-origin-when-cross-origin
<span class="fn">Permissions-Policy</span>: camera=(), microphone=(), geolocation=(), payment=()
<span class="fn">Cross-Origin-Opener-Policy</span>: same-origin
<span class="fn">Cross-Origin-Resource-Policy</span>: same-origin
<span class="fn">Cache-Control</span>: no-store          <span class="cmt">← для страниц с персональными данными</span></div>
  <div class="card acc-r">
    <div class="card-t">⚡ важная оговорка</div>
    <p class="tx" style="margin:0">Заголовки — <span class="hl">не замена исправлению кода</span>. Они снижают последствия и закрывают целые классы мелких проблем, но уязвимую логику не чинят. В отчёте «отсутствуют security headers» — находка низкой критичности; «IDOR в API заказов» — высокой. На собеседовании кандидата, который на любой вопрос отвечает «поставим заголовки», считают поверхностным. Правильная рамка: <span class="cy">сначала устранить причину, заголовки — как эшелонированная защита</span>.</p>
  </div>

  <div class="ask-box">
    <div class="sb-t">на собесе спросят</div>
    <div class="q">— Зачем nosniff, если я и так отдаю правильный Content-Type?</div>
    <div class="a">Потому что «правильный» бывает не везде. Загруженные пользователями файлы, статика с другого сервиса, ошибочные ответы приложения, старые обработчики — везде может уехать неверный или пустой тип. <code class="ic">nosniff</code> — дешёвая страховка, которая делает поведение браузера предсказуемым: <span class="hl">верить только заявленному типу</span>. Отдельно он блокирует загрузку скриптов и стилей с неподходящим MIME, что мешает ряду атак через загрузку файлов.</div>
    <div class="q">— X-Frame-Options или frame-ancestors?</div>
    <div class="a"><code class="ic">frame-ancestors</code> — современный и более гибкий вариант: поддерживает список из нескольких origin, работает по правилам CSP. <code class="ic">X-Frame-Options</code> умеет только DENY и SAMEORIGIN. При наличии обоих браузер выполняет CSP, а XFO игнорирует. Практика — ставить оба ради старых клиентов. И отдельно помнить: <span class="rd">X-Frame-Options в теге meta не работает вообще</span>, только как HTTP-заголовок.</div>
    <div class="q">— Чем Fetch Metadata лучше проверки Referer или Origin?</div>
    <div class="a">Эти заголовки проставляет сам браузер, и скрипт их подделать не может — они защищены префиксом <code class="ic">Sec-</code>. <code class="ic">Referer</code> может отсутствовать вовсе (по политике referrer или из соображений приватности), и приложения обычно вынуждены трактовать его отсутствие как «пропустить». <code class="ic">Origin</code> присутствует не во всех типах запросов. <code class="ic">Sec-Fetch-Site</code> есть всегда и однозначно говорит об отношении инициатора к цели.</div>
  </div>

  <h2 class="sect">референсы модуля</h2>
  <a class="ref owasp" href="https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html" target="_blank" rel="noopener"><span class="r-t">OWASP — HTTP Security Headers Cheat Sheet</span><span class="r-d">актуальный список с рекомендованными значениями и пометками об устаревших.</span><span class="r-u">cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html</span></a>
  <a class="ref" href="https://web.dev/articles/fetch-metadata" target="_blank" rel="noopener"><span class="r-t">web.dev — Protect your resources with Fetch Metadata</span><span class="r-d">готовая логика Resource Isolation Policy с примерами кода.</span><span class="r-u">web.dev/articles/fetch-metadata</span></a>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides" target="_blank" rel="noopener"><span class="r-t">MDN — Practical security implementation guides</span><span class="r-d">по одному разбору на каждый заголовок: что делает, как настроить, что сломается.</span><span class="r-u">developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides</span></a>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity" target="_blank" rel="noopener"><span class="r-t">MDN — Subresource Integrity</span><span class="r-d">как считать хеш, зачем crossorigin, где SRI не работает.</span><span class="r-u">developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity</span></a>
  <a class="ref" href="https://securityheaders.com/" target="_blank" rel="noopener"><span class="r-t">securityheaders.com</span><span class="r-d">инструмент: проверь любой сайт и посмотри его оценку. Прогони пару известных сервисов — увидишь реальную картину.</span><span class="r-u">securityheaders.com</span></a>

  <h2 class="sect">checkpoint: секция BROWSER SECURITY</h2>
  <p class="tx">Финальная и самая важная секция для AppSec. Эти вопросы задают на собеседованиях почти дословно.</p>
  <div id="quiz-browsersec"></div>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('headers');go('owasp')">[✓] завершить секцию → карта OWASP Top 10</button>
  </div>
</section>`;
