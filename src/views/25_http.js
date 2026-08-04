/* ---------- m05 · HTTP ---------- */
const V_HTTP = `
<section class="view" id="view-http">
  <div class="eyebrow">protocol · модуль 05 · источники: RFC 9110 · MDN · PortSwigger</div>
  <h1 class="vtitle"><span class="accent">HTTP</span> — язык веба</h1>
  <p class="vlede">Соединение установлено и зашифровано. Теперь по нему поедут HTTP-сообщения — язык, на котором клиент и сервер договариваются. Для AppSec это <span class="hl">самый важный модуль курса</span>: практически вся веб-безопасность сводится к чтению, изменению и подделке HTTP-запросов. В Burp Suite ты будешь смотреть ровно на то, что здесь разбирается.</p>

  <h2 class="sect">структура сообщения</h2>
  <p class="tx">И запрос, и ответ устроены одинаково: <span class="hl">стартовая строка → заголовки → пустая строка → тело</span>. Различается только первая строка. Пустая строка — не украшение, а разделитель: именно она говорит парсеру «заголовки кончились, дальше тело».</p>

  <div class="ascii"><span class="h">ЗАПРОС</span>                                <span class="h">ОТВЕТ</span>

<span class="g">GET /search?q=xss HTTP/1.1</span>            <span class="g">HTTP/1.1 200 OK</span>
<span class="f">└─┬─┘└────┬────┘ └───┬──┘</span>              <span class="f">└──┬──┘ └┬┘ └┘</span>
<span class="f">метод   target   версия</span>              <span class="f">версия  код  причина</span>

<span class="a">Host: example.com</span>                     <span class="a">Content-Type: text/html</span>
<span class="a">User-Agent: Mozilla/5.0 ...</span>           <span class="a">Content-Length: 1274</span>
<span class="a">Cookie: session=abc123</span>                <span class="a">Set-Cookie: session=xyz; HttpOnly</span>
<span class="a">Accept: text/html</span>                     <span class="a">Cache-Control: no-store</span>
<span class="f">← пустая строка →</span>                     <span class="f">← пустая строка →</span>
<span class="p">(тело: у GET обычно нет)</span>              <span class="p">&lt;!DOCTYPE html&gt;&lt;html&gt;...</span></div>

  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>http-builder.live · собери запрос, посмотри сырой HTTP</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Переключай метод — увидишь, как меняется сырой HTTP-запрос и что вернёт сервер. Ровно это ты видишь в Burp:</p>
      <div id="httpLab"></div>
    </div>
  </div>

  <h2 class="sect">методы: safe, idempotent, cacheable</h2>
  <p class="tx">Метод говорит, какое действие мы просим выполнить. Но за методами закреплены три свойства из RFC 9110, и на собеседовании путают именно их.</p>
  <div class="grid3">
    <div class="card acc-g"><div class="card-t">Safe</div><p class="tx" style="font-size:12px;margin:0">Только читает, ничего не меняет на сервере. Браузеры, поисковые роботы и префетчеры считают, что такие запросы можно слать свободно.</p></div>
    <div class="card acc-c"><div class="card-t">Idempotent</div><p class="tx" style="font-size:12px;margin:0">Повтор запроса даёт тот же результат, что и один вызов. Удалить один и тот же ресурс дважды — второй раз ничего не изменится. Позволяет безопасно ретраить при сбое сети.</p></div>
    <div class="card acc-a"><div class="card-t">Cacheable</div><p class="tx" style="font-size:12px;margin:0">Ответ можно сохранить и переиспользовать. Это делают браузер, прокси и CDN.</p></div>
  </div>

  <div class="twrap"><table class="t">
    <tr><th>Метод</th><th>Что делает</th><th>Safe</th><th>Idempotent</th><th>Cacheable</th></tr>
    <tr><td class="cy">GET</td><td>получить ресурс</td><td class="gs">да</td><td class="gs">да</td><td class="gs">да</td></tr>
    <tr><td class="pu">HEAD</td><td>как GET, но только заголовки, без тела</td><td class="gs">да</td><td class="gs">да</td><td class="gs">да</td></tr>
    <tr><td class="gs">POST</td><td>отправить данные, создать ресурс</td><td class="rd">нет</td><td class="rd">нет</td><td class="am">редко</td></tr>
    <tr><td class="am">PUT</td><td>заменить ресурс целиком</td><td class="rd">нет</td><td class="gs">да</td><td class="rd">нет</td></tr>
    <tr><td class="am">PATCH</td><td>изменить часть ресурса</td><td class="rd">нет</td><td class="rd">нет</td><td class="am">редко</td></tr>
    <tr><td class="rd">DELETE</td><td>удалить ресурс</td><td class="rd">нет</td><td class="gs">да</td><td class="rd">нет</td></tr>
    <tr><td class="pk">OPTIONS</td><td>спросить, что разрешено (ядро CORS preflight)</td><td class="gs">да</td><td class="gs">да</td><td class="rd">нет</td></tr>
    <tr><td class="dm">TRACE</td><td>эхо запроса для диагностики</td><td class="gs">да</td><td class="gs">да</td><td class="rd">нет</td></tr>
    <tr><td class="dm">CONNECT</td><td>построить туннель через прокси</td><td class="rd">нет</td><td class="rd">нет</td><td class="rd">нет</td></tr>
  </table></div>

  <div class="sec-box">
    <div class="sb-t">SEC ▸ метод — это соглашение, а не гарантия</div>
    <p class="tx">Спецификация говорит «GET должен быть safe». Но <span class="hl">никто не мешает разработчику сделать <code class="ic">GET /account/delete?id=5</code></span>, и сервер честно удалит. Это не теория: такие эндпоинты находят регулярно. Последствия: браузерный префетч или антивирусный сканер ссылок могут вызвать удаление; ссылка в письме становится оружием; <span class="rd">SameSite=Lax такой запрос не заблокирует</span>, потому что для него top-level navigation GET — легитимный сценарий. Правило: <span class="hl">любое изменение состояния — только не-safe методом</span>.</p>
    <p class="tx" style="margin-bottom:0">Обратная сторона — <span class="hl">method override</span>. Некоторые фреймворки принимают заголовок <code class="ic">X-HTTP-Method-Override: PUT</code> или параметр <code class="ic">_method=DELETE</code> и трактуют GET/POST как другой метод. Браузер при этом видит исходный метод, а приложение — подменённый. Так обходят и SameSite, и проверки на уровне WAF, и CORS-логику.</p>
  </div>

  <h2 class="sect">статус-коды</h2>
  <p class="tx">Первая цифра кода = класс ответа. Её читают первой, до тела.</p>
  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>status-codes.live · классы ответов</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Кликай классы — примеры кодов и что каждый означает для AppSec:</p>
      <div id="statusLab"></div>
    </div>
  </div>
  <div class="card acc-p">
    <div class="card-t">◇ коды как источник информации</div>
    <p class="tx" style="margin:0">Разница между <code class="ic">401</code> и <code class="ic">403</code> — это разница между «я не знаю, кто ты» и «я знаю, кто ты, но тебе нельзя». Разница между <code class="ic">404</code> и <code class="ic">403</code> на скрытом ресурсе — <span class="rd">утечка факта существования</span>: перебирая ID и глядя на коды, можно составить карту приватных объектов, даже не читая их. Поэтому в чувствительных местах правильный ответ на чужой ресурс — <code class="ic">404</code>, а не <code class="ic">403</code>. Ещё сигнал: разное время ответа или разный текст ошибки при существующем и несуществующем логине — это user enumeration.</p>
  </div>

  <h2 class="sect">заголовки</h2>
  <p class="tx">Заголовки — метаданные сообщения. Их сотни; вот те, что нужно знать наизусть.</p>
  <div class="grid2">
    <div class="card acc-c"><div class="card-t">запрос</div><p class="tx" style="font-size:12px;margin:0">
      <code class="ic">Host</code> — какой сайт нужен (обязателен в HTTP/1.1)<br>
      <code class="ic">User-Agent</code> — клиент<br>
      <code class="ic">Cookie</code> — сохранённое состояние<br>
      <code class="ic">Authorization</code> — токен или креды<br>
      <code class="ic">Content-Type</code> — формат тела<br>
      <code class="ic">Origin</code> — откуда пришёл запрос (ключевой для CORS)<br>
      <code class="ic">Referer</code> — с какой страницы перешли (да, с опечаткой — она в стандарте с 1996 года)<br>
      <code class="ic">Accept</code> — что клиент готов принять<br>
      <code class="ic">X-Forwarded-For</code> — цепочка IP через прокси</p></div>
    <div class="card acc-g"><div class="card-t">ответ</div><p class="tx" style="font-size:12px;margin:0">
      <code class="ic">Set-Cookie</code> — выдать cookie<br>
      <code class="ic">Content-Type</code> — формат ответа<br>
      <code class="ic">Content-Length</code> — длина тела<br>
      <code class="ic">Location</code> — куда редиректить<br>
      <code class="ic">Cache-Control</code> — правила кэширования<br>
      <code class="ic">Access-Control-Allow-Origin</code> — политика CORS<br>
      <code class="ic">Content-Security-Policy</code> — политика ресурсов<br>
      <code class="ic">Strict-Transport-Security</code> — только HTTPS<br>
      <code class="ic">Server</code> — что за софт (часто лишняя утечка)</p></div>
  </div>

  <div class="sec-box">
    <div class="sb-t">SEC ▸ заголовки — это данные от клиента</div>
    <p class="tx">Всё, что приходит в заголовках запроса, <span class="rd">задаёт клиент и может подделать</span>. Три частых ошибки в коде:</p>
    <p class="tx"><span class="hl">Доверие <code class="ic">X-Forwarded-For</code></span> — приложение берёт «настоящий IP» из заголовка и по нему принимает решения (разрешить доступ, посчитать rate limit). Атакующий просто подставляет <code class="ic">X-Forwarded-For: 127.0.0.1</code> и обходит и то, и другое. Заголовку можно верить, только если ему проставляет значение твой собственный прокси и он же затирает пришедшее извне.</p>
    <p class="tx"><span class="hl">Доверие <code class="ic">Host</code></span> — приложение строит ссылки на основе Host (например, ссылку восстановления пароля). Атакующий шлёт <code class="ic">Host: evil.com</code>, письмо жертве приходит со ссылкой на его домен, жертва кликает — токен сброса пароля уходит атакующему. Это <span class="rd">password reset poisoning</span>, целый раздел в PortSwigger Academy.</p>
    <p class="tx" style="margin-bottom:0"><span class="hl">Доверие <code class="ic">Referer</code></span> — как защита от CSRF ненадёжна: заголовок легко убирается политикой referrer, а его отсутствие приложения обычно трактуют как «пропустить».</p>
  </div>

  <h2 class="sect">HTTP не имеет памяти</h2>
  <p class="tx">Ключевое свойство протокола: <span class="hl">HTTP stateless</span>. Каждый запрос обрабатывается как первый и единственный — сервер по протоколу не знает, что минуту назад ты логинился. Это сделано осознанно: так проще масштабировать, любой сервер из сотни может обслужить любой запрос.</p>
  <p class="tx">Но приложениям нужна память. Решение придумали в 1994 году — <span class="cy">cookies</span>: сервер выдаёт метку через <code class="ic">Set-Cookie</code>, браузер возвращает её в каждом следующем запросе через <code class="ic">Cookie</code>. Так поверх stateless-протокола появляется stateful-сессия. Из этого «костыля» растёт половина веб-уязвимостей — угон сессии, CSRF, фиксация сессии. Подробно в модуле 11.</p>

  <div class="ask-box">
    <div class="sb-t">на собесе спросят</div>
    <div class="q">— В чём разница между safe и idempotent?</div>
    <div class="a">Safe — запрос вообще не меняет состояние (GET, HEAD, OPTIONS). Idempotent — меняет, но повтор не добавляет эффекта (PUT, DELETE). Всё safe автоматически idempotent, обратное неверно: <span class="cy">DELETE</span> не safe, но idempotent. <span class="cy">POST</span> не является ни тем, ни другим — поэтому браузер и переспрашивает при обновлении страницы после отправки формы, и поэтому повторный POST создаёт второй заказ.</div>
    <div class="q">— Зачем нужен заголовок Host, если мы уже подключились по IP?</div>
    <div class="a">Потому что на одном IP живут сотни сайтов (virtual hosting). TCP-соединение приводит к машине, а Host говорит, чей контент отдавать. В HTTP/1.1 он <span class="hl">обязателен</span> — без него сервер должен вернуть 400. Отсюда и класс атак Host header injection: если приложение использует значение Host для построения ссылок, редиректов или ключей кэша, атакующий влияет на них напрямую.</div>
    <div class="q">— Что значит «HTTP stateless» и как тогда работает логин?</div>
    <div class="a">Протокол не связывает запросы между собой: каждый самодостаточен. Состояние добавляется слоем выше — cookie с идентификатором сессии, которую браузер автоматически прикладывает к каждому запросу к этому домену. Именно из этого «автоматически» вырастает CSRF: браузер приложит cookie и к запросу, который инициировал чужой сайт.</div>
  </div>

  <h2 class="sect">референсы модуля</h2>
  <a class="ref rfc" href="https://www.rfc-editor.org/rfc/rfc9110.html" target="_blank" rel="noopener"><span class="r-t">RFC 9110 — HTTP Semantics</span><span class="r-d">актуальная спецификация семантики HTTP: методы, коды, заголовки. Заменила RFC 7231 и старый 2616.</span><span class="r-u">rfc-editor.org/rfc/rfc9110.html</span></a>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages" target="_blank" rel="noopener"><span class="r-t">MDN — HTTP Messages</span><span class="r-d">разбор структуры запроса и ответа с примерами. Первое, что стоит открыть после этого модуля.</span><span class="r-u">developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages</span></a>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status" target="_blank" rel="noopener"><span class="r-t">MDN — HTTP status codes</span><span class="r-d">полный справочник кодов. Держи в закладках, наизусть учить не нужно.</span><span class="r-u">developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status</span></a>
  <a class="ref ps" href="https://portswigger.net/web-security/host-header" target="_blank" rel="noopener"><span class="r-t">PortSwigger — HTTP Host header attacks</span><span class="r-d">password reset poisoning, отравление кэша, обход контроля доступа через Host.</span><span class="r-u">portswigger.net/web-security/host-header</span></a>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('http');go('httpv')">[✓] завершить → версии, прокси, кэш</button>
  </div>
</section>`;
