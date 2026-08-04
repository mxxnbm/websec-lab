/* ---------- m04 · URL / ORIGIN / SITE ---------- */
const V_URL = `
<section class="view" id="view-url">
  <div class="eyebrow">basics · модуль 04 · источники: RFC 3986 · RFC 6454 · WHATWG</div>
  <h1 class="vtitle">URL, <span class="accent">origin</span> и site</h1>
  <p class="vlede">Кажется, что адрес страницы — самая простая вещь в вебе. На деле URL — источник огромного количества уязвимостей, а понятия <span class="cy">origin</span> и <span class="cy">site</span> — фундамент всей модели безопасности браузера. Если ты не различаешь эти два слова, секцию про Same-Origin Policy и CORS понять не получится. Разберём аккуратно.</p>

  <h2 class="sect">анатомия URL</h2>
  <p class="tx">Синтаксис задан <span class="hl">RFC 3986</span>, а для браузеров живой стандарт — <span class="hl">WHATWG URL Standard</span>. Полная форма выглядит так:</p>

  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>url-anatomy.live · кликай части адреса</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Кликай по компонентам URL — увидишь, что каждый значит, отправляется ли он на сервер и где тут AppSec-угол:</p>
      <div id="urlLab"></div>
    </div>
  </div>

  <div class="card acc-r">
    <div class="card-t">⚡ факт, который спрашивают: fragment не уходит на сервер</div>
    <p class="tx" style="margin:0">Всё, что после <code class="ic">#</code>, браузер <span class="hl">не отправляет в HTTP-запросе</span>. Fragment обрабатывается клиентом уже после получения ресурса. Следствия для AppSec огромные: во-первых, полезная нагрузка в фрагменте <span class="rd">не попадёт в логи сервера и не будет видна WAF</span> — так прячут payload при DOM-based XSS. Во-вторых, OAuth implicit flow клал токен именно во фрагмент, чтобы он не утёк на сервер и в логи. В-третьих, при поиске DOM XSS источником данных часто является <code class="ic">location.hash</code> — сервер о такой атаке не узнает вообще ничего.</p>
  </div>

  <h2 class="sect">percent-encoding</h2>
  <p class="tx">В URL разрешён ограниченный набор символов. Всё остальное кодируется как <code class="ic">%</code> плюс два шестнадцатеричных знака: пробел — <code class="ic">%20</code>, слэш — <code class="ic">%2F</code>, знак процента — <code class="ic">%25</code>.</p>
  <div class="sec-box">
    <div class="sb-t">SEC ▸ двойное кодирование и рассинхрон парсеров</div>
    <p class="tx">Классический обход фильтров: фильтр видит <code class="ic">%252e%252e%252f</code>, декодирует один раз и получает <code class="ic">%2e%2e%2f</code> — не похоже на <code class="ic">../</code>, пропускает. А следующий компонент декодирует ещё раз и получает настоящий <code class="ic">../</code>. Это <span class="rd">double encoding</span>, и работает он ровно потому, что данные проходят через несколько парсеров, каждый из которых декодирует по разу.</p>
    <p class="tx" style="margin-bottom:0">Общий принцип, который надо унести: <span class="hl">там, где одну строку разбирают два разных парсера, живут уязвимости</span>. Это относится и к URL, и к HTTP-заголовкам (request smuggling), и к XML, и к JSON. Знаменитая работа Orange Tsai «A New Era of SSRF» — целиком про то, как парсеры URL в разных языках расходятся в трактовке одной строки.</p>
  </div>

  <h2 class="sect">origin — самое важное слово в браузерной безопасности</h2>
  <p class="tx">Origin определён в <span class="hl">RFC 6454</span> и состоит ровно из трёх частей:</p>

  <div class="ascii">        <span class="h">ORIGIN = схема + хост + порт</span>

        https  ://  app.example.com  :443
        <span class="g">└─┬─┘</span>       <span class="g">└──────┬──────┘</span>  <span class="g">└┬─┘</span>
        <span class="g">схема</span>          <span class="g">хост</span>        <span class="g">порт</span>

   Два URL — один origin, только если совпадают ВСЕ ТРИ.

   <span class="f">база:</span> https://app.example.com/page
   ─────────────────────────────────────────────────────────
   https://app.example.com/other       <span class="g">SAME    </span> путь не важен
   https://app.example.com/?q=1#x      <span class="g">SAME    </span> query и хеш не важны
   <span class="r">http</span>://app.example.com/page        <span class="r">CROSS   </span> другая схема
   https://<span class="r">api</span>.example.com/page        <span class="r">CROSS   </span> другой хост
   https://app.example.com<span class="r">:8443</span>/page    <span class="r">CROSS   </span> другой порт
   https://<span class="r">example.com</span>/page            <span class="r">CROSS   </span> хост != поддомен</div>

  <p class="tx">Обрати внимание на две ловушки. Первая: <span class="hl">поддомен — это другой origin</span>, никакого «родства» браузер не признаёт. Вторая: <span class="hl">порт входит в origin</span>, поэтому <code class="ic">:443</code> и <code class="ic">:8443</code> — разные origin, даже если это одна машина.</p>

  <h2 class="sect">site — более грубое сравнение</h2>
  <p class="tx">Рядом живёт второе понятие, и его постоянно путают с origin. <span class="cy">Site</span> — это <span class="hl">схема + eTLD+1</span>, то есть «регистрируемый домен» плюс схема. Поддомены и порт игнорируются.</p>
  <p class="tx">Что такое eTLD+1: «effective top-level domain плюс один уровень». Для <code class="ic">a.b.example.com</code> это <code class="ic">example.com</code>. Но для <code class="ic">myapp.github.io</code> это <span class="hl">не <code class="ic">github.io</code></span>, а <code class="ic">myapp.github.io</code> — потому что <code class="ic">github.io</code> внесён в <span class="cy">Public Suffix List</span> как эффективный TLD. Иначе один пользователь GitHub Pages мог бы ставить cookies всем остальным.</p>

  <div class="twrap"><table class="t">
    <tr><th>Пара URL</th><th>same-origin?</th><th>same-site?</th></tr>
    <tr><td><code class="ic">https://app.example.com</code> и <code class="ic">https://app.example.com/x</code></td><td class="gs">да</td><td class="gs">да</td></tr>
    <tr><td><code class="ic">https://app.example.com</code> и <code class="ic">https://api.example.com</code></td><td class="rd">нет</td><td class="gs">да</td></tr>
    <tr><td><code class="ic">https://app.example.com</code> и <code class="ic">https://app.example.com:8443</code></td><td class="rd">нет</td><td class="gs">да</td></tr>
    <tr><td><code class="ic">https://app.example.com</code> и <code class="ic">http://app.example.com</code></td><td class="rd">нет</td><td class="rd">нет*</td></tr>
    <tr><td><code class="ic">https://alice.github.io</code> и <code class="ic">https://bob.github.io</code></td><td class="rd">нет</td><td class="rd">нет (PSL)</td></tr>
    <tr><td><code class="ic">https://example.com</code> и <code class="ic">https://evil.com</code></td><td class="rd">нет</td><td class="rd">нет</td></tr>
  </table></div>
  <p class="tx" style="font-size:12px">* современные браузеры используют «schemeful same-site»: схема учитывается. Раньше <code class="ic">http</code> и <code class="ic">https</code> одного домена считались same-site.</p>

  <div class="card acc-a">
    <div class="card-t">⚡ зачем два разных понятия</div>
    <p class="tx" style="margin:0">Разные механизмы используют разную строгость. <span class="cy">Same-Origin Policy</span> оперирует <span class="hl">origin</span> — строгое сравнение по трём компонентам. <span class="cy">SameSite-cookies</span> оперируют <span class="hl">site</span> — мягкое сравнение по регистрируемому домену. Отсюда прямое следствие для безопасности: <span class="rd">скомпрометированный поддомен — это чужой origin, но свой site</span>. Он не сможет прочитать DOM основного сайта (SOP не даст), но SameSite-cookies при запросах с него отправятся как ни в чём не бывало. Это ровно то место, где падает защита от CSRF, — и это любимый вопрос интервьюеров.</p>
  </div>

  <div class="ask-box">
    <div class="sb-t">на собесе спросят</div>
    <div class="q">— Чем origin отличается от site?</div>
    <div class="a">Origin — схема + хост + порт, строгое сравнение (RFC 6454), используется в Same-Origin Policy и CORS. Site — схема + eTLD+1, поддомены и порт игнорируются, используется в SameSite-cookies и Fetch Metadata. <code class="ic">api.example.com</code> и <code class="ic">app.example.com</code> — <span class="rd">разные origin</span>, но <span class="gs">один site</span>.</div>
    <div class="q">— Есть XSS на поддомене <code class="ic">blog.example.com</code>. Насколько это опасно для основного приложения на <code class="ic">app.example.com</code>?</div>
    <div class="a">Очень опасно, хотя это разные origin. Что даёт атакующему поддомен: (1) cookies, выставленные с <code class="ic">Domain=example.com</code>, доступны и на поддомене — то есть сессия утекает; (2) он может <span class="hl">выставить</span> cookies на родительский домен и подменить сессионную (cookie tossing) — если нет префикса <code class="ic">__Host-</code>; (3) запросы с поддомена — same-site, поэтому SameSite=Lax и Strict их пропустят и CSRF-защита на cookies не сработает; (4) поддомен часто оказывается в CORS-allowlist основного API; (5) фишинг на легитимном домене компании. Правильный ответ на собесе звучит так: «origin разный, но site общий, и почти все механизмы, завязанные на site, ломаются».</div>
    <div class="q">— Что такое Public Suffix List и зачем он нужен?</div>
    <div class="a">Публичный список доменных суффиксов, под которыми регистрируются независимые владельцы: <code class="ic">com</code>, <code class="ic">co.uk</code>, <code class="ic">github.io</code>, <code class="ic">vercel.app</code>. Браузеры используют его, чтобы вычислить eTLD+1 и не дать одному сайту ставить cookies или считаться same-site с чужим. Без него любой пользователь <code class="ic">github.io</code> мог бы атаковать всех соседей.</div>
  </div>

  <h2 class="sect">референсы модуля</h2>
  <a class="ref rfc" href="https://datatracker.ietf.org/doc/html/rfc3986" target="_blank" rel="noopener"><span class="r-t">RFC 3986 — URI Generic Syntax</span><span class="r-d">каноническая грамматика URL. Раздел 3 — ровно та схема, что разобрана выше.</span><span class="r-u">datatracker.ietf.org/doc/html/rfc3986</span></a>
  <a class="ref rfc" href="https://datatracker.ietf.org/doc/html/rfc6454" target="_blank" rel="noopener"><span class="r-t">RFC 6454 — The Web Origin Concept</span><span class="r-d">формальное определение origin. Короткий и очень полезный документ.</span><span class="r-u">datatracker.ietf.org/doc/html/rfc6454</span></a>
  <a class="ref" href="https://url.spec.whatwg.org/" target="_blank" rel="noopener"><span class="r-t">WHATWG URL Standard</span><span class="r-d">то, как URL реально парсят браузеры (отличается от RFC в деталях — и на этих отличиях живут баги).</span><span class="r-u">url.spec.whatwg.org</span></a>
  <a class="ref" href="https://web.dev/articles/same-site-same-origin" target="_blank" rel="noopener"><span class="r-t">web.dev — Understanding same-site and same-origin</span><span class="r-d">лучший разбор разницы двух понятий, с таблицами и schemeful same-site.</span><span class="r-u">web.dev/articles/same-site-same-origin</span></a>
  <a class="ref" href="https://publicsuffix.org/" target="_blank" rel="noopener"><span class="r-t">Public Suffix List</span><span class="r-d">тот самый список. Загляни — полезно увидеть, что там тысячи записей.</span><span class="r-u">publicsuffix.org</span></a>

  <h2 class="sect">checkpoint: секция BASICS</h2>
  <p class="tx">Четыре модуля позади: веб как сервис поверх интернета, слои и DNS, TLS, URL и origin. Проверь, что осело — отвечай, не подглядывая. Ошибки тут полезнее правильных ответов: они показывают, куда вернуться.</p>
  <div id="quiz-basics"></div>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('url');go('http')">[✓] завершить секцию → HTTP</button>
  </div>
</section>`;
