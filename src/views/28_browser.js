/* ---------- m08 · BROWSER INTERNALS ---------- */
const V_BROWSER = `
<section class="view" id="view-browser">
  <div class="eyebrow">client · модуль 08 · источники: MDN · web.dev · Chromium</div>
  <h1 class="vtitle">Браузер <span class="accent">изнутри</span></h1>
  <p class="vlede">Браузер — самая сложная программа на твоём компьютере после операционной системы. Он скачивает и исполняет чужой недоверенный код десятки раз в минуту, и при этом не даёт ему добраться до твоих файлов. В заметках по собеседованиям пункт «как работает браузер в целом» обычно висит незакрытым — закроем его здесь.</p>

  <h2 class="sect">конвейер отрисовки</h2>
  <p class="tx">Браузер получил HTML-текст. Как из строки символов получается кликабельная страница? Через фиксированную последовательность этапов.</p>

  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>render-pipeline.live · как HTML превращается в пиксели</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Жми «шаг ▸» — пройди конвейер от текста до изображения на экране:</p>
      <div id="browserLab"></div>
    </div>
  </div>

  <div class="ascii"><span class="h">CRITICAL RENDERING PATH</span>

  HTML ──▶ <span class="h">DOM</span>  ─┐
                  ├──▶ <span class="a">Render Tree</span> ──▶ <span class="g">Layout</span> ──▶ <span class="g">Paint</span> ──▶ <span class="g">Composite</span>
  CSS  ──▶ <span class="h">CSSOM</span> ─┘        <span class="f">(что видно)</span>   <span class="f">(где)</span>    <span class="f">(чем)</span>   <span class="f">(в каком</span>
                                                          <span class="f">порядке)</span>

  <span class="f">DOM     — дерево объектов из разметки, строится инкрементально</span>
  <span class="f">CSSOM   — дерево стилей; БЛОКИРУЕТ рендер, потому что позднее</span>
  <span class="f">          правило может переопределить раннее</span>
  <span class="f">Render  — DOM + CSSOM, только видимые узлы (display:none и</span>
  <span class="f">  Tree    содержимое head сюда не попадают)</span>
  <span class="f">Layout  — геометрия: координаты и размеры каждого узла (reflow)</span>
  <span class="f">Paint   — заливка пикселей по слоям</span>
  <span class="f">Composite — сборка слоёв в финальную картинку, часто на GPU</span></div>

  <div class="card acc-c">
    <div class="card-t">◇ почему CSS блокирует рендер, а картинки нет</div>
    <p class="tx" style="margin:0">HTML можно разбирать по кусочкам и показывать частями. CSS — нельзя: последнее правило в файле может переопределить первое, поэтому пока таблица стилей не загружена целиком, браузер не знает, как выглядит хоть один элемент. Отрисовать раньше — значит показать пользователю страницу без стилей и потом дёрнуть её. Картинки не блокируют: под них резервируется место, а появляются они когда придут.</p>
  </div>

  <h2 class="sect">DOM — что это на самом деле</h2>
  <p class="tx">DOM (Document Object Model) — <span class="hl">не HTML-текст</span>, а живое дерево объектов в памяти, построенное по этому тексту. Это принципиально: JS работает не со строкой разметки, а с объектами, и любое изменение DOM сразу отражается на экране.</p>
  <div class="ascii">  &lt;html&gt;                     <span class="h">html</span>
    &lt;body&gt;                     <span class="f">└─</span> <span class="h">body</span>
      &lt;h1&gt;Привет&lt;/h1&gt;             <span class="f">├─</span> <span class="a">h1</span>
      &lt;div id="x"&gt;                <span class="f">│   └─</span> <span class="g">"Привет"</span>
        &lt;p&gt;текст&lt;/p&gt;              <span class="f">└─</span> <span class="a">div</span> <span class="f">#x</span>
      &lt;/div&gt;                          <span class="f">└─</span> <span class="a">p</span>
    &lt;/body&gt;                              <span class="f">└─</span> <span class="g">"текст"</span>
  &lt;/html&gt;
  <span class="f">разметка</span>                    <span class="f">дерево объектов в памяти</span></div>
  <p class="tx">Дальше пригодятся два термина, на которых держится весь поиск XSS: <span class="cy">source</span> — место, откуда в скрипт приходят управляемые пользователем данные (<code class="ic">location.hash</code>, <code class="ic">document.referrer</code>, <code class="ic">postMessage</code>), и <span class="cy">sink</span> — место, где эти данные превращаются в код (<code class="ic">innerHTML</code>, <code class="ic">document.write</code>, <code class="ic">eval</code>, <code class="ic">setTimeout</code> со строкой). DOM-based XSS — это путь от source к sink без экранирования, целиком внутри браузера, <span class="rd">сервер о нём вообще не узнаёт</span>.</p>

  <h2 class="sect">архитектура: почему браузер — это много процессов</h2>
  <p class="tx">Открой диспетчер задач при запущенном Chrome — увидишь десятки процессов. Это не расточительность, а модель безопасности.</p>

  <div class="svgbox">
    <svg viewBox="0 0 720 300" role="img" aria-label="Многопроцессная архитектура браузера">
      <text x="360" y="20" font-size="12" fill="#38bdf8" text-anchor="middle">МНОГОПРОЦЕССНАЯ АРХИТЕКТУРА (модель Chrome)</text>
      <rect x="30" y="38" width="300" height="112" rx="8" fill="#0f1620" stroke="#00e676" stroke-opacity=".5"/>
      <text x="180" y="60" font-size="11.5" fill="#00e676" text-anchor="middle">BROWSER PROCESS — привилегированный</text>
      <g font-size="10" fill="#7d8ea3">
        <text x="48" y="82">· UI: адресная строка, вкладки, меню</text>
        <text x="48" y="100">· сеть: DNS, TCP, TLS, разбор ответов</text>
        <text x="48" y="118">· доступ к файловой системе</text>
        <text x="48" y="136">· управление всеми остальными процессами</text>
      </g>
      <rect x="360" y="38" width="150" height="112" rx="8" fill="#0f1620" stroke="#ffb020" stroke-opacity=".5"/>
      <text x="435" y="60" font-size="11.5" fill="#ffb020" text-anchor="middle">GPU PROCESS</text>
      <g font-size="10" fill="#7d8ea3">
        <text x="374" y="84">· растеризация</text>
        <text x="374" y="102">· композитинг слоёв</text>
        <text x="374" y="120">· изолирован от</text>
        <text x="374" y="136">  драйверов</text>
      </g>
      <rect x="540" y="38" width="150" height="112" rx="8" fill="#0f1620" stroke="#5c9eff" stroke-opacity=".5"/>
      <text x="615" y="60" font-size="11.5" fill="#5c9eff" text-anchor="middle">NETWORK SERVICE</text>
      <g font-size="10" fill="#7d8ea3">
        <text x="554" y="84">· выделенный</text>
        <text x="554" y="100">  сетевой стек</text>
        <text x="554" y="118">· проверки CORS,</text>
        <text x="554" y="134">  CORB, cookies</text>
      </g>
      <g>
        <rect x="30" y="176" width="200" height="86" rx="8" fill="#0c111a" stroke="#ff5370" stroke-opacity=".5"/>
        <text x="130" y="197" font-size="11" fill="#ff5370" text-anchor="middle">RENDERER · site A</text>
        <text x="130" y="216" font-size="10" fill="#7d8ea3" text-anchor="middle">парсинг HTML, DOM,</text>
        <text x="130" y="232" font-size="10" fill="#7d8ea3" text-anchor="middle">CSS, исполнение JS</text>
        <text x="130" y="252" font-size="10" fill="#ff5370" text-anchor="middle">В SANDBOX</text>
        <rect x="250" y="176" width="200" height="86" rx="8" fill="#0c111a" stroke="#ff5370" stroke-opacity=".5"/>
        <text x="350" y="197" font-size="11" fill="#ff5370" text-anchor="middle">RENDERER · site B</text>
        <text x="350" y="216" font-size="10" fill="#7d8ea3" text-anchor="middle">отдельный процесс —</text>
        <text x="350" y="232" font-size="10" fill="#7d8ea3" text-anchor="middle">даже для iframe</text>
        <text x="350" y="252" font-size="10" fill="#ff5370" text-anchor="middle">В SANDBOX</text>
        <rect x="470" y="176" width="220" height="86" rx="8" fill="#0c111a" stroke="#c792ea" stroke-opacity=".5"/>
        <text x="580" y="200" font-size="11" fill="#c792ea" text-anchor="middle">SITE ISOLATION</text>
        <text x="580" y="222" font-size="10" fill="#7d8ea3" text-anchor="middle">разные сайты — всегда</text>
        <text x="580" y="238" font-size="10" fill="#7d8ea3" text-anchor="middle">разные процессы. Защита</text>
        <text x="580" y="254" font-size="10" fill="#7d8ea3" text-anchor="middle">от Spectre и утечек памяти</text>
      </g>
      <g stroke="#4a5a6e" stroke-width="1" stroke-dasharray="3 3">
        <line x1="130" y1="150" x2="130" y2="174"/><line x1="350" y1="150" x2="350" y2="174"/>
      </g>
      <text x="360" y="288" font-size="10" fill="#4a5a6e" text-anchor="middle">renderer не имеет прямого доступа к файлам, сети и ОС — всё только через browser process по IPC</text>
    </svg>
    <div class="svgcap">Разделение даёт три вещи: <span class="cy">стабильность</span> (упала вкладка — не упал браузер), <span class="cy">производительность</span> (параллельно на разных ядрах) и главное — <span class="cy">безопасность</span>.</div>
  </div>

  <div class="card acc-r">
    <div class="card-t">⚡ sandbox и Site Isolation — зачем это придумали</div>
    <p class="tx"><span class="hl">Sandbox</span>: процесс, который исполняет чужой JS и разбирает чужой HTML, лишён почти всех прав в ОС. Он не может открыть файл, не может слушать порт, не может запустить программу. Всё это он просит у browser process, который проверяет запрос. Поэтому чтобы вырваться из браузера в систему, атакующему нужна цепочка: сначала баг в движке рендеринга, потом отдельный <span class="rd">sandbox escape</span>. Такие связки стоят сотни тысяч долларов на рынке эксплойтов.</p>
    <p class="tx" style="margin-bottom:0"><span class="hl">Site Isolation</span>: страницы разных сайтов всегда попадают в разные процессы — включая вложенные iframe. Включено по умолчанию с 2018 года, и причина конкретная: атаки <span class="rd">Spectre и Meltdown</span> позволяли через побочные каналы читать память своего процесса. Если чужой сайт исполняется в твоём процессе, он может вычитать оттуда чужие данные. Разнесли по процессам — читать стало нечего.</p>
  </div>

  <h2 class="sect">event loop — почему JS «однопоточный», но не тормозит</h2>
  <p class="tx">JavaScript в странице выполняется <span class="hl">в одном потоке</span>. Тот же поток отвечает за отрисовку. Из этого следует: если скрипт зациклится, страница перестанет реагировать целиком — не только на клики, но и на прокрутку.</p>
  <p class="tx">Как тогда работают запросы к серверу и таймеры? Через очередь. Долгие операции отдаются браузеру, а результат кладётся в очередь задач. Как только стек текущего кода опустел, event loop берёт следующую задачу. Отсюда — асинхронность через колбэки, промисы и <code class="ic">async/await</code>.</p>
  <div class="card acc-a">
    <div class="card-t">◇ практическое следствие для AppSec</div>
    <p class="tx" style="margin:0">Тайминг решает. Скрипт защиты, поставленный в очередь, выполнится <span class="hl">после</span> синхронного inline-скрипта, который стоит ниже в разметке. Поэтому обёртки-санитайзеры и переопределения опасных функций подключают строго синхронно и первыми. И поэтому же гонки внутри страницы (например, между загрузкой конфигурации и первым запросом) — реальный источник багов, а не теория.</p>
  </div>

  <h2 class="sect">где браузер хранит данные</h2>
  <div class="twrap"><table class="t">
    <tr><th>Хранилище</th><th>Объём</th><th>Живёт</th><th>Уходит на сервер</th><th>Доступно из JS</th></tr>
    <tr><td class="cy">Cookie</td><td>~4 КБ</td><td>по Expires/Max-Age</td><td class="gs">да, автоматически</td><td class="am">да, если нет HttpOnly</td></tr>
    <tr><td class="cy">localStorage</td><td>5-10 МБ</td><td>вечно, пока не удалят</td><td class="rd">нет</td><td class="rd">да, всегда</td></tr>
    <tr><td class="cy">sessionStorage</td><td>5-10 МБ</td><td>до закрытия вкладки</td><td class="rd">нет</td><td class="rd">да, всегда</td></tr>
    <tr><td class="cy">IndexedDB</td><td>сотни МБ</td><td>вечно</td><td class="rd">нет</td><td class="rd">да, всегда</td></tr>
    <tr><td class="cy">Cache API</td><td>большой</td><td>вечно</td><td class="rd">нет</td><td class="rd">да, всегда</td></tr>
  </table></div>
  <p class="tx">Все хранилища привязаны к <span class="hl">origin</span>: <code class="ic">https://a.example.com</code> не видит данные <code class="ic">https://b.example.com</code>. Ключевое различие для безопасности: у localStorage <span class="rd">нет аналога HttpOnly</span>. Что бы там ни лежало — любой скрипт на странице это прочитает. Отсюда вечный спор «где хранить токен», к которому вернёмся в модуле 12.</p>

  <div class="ask-box">
    <div class="sb-t">на собесе спросят</div>
    <div class="q">— Зачем браузеру много процессов, если это дороже по памяти?</div>
    <div class="a">Ради изоляции. Renderer исполняет недоверенный код, поэтому его держат в sandbox без прав в системе — чтобы уязвимость в движке не превращалась сразу в компрометацию машины. Site Isolation дополнительно разносит разные сайты по разным процессам, чтобы спекулятивные атаки на процессорный кэш (Spectre) не давали читать данные чужого сайта из общей памяти. Плата памятью — сознательный размен на безопасность.</div>
    <div class="q">— XSS сработал, скрипт встроился в DOM, но alert не появился. Почему?</div>
    <div class="a">Варианты по частоте: (1) <span class="cy">CSP</span> блокирует inline-исполнение — смотри консоль, там будет прямая ошибка; (2) payload вставлен через <code class="ic">innerHTML</code>, а браузер <span class="hl">не исполняет теги script, вставленные таким способом</span> — нужен вектор с обработчиком события, например <code class="ic">&lt;img src=x onerror=alert(1)&gt;</code>; (3) скрипт попал в контекст, где не исполняется (внутрь textarea, комментария, атрибута без разрыва кавычки); (4) сработал санитайзер или Trusted Types; (5) неверный контекст экранирования — payload виден в исходнике, но синтаксически не активен.</div>
    <div class="q">— Чем localStorage отличается от cookie с точки зрения безопасности?</div>
    <div class="a">Cookie может быть помечена <code class="ic">HttpOnly</code> — тогда JS её не прочитает, и XSS не украдёт её напрямую. localStorage такой защиты не имеет вовсе: любой скрипт читает всё. Зато cookie автоматически отправляется браузером на сервер при каждом запросе — включая запросы, инициированные чужим сайтом, отсюда CSRF. localStorage не отправляется никогда, токен из него надо класть в заголовок вручную, поэтому CSRF там не работает. Компромисс: <span class="hl">cookie уязвима к CSRF, но защитима от XSS; localStorage наоборот</span>.</div>
  </div>

  <h2 class="sect">референсы модуля</h2>
  <a class="ref" href="https://developer.chrome.com/blog/inside-browser-part1" target="_blank" rel="noopener"><span class="r-t">Chrome — Inside look at modern web browser (серия из 4 частей)</span><span class="r-d">лучшее объяснение архитектуры процессов и конвейера от команды Chrome. Читается за вечер.</span><span class="r-u">developer.chrome.com/blog/inside-browser-part1</span></a>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path" target="_blank" rel="noopener"><span class="r-t">MDN — Critical rendering path</span><span class="r-d">DOM, CSSOM, render tree, layout, paint — формально и по шагам.</span><span class="r-u">developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path</span></a>
  <a class="ref" href="https://www.chromium.org/Home/chromium-security/site-isolation/" target="_blank" rel="noopener"><span class="r-t">Chromium — Site Isolation</span><span class="r-d">первоисточник: зачем сделали, от чего защищает, что такое CORB.</span><span class="r-u">chromium.org/Home/chromium-security/site-isolation</span></a>
  <a class="ref ps" href="https://portswigger.net/web-security/dom-based" target="_blank" rel="noopener"><span class="r-t">PortSwigger — DOM-based vulnerabilities</span><span class="r-d">полный список sources и sinks. Держи под рукой при анализе фронтенда.</span><span class="r-u">portswigger.net/web-security/dom-based</span></a>

  <h2 class="sect">checkpoint: секция CLIENT</h2>
  <p class="tx">Проверь, что осталось в голове после HTML/CSS/JS и внутренностей браузера.</p>
  <div id="quiz-client"></div>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('browser');go('arch')">[✓] завершить секцию → Web 1 → 2 → сегодня</button>
  </div>
</section>`;
