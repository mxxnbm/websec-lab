/* ---------- m03 · HTTPS / TLS ---------- */
const V_TLS = `
<section class="view" id="view-tls">
  <div class="eyebrow">basics · модуль 03 · источники: RFC 8446 · RFC 6797 · Cloudflare</div>
  <h1 class="vtitle">HTTPS и <span class="accent">TLS</span></h1>
  <p class="vlede">TCP-соединение установлено — но пока по нему поедет открытый текст, который прочитает любой на пути: провайдер, владелец Wi-Fi в кафе, скомпрометированный роутер. HTTPS — это тот же HTTP, завёрнутый в TLS. В этом модуле разберём, что именно даёт TLS, как выглядит рукопожатие, что такое сертификат и почему вопрос «в чём разница SSL и TLS» на собеседовании — проверка, а не придирка.</p>

  <h2 class="sect">что даёт TLS — три вещи, не одна</h2>
  <div class="grid3">
    <div class="card acc-c"><div class="card-t">1 · Конфиденциальность</div><p class="tx" style="font-size:12px;margin:0">Трафик зашифрован. Наблюдатель на пути видит, что ты подключился к какому-то IP, примерно сколько данных передал — но не видит ни URL после домена, ни заголовков, ни тела, ни cookies, ни паролей.</p></div>
    <div class="card acc-g"><div class="card-t">2 · Целостность</div><p class="tx" style="font-size:12px;margin:0">Данные нельзя незаметно изменить в пути. Каждое сообщение подписано кодом аутентификации: подмена хотя бы бита ломает проверку, и соединение рвётся.</p></div>
    <div class="card acc-a"><div class="card-t">3 · Аутентификация сервера</div><p class="tx" style="font-size:12px;margin:0">Ты убеждаешься, что говоришь именно с <code class="ic">bank.com</code>, а не с тем, кто перехватил трафик. Это делает сертификат. <span class="hl">Самая недооценённая часть</span> — без неё шифрование бесполезно: можно шифровать канал прямо к атакующему.</p></div>
  </div>

  <div class="card acc-r">
    <div class="card-t">⚡ SSL или TLS — как отвечать</div>
    <p class="tx" style="margin:0"><span class="cy">SSL</span> (Secure Sockets Layer) — исторический предшественник, разработан в Netscape в 90-х. Версии SSL 2.0 и SSL 3.0 <span class="rd">сломаны и запрещены к использованию</span> (SSL 3.0 добил POODLE в 2014). <span class="cy">TLS</span> (Transport Layer Security) — его преемник: TLS 1.0 (1999), 1.1, 1.2 (2008), 1.3 (2018, RFC 8446). TLS 1.0 и 1.1 объявлены устаревшими и отключены в браузерах с 2020 года. То есть на 2026 живых версий две: <span class="gs">TLS 1.2 и TLS 1.3</span>. Слово «SSL» осталось в разговорной речи и в названиях («SSL-сертификат»), но технически везде уже TLS. Если на собесе спрашивают разницу — именно это и надо ответить, плюс что «SSL-сертификат» и «TLS-сертификат» — одно и то же.</p>
  </div>

  <h2 class="sect">рукопожатие: как договариваются о ключах</h2>
  <p class="tx">Проблема, которую решает handshake: как двум сторонам, которые никогда не встречались и общаются по прослушиваемому каналу, договориться об общем секретном ключе? Ответ — асимметричная криптография: сервер публикует открытый ключ (в сертификате), стороны обмениваются параметрами и независимо вычисляют один и тот же общий секрет, который наблюдатель вычислить не может.</p>

  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>tls-handshake.live · рукопожатие по шагам</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Пройди TLS 1.3 handshake по шагам — увидишь, что летит в каждом сообщении и где точки для атак:</p>
      <div id="tlsLab"></div>
    </div>
  </div>

  <p class="tx">Главное отличие TLS 1.3 от 1.2, которое стоит запомнить: <span class="hl">TLS 1.3 укладывается в один круг (1-RTT)</span>, а TLS 1.2 требовал двух. Плюс из 1.3 вычистили все слабые алгоритмы: нет RSA key exchange без forward secrecy, нет RC4, нет SHA-1, нет CBC-режимов со старыми проблемами. Список поддерживаемых наборов сократился с сотен до пяти.</p>

  <div class="card acc-a">
    <div class="card-t">0-RTT — скорость ценой риска</div>
    <p class="tx" style="margin:0">TLS 1.3 умеет возобновлять сессию режимом <span class="hl">0-RTT</span>: клиент отправляет данные вместе с самым первым сообщением, не дожидаясь ответа. Быстро, но у этих данных нет forward secrecy и <span class="rd">их можно переиграть (replay)</span> — перехватить и отправить повторно. Поэтому в 0-RTT нельзя класть запросы, меняющие состояние. Спецификация прямо предупреждает об этом; на собеседовании уровня middle+ этот нюанс любят.</p>
  </div>

  <h2 class="sect">сертификаты и цепочка доверия</h2>
  <p class="tx">Сертификат — это файл, который говорит: «открытый ключ такой-то принадлежит домену <code class="ic">example.com</code>», и этот факт подписан удостоверяющим центром (CA, Certificate Authority). Браузер верит подписи, потому что в него зашит список доверенных корневых CA — root store.</p>

  <div class="svgbox">
    <svg viewBox="0 0 700 260" role="img" aria-label="Цепочка доверия сертификатов">
      <text x="350" y="20" font-size="12" fill="#38bdf8" text-anchor="middle">ЦЕПОЧКА ДОВЕРИЯ (CHAIN OF TRUST)</text>
      <g font-size="11">
        <rect x="250" y="38" width="200" height="52" rx="7" fill="#0f1620" stroke="#00e676" stroke-opacity=".55"/>
        <text x="350" y="60" fill="#00e676" text-anchor="middle">ROOT CA</text>
        <text x="350" y="78" fill="#7d8ea3" text-anchor="middle">вшит в браузер / ОС</text>
        <rect x="250" y="118" width="200" height="52" rx="7" fill="#0f1620" stroke="#38bdf8" stroke-opacity=".5"/>
        <text x="350" y="140" fill="#38bdf8" text-anchor="middle">INTERMEDIATE CA</text>
        <text x="350" y="158" fill="#7d8ea3" text-anchor="middle">подписан корнем</text>
        <rect x="250" y="198" width="200" height="52" rx="7" fill="#0f1620" stroke="#ffb020" stroke-opacity=".55"/>
        <text x="350" y="220" fill="#ffb020" text-anchor="middle">LEAF · example.com</text>
        <text x="350" y="238" fill="#7d8ea3" text-anchor="middle">сертификат сайта</text>
      </g>
      <g stroke="#0ea5c4" stroke-width="1.5" marker-end="url(#ar2)">
        <line x1="350" y1="92" x2="350" y2="114"/><line x1="350" y1="172" x2="350" y2="194"/>
      </g>
      <defs><marker id="ar2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#0ea5c4"/></marker></defs>
      <text x="365" y="108" font-size="10" fill="#4a5a6e">подписывает</text>
      <text x="365" y="188" font-size="10" fill="#4a5a6e">подписывает</text>
      <text x="120" y="130" font-size="10.5" fill="#7d8ea3" text-anchor="middle">браузер проверяет</text>
      <text x="120" y="146" font-size="10.5" fill="#7d8ea3" text-anchor="middle">цепочку СНИЗУ ВВЕРХ</text>
      <text x="120" y="162" font-size="10.5" fill="#7d8ea3" text-anchor="middle">до известного корня</text>
      <path d="M180,208 C215,200 215,70 246,62" stroke="#7d8ea3" stroke-width="1.2" fill="none" stroke-dasharray="4 3"/>
      <g font-size="10" fill="#4a5a6e">
        <text x="580" y="60">Что проверяет браузер:</text>
        <text x="580" y="78">· подпись валидна</text>
        <text x="580" y="94">· срок не истёк</text>
        <text x="580" y="110">· домен совпадает (SAN)</text>
        <text x="580" y="126">· не отозван (OCSP/CRL)</text>
        <text x="580" y="142">· корень в доверенных</text>
      </g>
    </svg>
    <div class="svgcap">Замок в адресной строке означает только это: цепочка сошлась и домен совпал. <span class="rd">Он не означает, что сайт не мошеннический</span> — фишинговый домен тоже получит бесплатный сертификат за минуту.</div>
  </div>

  <div class="kv">
    <div class="kv-row"><div class="kv-k">SNI</div><div class="kv-v">Server Name Indication — расширение TLS: клиент сообщает имя нужного сайта уже в первом сообщении (ClientHello). Нужно, потому что на одном IP живут тысячи сайтов, и сервер должен понять, чей сертификат показывать. <span class="am">Важно: в классическом TLS SNI летит открытым текстом</span> — то есть имя домена наблюдатель видит даже по HTTPS. Это чинит расширение Encrypted Client Hello.</div></div>
    <div class="kv-row"><div class="kv-k">SAN</div><div class="kv-v">Subject Alternative Name — поле сертификата со списком доменов, на которые он действителен. Именно его сверяет браузер, а не устаревшее поле Common Name.</div></div>
    <div class="kv-row"><div class="kv-k">Cipher suite</div><div class="kv-v">Набор алгоритмов, о которых договорились стороны: обмен ключами + шифр + хеш. В TLS 1.3 запись короткая, например <code class="ic">TLS_AES_128_GCM_SHA256</code>. Слабые наборы — путь к даунгрейд-атакам.</div></div>
    <div class="kv-row"><div class="kv-k">Forward secrecy</div><div class="kv-v">Свойство: даже если приватный ключ сервера утечёт завтра, <span class="hl">записанный вчера трафик расшифровать нельзя</span>, потому что сеансовые ключи были эфемерными. В TLS 1.3 обязательна всегда.</div></div>
    <div class="kv-row"><div class="kv-k">mTLS</div><div class="kv-v">Mutual TLS — не только клиент проверяет сервер, но и сервер проверяет сертификат клиента. Стандарт де-факто для взаимодействия микросервисов внутри периметра и для zero trust.</div></div>
  </div>

  <h2 class="sect">HSTS — «только по HTTPS, без вариантов»</h2>
  <p class="tx">Проблема: пользователь набирает <code class="ic">example.com</code> без схемы. Браузер идёт по HTTP, сервер отвечает редиректом на HTTPS. Но <span class="hl">этот самый первый запрос летел открытым</span> — и его можно перехватить, не дав редиректу случиться. Атака называется SSL stripping.</p>
  <p class="tx">Решение — заголовок <span class="cy">Strict-Transport-Security</span> (RFC 6797). Сайт говорит браузеру: «следующие N секунд ходи ко мне только по HTTPS, даже если тебя просят иначе».</p>
  <div class="code"><span class="code-label">HTTP response header</span><span class="fn">Strict-Transport-Security</span>: max-age=<span class="op">31536000</span>; includeSubDomains; preload
<span class="cmt">                            └ год    └ и на все поддомены  └ в список браузера</span></div>
  <p class="tx"><code class="ic">preload</code> решает проблему «самого первого визита»: домен попадает в список, вшитый прямо в браузер, и первый запрос уже никогда не пойдёт по HTTP. Внимание: <span class="rd">выход из preload-списка занимает месяцы</span> — включать осознанно.</p>

  <div class="sec-box">
    <div class="sb-t">SEC ▸ где ломается транспорт</div>
    <p class="tx"><span class="hl">MITM / SSL stripping</span> — атакующий между тобой и сервером понижает соединение до HTTP. Лечится HSTS с preload.</p>
    <p class="tx"><span class="hl">Mixed content</span> — HTTPS-страница подгружает скрипт по <code class="ic">http://</code>. Канал считается защищённым, но подгруженный скрипт можно подменить в пути — и он исполнится с полными правами страницы. Браузеры блокируют активный mixed content, но пассивный (картинки) исторически пропускали. Директива CSP <code class="ic">upgrade-insecure-requests</code> переписывает такие ссылки на HTTPS.</p>
    <p class="tx"><span class="hl">Доверие к «замочку»</span> — распространённое заблуждение пользователей (и джунов). Сертификат подтверждает контроль над доменом, а не добросовестность владельца. Подавляющее большинство фишинговых сайтов сегодня на HTTPS.</p>
    <p class="tx" style="margin-bottom:0"><span class="hl">Корпоративный TLS-инспектор</span> — на рабочем ноутбуке часто стоит свой корневой CA, чтобы прокси мог расшифровывать трафик. Именно так работает и Burp Suite: ставит свой CA в доверенные, и HTTPS-трафик становится читаемым. Понимание этого механизма — обязательное условие, чтобы вообще начать пентестить веб.</p>
  </div>

  <div class="ask-box">
    <div class="sb-t">на собесе спросят</div>
    <div class="q">— Что именно скрывает HTTPS, а что видно наблюдателю?</div>
    <div class="a"><span class="gs">Скрыто:</span> путь URL, query-параметры, заголовки, cookies, тело запроса и ответа. <span class="rd">Видно:</span> IP-адрес назначения, порт, объём и тайминг трафика, а также <span class="hl">имя домена в SNI</span> и в DNS-запросе (если не используются DoH и Encrypted Client Hello). То есть «наблюдатель не знает, что ты открыл <code class="ic">bank.com/transfer?to=...</code>, но знает, что ты зашёл на <code class="ic">bank.com</code>».</div>
    <div class="q">— Зачем нужен HSTS, если сервер и так редиректит на HTTPS?</div>
    <div class="a">Потому что редирект приходит <span class="hl">в ответ на уже отправленный открытый запрос</span>. Атакующий в середине перехватывает этот первый HTTP-запрос и просто не даёт редиректу дойти, продолжая общаться с жертвой по HTTP, а с сервером — по HTTPS. HSTS переносит решение на сторону браузера: он не отправляет открытый запрос вообще. Остаётся дыра первого визита — её закрывает preload-список.</div>
    <div class="q">— Что такое forward secrecy и зачем оно?</div>
    <div class="a">Сеансовые ключи генерируются эфемерно на каждое соединение и не выводятся из долговременного приватного ключа сервера. Поэтому утечка приватного ключа <span class="hl">не даёт расшифровать ранее записанный трафик</span>. Актуально против модели «записать сейчас, расшифровать потом». В TLS 1.3 это не опция, а требование.</div>
  </div>

  <h2 class="sect">референсы модуля</h2>
  <a class="ref rfc" href="https://datatracker.ietf.org/doc/html/rfc8446" target="_blank" rel="noopener"><span class="r-t">RFC 8446 — TLS 1.3</span><span class="r-d">первоисточник. Раздел 2 (Protocol Overview) читается легко и показывает handshake целиком.</span><span class="r-u">datatracker.ietf.org/doc/html/rfc8446</span></a>
  <a class="ref rfc" href="https://datatracker.ietf.org/doc/html/rfc6797" target="_blank" rel="noopener"><span class="r-t">RFC 6797 — HSTS</span><span class="r-d">спецификация Strict-Transport-Security и разбор модели угроз, которую он закрывает.</span><span class="r-u">datatracker.ietf.org/doc/html/rfc6797</span></a>
  <a class="ref" href="https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/" target="_blank" rel="noopener"><span class="r-t">Cloudflare — What happens in a TLS handshake</span><span class="r-d">пошаговый разбор с картинками, сравнение 1.2 и 1.3.</span><span class="r-u">cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake</span></a>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Web/Security/Insecure_passwords" target="_blank" rel="noopener"><span class="r-t">MDN — Security на HTTPS и mixed content</span><span class="r-d">почему форма логина по HTTP — это уже уязвимость, а не «недоработка».</span><span class="r-u">developer.mozilla.org/en-US/docs/Web/Security</span></a>
  <a class="ref" href="https://www.ssllabs.com/ssltest/" target="_blank" rel="noopener"><span class="r-t">SSL Labs Server Test</span><span class="r-d">инструмент: прогони любой домен и посмотри его оценку, версии TLS и наборы шифров. Полезно перед собеседованием — потрогать руками.</span><span class="r-u">ssllabs.com/ssltest</span></a>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('tls');go('url')">[✓] завершить → URL, origin и site</button>
  </div>
</section>`;
