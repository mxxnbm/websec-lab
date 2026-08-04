/* ---------- m15 · CSP ---------- */
const V_CSP = `
<section class="view" id="view-csp">
  <div class="eyebrow">browser security · модуль 15 · источники: MDN · W3C CSP3 · Google</div>
  <h1 class="vtitle"><span class="accent">CSP</span> — Content Security Policy</h1>
  <p class="vlede">SOP разделяет origin, CORS управляет чтением ответов. CSP решает другую задачу: <span class="hl">какие ресурсы вообще имеет право загружать и исполнять эта страница</span>. Это второй рубеж обороны против XSS — на случай, если экранирование где-то не сработало. Механизм мощный, но настраивается тяжело, и большинство политик в реальном мире не защищают ни от чего.</p>

  <h2 class="sect">как это выглядит</h2>
  <div class="code"><span class="code-label">HTTP response header</span><span class="fn">Content-Security-Policy</span>: default-src 'self'; script-src 'self' https://cdn.example.com; object-src 'none'</div>
  <p class="tx">Читается так: «по умолчанию грузи ресурсы только со своего origin; скрипты — со своего origin и с этого CDN; плагины (<code class="ic">object</code>, <code class="ic">embed</code>) — ниоткуда». Всё, что не разрешено, браузер <span class="hl">блокирует и пишет в консоль</span>.</p>
  <p class="tx">Задаётся HTTP-заголовком, либо через <code class="ic">&lt;meta http-equiv="Content-Security-Policy"&gt;</code>. Второй способ ограничен: <span class="rd">через meta не работают <code class="ic">frame-ancestors</code>, <code class="ic">report-uri</code> и sandbox</span> — потому что эти директивы должны применяться до разбора документа. Правильный способ — заголовок.</p>

  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>csp-eval.live · собери политику и оцени её</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Переключай директивы — увидишь итоговую политику, что она блокирует и остаются ли обходы:</p>
      <div id="cspLab"></div>
    </div>
  </div>

  <h2 class="sect">основные директивы</h2>
  <div class="kv">
    <div class="kv-row"><div class="kv-k">default-src</div><div class="kv-v">Фолбэк для большинства остальных директив. Если <code class="ic">script-src</code> не задан — берётся отсюда.</div></div>
    <div class="kv-row"><div class="kv-k">script-src</div><div class="kv-v"><span class="hl">Главная директива для защиты от XSS.</span> Откуда можно грузить и исполнять JS.</div></div>
    <div class="kv-row"><div class="kv-k">style-src</div><div class="kv-v">Источники CSS. Через CSS тоже возможны утечки данных, хотя и слабее.</div></div>
    <div class="kv-row"><div class="kv-k">img-src / font-src / media-src</div><div class="kv-v">Картинки, шрифты, медиа. Важно: канал <code class="ic">img-src</code> часто используют для эксфильтрации, подставляя данные в URL картинки.</div></div>
    <div class="kv-row"><div class="kv-k">connect-src</div><div class="kv-v">Куда разрешено слать <code class="ic">fetch</code>, XHR, WebSocket, EventSource. <span class="hl">Ключевая директива против кражи данных</span>: даже при сработавшем XSS отправить украденное будет некуда.</div></div>
    <div class="kv-row"><div class="kv-k">frame-ancestors</div><div class="kv-v">Кто может встроить эту страницу в iframe. Современная замена <code class="ic">X-Frame-Options</code>, защита от clickjacking. <span class="hl">При наличии обоих побеждает frame-ancestors.</span></div></div>
    <div class="kv-row"><div class="kv-k">frame-src / child-src</div><div class="kv-v">Что эта страница может встраивать в себя.</div></div>
    <div class="kv-row"><div class="kv-k">base-uri</div><div class="kv-v">Ограничивает тег <code class="ic">&lt;base&gt;</code>. Без <code class="ic">base-uri 'none'</code> инъекция этого тега <span class="rd">переписывает базовый адрес всех относительных ссылок</span> — и скрипты начинают грузиться с домена атакующего, формально не нарушая script-src.</div></div>
    <div class="kv-row"><div class="kv-k">form-action</div><div class="kv-v">Куда формы могут отправлять данные. Закрывает кражу учётных данных через подменённый <code class="ic">action</code>.</div></div>
    <div class="kv-row"><div class="kv-k">object-src</div><div class="kv-v">Практически всегда <code class="ic">'none'</code>: устаревшие плагины дают обходы script-src через <code class="ic">&lt;object data="javascript:..."&gt;</code>.</div></div>
    <div class="kv-row"><div class="kv-k">upgrade-insecure-requests</div><div class="kv-v">Переписывает <code class="ic">http://</code>-ссылки на <code class="ic">https://</code> — лечит mixed content без правки шаблонов.</div></div>
    <div class="kv-row"><div class="kv-k">report-uri / report-to</div><div class="kv-v">Куда слать отчёты о нарушениях. <code class="ic">report-to</code> — современный вариант через Reporting API, <code class="ic">report-uri</code> устарел, но ещё поддерживается шире.</div></div>
  </div>

  <h2 class="sect">три способа разрешить свои скрипты</h2>
  <div class="grid3">
    <div class="card acc-r">
      <div class="card-t">allowlist доменов</div>
      <p class="tx" style="font-size:12px;margin:0"><code class="ic">script-src 'self' https://cdn.example.com</code>. Просто и <span class="rd">почти всегда обходимо</span>: на любом крупном CDN найдётся JSONP-эндпоинт или уязвимая старая библиотека, через которую исполняется произвольный код. Google исследовал реальные политики и показал, что подавляющее большинство allowlist-политик обходятся.</p>
    </div>
    <div class="card acc-g">
      <div class="card-t">nonce</div>
      <p class="tx" style="font-size:12px;margin:0">Сервер генерирует случайное значение <span class="hl">на каждый ответ</span>, кладёт его в заголовок и в атрибут доверенных тегов: <code class="ic">&lt;script nonce="r4nd0m"&gt;</code>. Браузер исполняет только совпавшие. Атакующий не знает значение заранее, потому что оно новое каждый раз.</p>
    </div>
    <div class="card acc-c">
      <div class="card-t">hash</div>
      <p class="tx" style="font-size:12px;margin:0"><code class="ic">'sha256-...'</code> — хеш содержимого конкретного inline-скрипта. Годится для статики, которая не меняется. Не требует динамики на сервере, но при каждом изменении кода надо пересчитывать.</p>
    </div>
  </div>

  <div class="card acc-a">
    <div class="card-t">◇ strict-dynamic — что это решает</div>
    <p class="tx" style="margin:0">Проблема nonce: сторонние библиотеки часто сами подгружают другие скрипты, и им негде взять nonce. Ключевое слово <code class="ic">'strict-dynamic'</code> говорит: «скрипт, который прошёл проверку по nonce или hash, <span class="hl">получает право загружать другие скрипты</span>». При этом список доменов игнорируется — доверие передаётся по цепочке, а не по адресу. Это рекомендуемая современная конструкция:</p>
    <div class="code" style="margin-bottom:0"><span class="code-label">strict CSP</span><span class="fn">Content-Security-Policy</span>:
  script-src 'nonce-{RANDOM}' 'strict-dynamic' https: 'unsafe-inline';
  object-src 'none';
  base-uri 'none';
  frame-ancestors 'none';
  require-trusted-types-for 'script';</div>
  </div>
  <p class="tx" style="font-size:12px">Про хвост <code class="ic">https: 'unsafe-inline'</code>: это <span class="hl">обратная совместимость</span>, а не дыра. Современный браузер, увидев nonce, автоматически игнорирует <code class="ic">'unsafe-inline'</code>, а увидев <code class="ic">'strict-dynamic'</code> — игнорирует список источников. Старый браузер, не знающий этих ключевых слов, откатится на менее строгую, но рабочую политику.</p>

  <div class="sec-box">
    <div class="sb-t">SEC ▸ чем убивают собственную политику</div>
    <p class="tx"><span class="hl">'unsafe-inline' в script-src</span> — разрешает inline-скрипты, обработчики событий и <code class="ic">javascript:</code>. То есть ровно то, чем эксплуатируется XSS. Политика с ним <span class="rd">не защищает от XSS вообще</span>, хотя формально «CSP включён».</p>
    <p class="tx"><span class="hl">'unsafe-eval'</span> — открывает <code class="ic">eval</code>, <code class="ic">new Function</code>, строковые <code class="ic">setTimeout</code>. Часто тянется старыми фреймворками и шаблонизаторами.</p>
    <p class="tx"><span class="hl">статический nonce</span> — если значение не меняется от ответа к ответу, атакующий читает его из исходника страницы и подставляет в свой payload. Nonce обязан быть криптослучайным и одноразовым, иначе он декоративный.</p>
    <p class="tx"><span class="hl">wildcard и широкие домены</span> — <code class="ic">script-src *</code> или разрешение целого хостинга статики, где кто угодно может загрузить свой файл.</p>
    <p class="tx"><span class="hl">JSONP на разрешённом домене</span> — <code class="ic">&lt;script src="https://trusted.com/api?callback=alert(1)"&gt;</code>. Домен в списке, значит браузер разрешает; а сервер услужливо оборачивает произвольную строку в исполняемый код.</p>
    <p class="tx" style="margin-bottom:0"><span class="hl">забытые base-uri и object-src</span> — два обхода, которые не закрываются одним script-src. Поэтому обе директивы ставят в <code class="ic">'none'</code> почти всегда.</p>
  </div>

  <h2 class="sect">как внедрять, не сломав продакшен</h2>
  <p class="tx">Готовая политика на живом сайте почти наверняка что-то сломает. Порядок действий, который работает:</p>
  <div class="kv">
    <div class="kv-row"><div class="kv-k">1 · Report-Only</div><div class="kv-v">Включить <code class="ic">Content-Security-Policy-Report-Only</code>: браузер <span class="hl">ничего не блокирует</span>, только шлёт отчёты о том, что заблокировал бы. Собрать данные на реальном трафике.</div></div>
    <div class="kv-row"><div class="kv-k">2 · Разобрать отчёты</div><div class="kv-v">Отделить легитимное (аналитика, платёжный виджет, шрифты) от лишнего. Часто на этом шаге находится софт, о котором в команде уже забыли.</div></div>
    <div class="kv-row"><div class="kv-k">3 · Убрать inline</div><div class="kv-v">Вынести inline-скрипты в файлы или проставить им nonce. Это основная работа и основное сопротивление со стороны разработки.</div></div>
    <div class="kv-row"><div class="kv-k">4 · Включить в блокирующем режиме</div><div class="kv-v">Сначала на части трафика или на одном разделе, потом на всём. Report-Only при этом можно оставить параллельно с более строгой политикой.</div></div>
    <div class="kv-row"><div class="kv-k">5 · Проверить</div><div class="kv-v">Прогнать политику через Google CSP Evaluator — он покажет, обходится ли она известными способами.</div></div>
  </div>

  <div class="card acc-p">
    <div class="card-t">◇ ответ на «бизнес просит оставить inline-скрипты»</div>
    <p class="tx" style="margin:0">Правильная позиция для AppSec — не «нельзя», а «вот варианты». Три ступени: <span class="hl">nonce</span> (inline остаётся, но с одноразовой меткой — минимум правок в шаблонах), <span class="hl">hash</span> (для inline, который не меняется, — сервер править вообще не надо), <span class="hl">поэтапный вынос</span> с Report-Only и дедлайном. И честная оценка риска: политика с <code class="ic">'unsafe-inline'</code> не даёт защиты от XSS, поэтому если её оставляют — это осознанно принятый риск, зафиксированный письменно, а не «у нас есть CSP».</p>
  </div>

  <div class="ask-box">
    <div class="sb-t">на собесе спросят</div>
    <div class="q">— В чём разница между nonce и hash, когда что использовать?</div>
    <div class="a"><span class="cy">Nonce</span> — случайное значение на каждый ответ, требует динамической генерации страницы; подходит для меняющегося inline-кода и для серверного рендеринга. <span class="cy">Hash</span> — отпечаток конкретного содержимого; подходит для неизменного inline и для статических страниц, где сервера с логикой нет вовсе. Ключевое условие для nonce — <span class="hl">он должен быть новым при каждом запросе</span>, иначе защиты нет. Со <code class="ic">'strict-dynamic'</code> работают оба.</div>
    <div class="q">— Чем CSP отличается от CORS?</div>
    <div class="a">Разные задачи и разные направления. <span class="cy">CSP</span> — <span class="hl">исходящая</span> политика: что моя страница имеет право грузить и исполнять; защищает от XSS и от подгрузки чужого кода. <span class="cy">CORS</span> — <span class="hl">входящая</span>: кому позволено читать ответы моего сервера; ослабляет SOP. CSP настраивает владелец страницы для себя, CORS — владелец API для чужих клиентов.</div>
    <div class="q">— Заменяет ли CSP экранирование вывода?</div>
    <div class="a">Нет. CSP — второй рубеж (defense in depth). Первый и главный — корректное контекстное экранирование и безопасные шаблонизаторы. CSP снижает <span class="hl">последствия</span> XSS: даже при сработавшей инъекции скрипт не загрузится с чужого домена и не сможет отправить украденное, если <code class="ic">connect-src</code> закрыт. Но полагаться на CSP как на единственную защиту нельзя — обходы находят регулярно.</div>
  </div>

  <h2 class="sect">референсы модуля</h2>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP" target="_blank" rel="noopener"><span class="r-t">MDN — Content Security Policy</span><span class="r-d">полный справочник директив и значений с примерами.</span><span class="r-u">developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP</span></a>
  <a class="ref" href="https://www.w3.org/TR/CSP3/" target="_blank" rel="noopener"><span class="r-t">W3C — Content Security Policy Level 3</span><span class="r-d">спецификация. Формальная семантика strict-dynamic и nonce.</span><span class="r-u">w3.org/TR/CSP3</span></a>
  <a class="ref" href="https://csp-evaluator.withgoogle.com/" target="_blank" rel="noopener"><span class="r-t">Google CSP Evaluator</span><span class="r-d">вставь свою политику и получи список обходов. Обязательный инструмент, спрашивают о нём на собесах.</span><span class="r-u">csp-evaluator.withgoogle.com</span></a>
  <a class="ref" href="https://web.dev/articles/strict-csp" target="_blank" rel="noopener"><span class="r-t">web.dev — Mitigate XSS with a strict CSP</span><span class="r-d">практическое руководство по внедрению nonce-based политики, включая совместимость.</span><span class="r-u">web.dev/articles/strict-csp</span></a>
  <a class="ref ps" href="https://portswigger.net/web-security/cross-site-scripting/content-security-policy" target="_blank" rel="noopener"><span class="r-t">PortSwigger — CSP и её обходы</span><span class="r-d">взгляд атакующего: как ищут дыры в политике.</span><span class="r-u">portswigger.net/web-security/cross-site-scripting/content-security-policy</span></a>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('csp');go('headers')">[✓] завершить → security headers</button>
  </div>
</section>`;
