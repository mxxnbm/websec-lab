/* ---------- m02 · NETWORK / IP / DNS ---------- */
const V_NET = `
<section class="view" id="view-net">
  <div class="eyebrow">basics · модуль 02 · источники: MDN · Cloudflare · RFC 1035</div>
  <h1 class="vtitle">Сеть, <span class="accent">IP</span> и DNS</h1>
  <p class="vlede">Ты ввёл <code class="ic">example.com</code> и нажал Enter. Дальше происходит цепочка из нескольких этапов, и большинство людей не знает про них ничего. Для AppSec это база: половина «магии» в отчётах пентестеров — просто понимание того, что происходит на этих слоях. Пройдём путь целиком, потом разберём каждый узел.</p>

  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>request-journey.live · от URL до страницы, по слоям</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Жми «шаг ▸» — пройди весь путь запроса от ввода адреса до отрисовки страницы. Каждый слой раскрывается: что происходит и где точка для AppSec:</p>
      <div id="netLab"></div>
    </div>
  </div>

  <h2 class="sect">слои: почему сеть разбита на уровни</h2>
  <p class="tx">Сеть построена как стопка слоёв. Каждый слой решает одну задачу и не лезет в чужую: нижний не знает, что за данные он везёт, верхний не знает, по какому кабелю они поедут. Это позволяет менять Wi-Fi на 5G, не переписывая браузер.</p>
  <p class="tx">Есть две модели описания: академическая <span class="hl">OSI</span> (7 уровней) и практическая <span class="hl">TCP/IP</span> (4 уровня). В реальной жизни работает TCP/IP, а OSI держат в голове как словарь — когда говорят «атака на L7», имеют в виду именно нумерацию OSI.</p>

  <div class="svgbox">
    <svg viewBox="0 0 700 330" role="img" aria-label="Соответствие моделей OSI и TCP/IP">
      <text x="160" y="22" font-size="12" fill="#38bdf8" text-anchor="middle">OSI (7 уровней)</text>
      <text x="500" y="22" font-size="12" fill="#00e676" text-anchor="middle">TCP/IP (4 уровня)</text>
      <g font-size="11.5">
        <rect x="40" y="36" width="240" height="32" rx="4" fill="#0f1620" stroke="#38bdf8" stroke-opacity=".4"/>
        <text x="52" y="57" fill="#cdd9e5">L7 Application — HTTP, DNS</text>
        <rect x="40" y="72" width="240" height="32" rx="4" fill="#0f1620" stroke="#38bdf8" stroke-opacity=".4"/>
        <text x="52" y="93" fill="#cdd9e5">L6 Presentation — TLS*, кодировки</text>
        <rect x="40" y="108" width="240" height="32" rx="4" fill="#0f1620" stroke="#38bdf8" stroke-opacity=".4"/>
        <text x="52" y="129" fill="#cdd9e5">L5 Session — сессии</text>
        <rect x="40" y="144" width="240" height="32" rx="4" fill="#0f1620" stroke="#ffb020" stroke-opacity=".5"/>
        <text x="52" y="165" fill="#cdd9e5">L4 Transport — TCP, UDP</text>
        <rect x="40" y="180" width="240" height="32" rx="4" fill="#0f1620" stroke="#c792ea" stroke-opacity=".5"/>
        <text x="52" y="201" fill="#cdd9e5">L3 Network — IP, ICMP</text>
        <rect x="40" y="216" width="240" height="32" rx="4" fill="#0f1620" stroke="#5c9eff" stroke-opacity=".5"/>
        <text x="52" y="237" fill="#cdd9e5">L2 Data Link — Ethernet, MAC</text>
        <rect x="40" y="252" width="240" height="32" rx="4" fill="#0f1620" stroke="#5c9eff" stroke-opacity=".5"/>
        <text x="52" y="273" fill="#cdd9e5">L1 Physical — кабель, радио</text>
      </g>
      <g stroke="#4a5a6e" stroke-width="1" stroke-dasharray="3 3">
        <line x1="284" y1="70" x2="396" y2="70"/><line x1="284" y1="160" x2="396" y2="160"/>
        <line x1="284" y1="196" x2="396" y2="196"/><line x1="284" y1="250" x2="396" y2="250"/>
      </g>
      <g font-size="11.5">
        <rect x="400" y="36" width="260" height="68" rx="4" fill="#0f1620" stroke="#00e676" stroke-opacity=".45"/>
        <text x="412" y="63" fill="#cdd9e5">Application</text>
        <text x="412" y="83" fill="#7d8ea3" font-size="10.5">HTTP · DNS · TLS · SMTP</text>
        <rect x="400" y="108" width="260" height="68" rx="4" fill="#0f1620" stroke="#ffb020" stroke-opacity=".5"/>
        <text x="412" y="135" fill="#cdd9e5">Transport</text>
        <text x="412" y="155" fill="#7d8ea3" font-size="10.5">TCP · UDP · порты</text>
        <rect x="400" y="180" width="260" height="50" rx="4" fill="#0f1620" stroke="#c792ea" stroke-opacity=".5"/>
        <text x="412" y="200" fill="#cdd9e5">Internet</text>
        <text x="412" y="219" fill="#7d8ea3" font-size="10.5">IP · маршрутизация</text>
        <rect x="400" y="234" width="260" height="50" rx="4" fill="#0f1620" stroke="#5c9eff" stroke-opacity=".5"/>
        <text x="412" y="254" fill="#cdd9e5">Network Access (Link)</text>
        <text x="412" y="273" fill="#7d8ea3" font-size="10.5">Ethernet · Wi-Fi · MAC</text>
      </g>
      <text x="350" y="308" font-size="10" fill="#4a5a6e" text-anchor="middle">* TLS формально «между» L4 и L7 — в OSI его условно относят к L6, в TCP/IP он часть Application</text>
    </svg>
    <div class="svgcap">Мнемоника снизу вверх: <span class="cy">Please Do Not Throw Sausage Pizza Away</span> (Physical, Data link, Network, Transport, Session, Presentation, Application).</div>
  </div>

  <h2 class="sect">адреса: IP, порт, MAC</h2>
  <div class="kv">
    <div class="kv-row"><div class="kv-k">IP-адрес</div><div class="kv-v">Адрес устройства в сети. <span class="cy">IPv4</span> — 32 бита, вид <code class="ic">93.184.216.34</code>, адресов ~4.3 млрд и они кончились. <span class="cy">IPv6</span> — 128 бит, вид <code class="ic">2606:2800:220:1:248:1893:25c8:1946</code>, придуман именно потому, что IPv4 исчерпался.</div></div>
    <div class="kv-row"><div class="kv-k">Порт</div><div class="kv-v">Номер «двери» на конкретном устройстве. IP приводит тебя к дому, порт — к нужной квартире. Порты ниже 1024 закреплены за протоколами: <span class="am">80</span> HTTP, <span class="am">443</span> HTTPS, <span class="am">53</span> DNS, <span class="am">22</span> SSH, <span class="am">25</span> SMTP.</div></div>
    <div class="kv-row"><div class="kv-k">MAC-адрес</div><div class="kv-v">Аппаратный адрес сетевой карты, работает только внутри одного сегмента сети (твоя Wi-Fi-сеть). Через интернет не передаётся — за пределы роутера не выходит.</div></div>
    <div class="kv-row"><div class="kv-k">Сокет</div><div class="kv-v">Пара <code class="ic">IP:порт</code>. Именно к ней подключается клиент. <code class="ic">93.184.216.34:443</code> — конкретный HTTPS-сервер.</div></div>
  </div>

  <h2 class="sect">DNS — адресная книга интернета</h2>
  <p class="tx">Компьютеры общаются по IP-адресам, люди помнят имена. DNS (Domain Name System) переводит одно в другое. Работает по <span class="hl">порту 53</span>, базовая спецификация — RFC 1035 (1987 год, до сих пор актуальна).</p>
  <p class="tx">Главное, что надо понять: <span class="hl">резолвинг — это не один запрос, а цепочка</span>, и на каждом её звене есть кэш. Именно кэши делают DNS быстрым и именно они делают его атакуемым.</p>

  <div class="svgbox">
    <svg viewBox="0 0 740 300" role="img" aria-label="Цепочка DNS-резолвинга">
      <text x="370" y="20" font-size="12" fill="#38bdf8" text-anchor="middle">ПУТЬ DNS-ЗАПРОСА ДЛЯ example.com</text>
      <g font-size="10.5">
        <rect x="20" y="42" width="120" height="52" rx="6" fill="#0f1620" stroke="#38bdf8" stroke-opacity=".45"/>
        <text x="80" y="64" fill="#cdd9e5" text-anchor="middle">Браузер</text>
        <text x="80" y="80" fill="#4a5a6e" text-anchor="middle">свой кэш</text>
        <rect x="20" y="118" width="120" height="52" rx="6" fill="#0f1620" stroke="#38bdf8" stroke-opacity=".45"/>
        <text x="80" y="140" fill="#cdd9e5" text-anchor="middle">ОС</text>
        <text x="80" y="156" fill="#4a5a6e" text-anchor="middle">stub resolver</text>
        <rect x="20" y="194" width="120" height="62" rx="6" fill="#0f1620" stroke="#ffb020" stroke-opacity=".55"/>
        <text x="80" y="216" fill="#ffb020" text-anchor="middle">Recursive</text>
        <text x="80" y="231" fill="#ffb020" text-anchor="middle">resolver</text>
        <text x="80" y="247" fill="#4a5a6e" text-anchor="middle">провайдер / 8.8.8.8</text>
      </g>
      <g stroke="#0ea5c4" stroke-width="1.4" fill="none" marker-end="url(#ar)">
        <line x1="80" y1="96" x2="80" y2="114"/><line x1="80" y1="172" x2="80" y2="190"/>
      </g>
      <defs><marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#0ea5c4"/></marker></defs>
      <g font-size="10.5">
        <rect x="230" y="52" width="140" height="52" rx="6" fill="#0f1620" stroke="#c792ea" stroke-opacity=".5"/>
        <text x="300" y="74" fill="#c792ea" text-anchor="middle">Root (.)</text>
        <text x="300" y="90" fill="#4a5a6e" text-anchor="middle">«иди к .com»</text>
        <rect x="230" y="124" width="140" height="52" rx="6" fill="#0f1620" stroke="#c792ea" stroke-opacity=".5"/>
        <text x="300" y="146" fill="#c792ea" text-anchor="middle">TLD (.com)</text>
        <text x="300" y="162" fill="#4a5a6e" text-anchor="middle">«иди к ns1.example»</text>
        <rect x="230" y="196" width="140" height="52" rx="6" fill="#0f1620" stroke="#00e676" stroke-opacity=".5"/>
        <text x="300" y="218" fill="#00e676" text-anchor="middle">Authoritative</text>
        <text x="300" y="234" fill="#4a5a6e" text-anchor="middle">«вот A-запись»</text>
      </g>
      <g stroke="#7d8ea3" stroke-width="1.2" fill="none" stroke-dasharray="4 3">
        <path d="M144,214 L200,80 L226,80"/><path d="M144,220 L200,150 L226,150"/><path d="M144,226 L200,222 L226,222"/>
      </g>
      <g font-size="10.5">
        <rect x="470" y="124" width="150" height="66" rx="6" fill="#0f1620" stroke="#00e676" stroke-opacity=".5"/>
        <text x="545" y="150" fill="#00e676" text-anchor="middle">93.184.216.34</text>
        <text x="545" y="168" fill="#7d8ea3" text-anchor="middle">A-запись + TTL</text>
        <text x="545" y="182" fill="#4a5a6e" text-anchor="middle">кэшируется на всех</text>
        <text x="545" y="182" fill="#4a5a6e" text-anchor="middle"> </text>
      </g>
      <line x1="374" y1="222" x2="466" y2="180" stroke="#00e676" stroke-width="1.4" marker-end="url(#ag)"/>
      <defs><marker id="ag" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#00e676"/></marker></defs>
      <text x="370" y="282" font-size="10" fill="#4a5a6e" text-anchor="middle">Кэш есть на КАЖДОМ шаге. Если ответ нашёлся в кэше браузера — дальше вообще ничего не поедет.</text>
    </svg>
    <div class="svgcap">Проверить руками: <code class="ic">nslookup example.com</code> или <code class="ic">dig example.com +trace</code> — второй покажет всю цепочку по шагам.</div>
  </div>

  <h2 class="sect">типы DNS-записей</h2>
  <div class="twrap"><table class="t">
    <tr><th>Запись</th><th>Что содержит</th><th>Зачем AppSec</th></tr>
    <tr><td class="cy">A</td><td>IPv4-адрес домена</td><td>основная цель при разведке — куда реально ведёт домен</td></tr>
    <tr><td class="cy">AAAA</td><td>IPv6-адрес</td><td>часто забывают закрыть фаерволом, в отличие от IPv4</td></tr>
    <tr><td class="cy">CNAME</td><td>алиас на другое имя (не IP)</td><td>висящий CNAME на удалённый сервис = <span class="rd">subdomain takeover</span></td></tr>
    <tr><td class="cy">MX</td><td>почтовые серверы домена</td><td>карта почтовой инфраструктуры</td></tr>
    <tr><td class="cy">TXT</td><td>произвольный текст: SPF, DKIM, DMARC, верификации</td><td>утечки: там часто видно, какими SaaS пользуется компания</td></tr>
    <tr><td class="cy">NS</td><td>авторитетные серверы зоны</td><td>кто реально управляет доменом</td></tr>
  </table></div>
  <p class="tx"><span class="hl">TTL</span> (time to live) — сколько секунд запись живёт в кэше. Низкий TTL = быстрое переключение, но больше запросов. Высокий TTL = быстро, но изменения расходятся медленно.</p>

  <div class="sec-box">
    <div class="sb-t">SEC ▸ DNS как поверхность атаки</div>
    <p class="tx"><span class="hl">DNS spoofing / cache poisoning</span> — атакующий подсовывает резолверу поддельный ответ, и жертва идёт на его сервер, видя правильное имя в адресной строке. Смягчается DNSSEC и тем, что TLS-сертификат подделать сложнее.</p>
    <p class="tx"><span class="hl">Subdomain takeover</span> — у компании остался CNAME <code class="ic">old.example.com → myapp.herokuapp.com</code>, а сам сервис давно удалён. Атакующий регистрирует освободившееся имя у провайдера и получает поддомен жертвы: значит, и её cookies (если <code class="ic">Domain=example.com</code>), и доверие CORS-whitelist, и обход SameSite. Одна из самых частых находок в bug bounty.</p>
    <p class="tx"><span class="hl">DNS rebinding</span> — домен атакующего сначала резолвится в его IP, а через секунды — в <code class="ic">127.0.0.1</code>. Браузер считает это тем же origin и даёт скрипту достучаться до сервисов на localhost жертвы. Отдельная лекция в Stanford CS253.</p>
    <p class="tx" style="margin-bottom:0"><span class="hl">DNS как канал утечки</span> — даже при закрытом исходящем HTTP DNS-запросы обычно разрешены. Поэтому blind-уязвимости (SSRF, XXE, blind XSS) детектят именно по DNS-запросу на подконтрольный домен — так работает Burp Collaborator.</p>
  </div>

  <h2 class="sect">транспорт: TCP, UDP, QUIC</h2>
  <p class="tx">DNS дал IP. Теперь надо установить соединение. Тут два основных варианта.</p>
  <div class="grid2">
    <div class="card acc-c">
      <div class="card-t">TCP — надёжно, но с рукопожатием</div>
      <p class="tx" style="font-size:12px">Перед передачей данных стороны делают <span class="hl">three-way handshake</span>: клиент шлёт <span class="cy">SYN</span>, сервер отвечает <span class="cy">SYN-ACK</span>, клиент подтверждает <span class="cy">ACK</span>. Только после этого летят данные. TCP гарантирует, что всё дойдёт и в правильном порядке: теряется пакет — переспросит. Цена — задержка на установку и на повторы.</p>
    </div>
    <div class="card acc-a">
      <div class="card-t">UDP — быстро, но без гарантий</div>
      <p class="tx" style="font-size:12px">Никакого рукопожатия, никаких подтверждений. Отправил и забыл. Что-то потерялось — никто не узнает. Используется там, где скорость важнее целостности: голос, видео, игры. И там, где сообщение маленькое и переспросить дешевле — например, DNS.</p>
    </div>
  </div>
  <div class="ascii"><span class="h">TCP THREE-WAY HANDSHAKE</span>

  клиент                                        сервер
    │                                              │
    │ ──────────── <span class="g">SYN</span> (хочу соединиться) ────────▶ │
    │                                              │
    │ ◀────── <span class="g">SYN-ACK</span> (ок, я тоже готов) ───────── │
    │                                              │
    │ ──────────── <span class="g">ACK</span> (подтверждаю) ────────────▶ │
    │                                              │
    │ ══════ <span class="a">соединение установлено</span> ══════════════ │
    │ ─────── HTTP-запрос (наконец-то!) ──────────▶ │

  <span class="f">Три пакета туда-обратно ДО того, как уйдёт хоть байт полезных
  данных. Плюс ещё круги на TLS. Отсюда вся борьба за скорость
  в HTTP/2 и HTTP/3.</span></div>

  <div class="card acc-p">
    <div class="card-t">QUIC — третий вариант</div>
    <p class="tx" style="margin:0">QUIC (RFC 9000, 2021) — транспортный протокол поверх UDP, который сам реализует надёжность, потоки и шифрование. Зачем: он совмещает установку соединения и TLS-рукопожатие, поэтому стартует быстрее TCP+TLS, и умеет переживать смену сети (перешёл с Wi-Fi на LTE — соединение не рвётся). <span class="hl">HTTP/3 — это HTTP поверх QUIC</span>, вернёмся к нему в модуле 06.</p>
  </div>

  <div class="ask-box">
    <div class="sb-t">на собесе спросят</div>
    <div class="q">— Что происходит, когда ты вводишь URL в браузер и жмёшь Enter?</div>
    <div class="a">Классика классик, спрашивают почти везде. Скелет ответа: разбор URL → поиск в кэшах DNS (браузер, ОС, резолвер) → рекурсивный резолвинг через root, TLD, authoritative → получили IP → TCP three-way handshake на порт 443 → TLS-рукопожатие, проверка сертификата → HTTP-запрос → ответ → парсинг HTML, построение DOM и CSSOM → загрузка подресурсов → layout, paint, composite. Отвечать надо именно слоями, а не «браузер идёт на сервер». Интервьюер будет останавливать и копать вглубь на любом шаге — это тест на глубину, а не на скорость.</div>
    <div class="q">— Почему DNS работает по UDP, а не по TCP?</div>
    <div class="a">Запрос и ответ обычно помещаются в один небольшой пакет, а установка TCP-соединения стоит трёх пакетов ещё до передачи данных. При миллиардах запросов в секунду это несопоставимые накладные расходы. Если ответ не влезает — DNS переключается на TCP (и порт 53 слушается по обоим протоколам). Современные варианты — <span class="cy">DoH</span> (DNS over HTTPS, RFC 8484) и <span class="cy">DoT</span> (DNS over TLS, RFC 7858, порт 853) — шифруют запросы, чтобы провайдер не видел, куда ты ходишь.</div>
  </div>

  <h2 class="sect">референсы модуля</h2>
  <a class="ref" href="https://www.cloudflare.com/learning/dns/what-is-dns/" target="_blank" rel="noopener"><span class="r-t">Cloudflare — What is DNS</span><span class="r-d">лучшее визуальное объяснение цепочки резолвинга: browser cache → resolver → root → TLD → authoritative.</span><span class="r-u">cloudflare.com/learning/dns/what-is-dns</span></a>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Glossary/TCP_handshake" target="_blank" rel="noopener"><span class="r-t">MDN — TCP handshake</span><span class="r-d">SYN / SYN-ACK / ACK и почему закрытие соединения занимает четыре шага.</span><span class="r-u">developer.mozilla.org/en-US/docs/Glossary/TCP_handshake</span></a>
  <a class="ref rfc" href="https://www.rfc-editor.org/rfc/rfc1035" target="_blank" rel="noopener"><span class="r-t">RFC 1035 — Domain Names, Implementation</span><span class="r-d">первоисточник по DNS. 1987 год, действует до сих пор.</span><span class="r-u">rfc-editor.org/rfc/rfc1035</span></a>
  <a class="ref rfc" href="https://www.rfc-editor.org/rfc/rfc9000.html" target="_blank" rel="noopener"><span class="r-t">RFC 9000 — QUIC</span><span class="r-d">транспорт под HTTP/3. Читать необязательно целиком, но знать, что это RFC 9000, полезно.</span><span class="r-u">rfc-editor.org/rfc/rfc9000.html</span></a>
  <a class="ref ps" href="https://portswigger.net/web-security/ssrf" target="_blank" rel="noopener"><span class="r-t">PortSwigger — SSRF</span><span class="r-d">сюда упирается всё, что ты узнал про DNS и внутренние адреса. Вернёшься после курса.</span><span class="r-u">portswigger.net/web-security/ssrf</span></a>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('net');go('tls')">[✓] завершить → HTTPS и TLS</button>
  </div>
</section>`;
