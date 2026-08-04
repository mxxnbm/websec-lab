/* ---------- m10 · API ---------- */
const V_API = `
<section class="view" id="view-api">
  <div class="eyebrow">architecture · модуль 10 · источники: Fielding · W3C · OWASP API Top 10</div>
  <h1 class="vtitle"><span class="accent">API</span>: REST, SOAP, GraphQL</h1>
  <p class="vlede">Современное приложение — это интерфейс поверх API. Веб, мобильное приложение, партнёрская интеграция ходят в один и тот же бэкенд, только по-разному его вызывают. Для AppSec API — основная поверхность атаки: у OWASP под неё есть отдельный Top 10. Разберём стили API и то, что в каждом ломается.</p>

  <h2 class="sect">что такое API простыми словами</h2>
  <p class="tx">API (Application Programming Interface) — контракт: «пришли запрос вот такого вида — получишь ответ вот такого». Аналогия: меню в ресторане. Ты не идёшь на кухню и не объясняешь повару технологию — ты называешь позицию из меню. Меню — это API, кухня — реализация, которую ты не видишь и видеть не должен.</p>

  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>api-styles.live · один и тот же запрос в четырёх стилях</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Кликай стиль API — увидишь, как выглядит запрос «получить пользователя 42» и что в этом стиле ломается:</p>
      <div id="apiLab"></div>
    </div>
  </div>

  <h2 class="sect">REST — шесть ограничений Филдинга</h2>
  <p class="tx">REST — не протокол и не стандарт, а <span class="hl">архитектурный стиль</span>, описанный Роем Филдингом в диссертации 2000 года. Он задаёт шесть ограничений; API называется RESTful, когда им следует.</p>
  <div class="kv">
    <div class="kv-row"><div class="kv-k">1 · Client-Server</div><div class="kv-v">Клиент и сервер разделены и развиваются независимо. Клиент не знает про базу данных, сервер не знает про интерфейс.</div></div>
    <div class="kv-row"><div class="kv-k">2 · Stateless</div><div class="kv-v"><span class="hl">Каждый запрос самодостаточен</span>: сервер не хранит состояние сессии между вызовами. Всё, что нужно, приходит в самом запросе. Отсюда — токены вместо серверных сессий и возможность масштабироваться горизонтально.</div></div>
    <div class="kv-row"><div class="kv-k">3 · Cache</div><div class="kv-v">Ответы явно помечены как кэшируемые или нет. Без этого не работают CDN и промежуточные кэши.</div></div>
    <div class="kv-row"><div class="kv-k">4 · Uniform Interface</div><div class="kv-v">Единообразие: ресурсы адресуются URI, действия выражены HTTP-методами, представление отделено от ресурса. Именно отсюда привычные <code class="ic">GET /users/42</code> и <code class="ic">DELETE /users/42</code>.</div></div>
    <div class="kv-row"><div class="kv-k">5 · Layered System</div><div class="kv-v">Клиент не знает, говорит он напрямую с сервером или через прокси, балансировщик и кэш. Позволяет вставлять посредников прозрачно.</div></div>
    <div class="kv-row"><div class="kv-k">6 · Code-on-Demand</div><div class="kv-v">Единственное необязательное: сервер может прислать исполняемый код клиенту. Практически не используется.</div></div>
  </div>

  <div class="code"><span class="code-label">RESTful в действии</span><span class="fn">GET</span>    /api/v1/users          <span class="cmt">→ список пользователей</span>
<span class="fn">GET</span>    /api/v1/users/42       <span class="cmt">→ один пользователь</span>
<span class="fn">POST</span>   /api/v1/users          <span class="cmt">→ создать (тело: JSON)</span>
<span class="fn">PUT</span>    /api/v1/users/42       <span class="cmt">→ заменить целиком</span>
<span class="fn">PATCH</span>  /api/v1/users/42       <span class="cmt">→ изменить частично</span>
<span class="fn">DELETE</span> /api/v1/users/42       <span class="cmt">→ удалить</span>

<span class="cmt"># ресурс в URL — существительное, действие — метод.</span>
<span class="cmt"># НЕ RESTful: POST /api/deleteUser?id=42</span></div>

  <div class="sec-box">
    <div class="sb-t">SEC ▸ предсказуемость REST — это и подарок атакующему</div>
    <p class="tx">Регулярность URL, которая делает REST удобным, делает его и удобным для перебора. Увидел <code class="ic">GET /api/v1/orders/1042</code> — пробуешь 1041, 1043, потом <code class="ic">/api/v1/users/1</code>, потом <code class="ic">/api/v2/</code>, потом <code class="ic">/api/internal/</code>. Если сервер отдаёт чужой заказ — это <span class="rd">IDOR / BOLA</span>, и это уязвимость номер один в API-безопасности.</p>
    <p class="tx" style="margin-bottom:0">Второй типовой промах — <span class="hl">лишние поля в ответе</span>. Эндпоинт профиля возвращает объект целиком «как из базы», включая <code class="ic">password_hash</code>, <code class="ic">is_admin</code>, внутренние идентификаторы и телефон другого пользователя. Фронтенд их не показывает — но они уже ушли клиенту. Зеркальная проблема на входе — <span class="rd">mass assignment</span>: клиент присылает <code class="ic">{"name":"x","is_admin":true}</code>, а сервер бездумно применяет весь объект к модели.</p>
  </div>

  <h2 class="sect">остальные стили</h2>
  <div class="twrap"><table class="t">
    <tr><th>Стиль</th><th>Формат</th><th>Когда встречается</th><th>Чем интересен атакующему</th></tr>
    <tr>
      <td class="cy">REST</td><td>JSON поверх HTTP</td>
      <td>Абсолютное большинство публичных API</td>
      <td>IDOR, mass assignment, избыточные данные в ответе, отсутствие rate limiting</td>
    </tr>
    <tr>
      <td class="am">SOAP</td><td>XML поверх HTTP (иногда других транспортов)</td>
      <td>Легаси, банки, госуслуги, корпоративные интеграции. Стандарт W3C, версия 1.2 с 2007 года</td>
      <td><span class="rd">XXE</span> — внешние сущности XML: чтение файлов сервера и SSRF. Плюс XML bomb и утечка схемы через WSDL, который часто открыт всем</td>
    </tr>
    <tr>
      <td class="pu">GraphQL</td><td>Один эндпоинт, язык запросов</td>
      <td>Открыт Facebook в 2015. Часто в новых продуктах и мобильных бэкендах</td>
      <td><span class="rd">Introspection</span> отдаёт всю схему API целиком; вложенные запросы — DoS через глубину; авторизация на уровне полей часто отсутствует; batching помогает обходить rate limiting</td>
    </tr>
    <tr>
      <td class="gs">gRPC</td><td>Protobuf поверх HTTP/2</td>
      <td>Google, 2015. Внутренние вызовы между микросервисами</td>
      <td>Бинарный формат хуже читается инструментами; отсутствие mTLS внутри периметра; отражение (reflection) выдаёт список методов</td>
    </tr>
    <tr>
      <td class="pk">WebSocket</td><td>Постоянное двустороннее соединение</td>
      <td>Чаты, трейдинг, уведомления, онлайн-игры</td>
      <td><span class="rd">Cross-Site WebSocket Hijacking</span>: рукопожатие идёт с cookies, а SOP на него не действует и preflight не работает — нужна явная проверка Origin на сервере</td>
    </tr>
  </table></div>

  <div class="card acc-a">
    <div class="card-t">⚡ почему у API свой OWASP Top 10</div>
    <p class="tx" style="margin:0">Потому что уязвимости API отличаются по природе от классических веб-уязвимостей. В обычном приложении главное — инъекции и XSS. В API главное — <span class="hl">контроль доступа</span>: BOLA (доступ к чужому объекту), BOPLA (доступ к чужим полям объекта), BFLA (доступ к чужой функции). Плюс отсутствие лимитов, неавторизованные внутренние эндпоинты и забытые старые версии <code class="ic">/api/v1/</code>, которые никто не выключил. Полный список — OWASP API Security Top 10, редакция 2023.</p>
  </div>

  <div class="ask-box">
    <div class="sb-t">на собесе спросят</div>
    <div class="q">— Что значит «REST stateless» и как тогда работает авторизация?</div>
    <div class="a">Stateless означает, что сервер не хранит контекст между запросами: любой узел кластера может обслужить любой запрос. Авторизация при этом никуда не девается — просто вся необходимая информация едет <span class="hl">в самом запросе</span>: токен в заголовке <code class="ic">Authorization: Bearer ...</code>, который сервер проверяет по подписи, не заглядывая в общее хранилище. Отсюда популярность JWT в REST API. Обратная сторона — такой токен нельзя мгновенно отозвать, к этому вернёмся в модуле 12.</div>
    <div class="q">— В чём разница между BOLA и BFLA?</div>
    <div class="a"><span class="cy">BOLA</span> (Broken Object Level Authorization) — доступ к <span class="hl">чужому объекту</span> через свою же функцию: <code class="ic">GET /api/orders/1043</code>, где заказ принадлежит другому пользователю. Это тот же IDOR. <span class="cy">BFLA</span> (Broken Function Level Authorization) — доступ к <span class="hl">чужой функции</span>: обычный пользователь вызывает <code class="ic">DELETE /api/admin/users/42</code>, потому что проверка роли стоит только в интерфейсе. Первое — про объект, второе — про операцию.</div>
    <div class="q">— Чем опасна GraphQL introspection?</div>
    <div class="a">Introspection — встроенная возможность запросить у API описание собственной схемы: все типы, поля, мутации, аргументы. Для разработчика это удобство, для атакующего — <span class="rd">готовая карта всей поверхности атаки</span>, включая эндпоинты, которых нет ни в документации, ни в интерфейсе. В продакшене introspection принято отключать; это не защита сама по себе, но убирает бесплатную разведку.</div>
  </div>

  <h2 class="sect">референсы модуля</h2>
  <a class="ref" href="https://roy.gbiv.com/pubs/dissertation/rest_arch_style.htm" target="_blank" rel="noopener"><span class="r-t">Roy Fielding — Architectural Styles (глава 5, REST)</span><span class="r-d">первоисточник REST. Именно отсюда шесть ограничений — стоит прочитать хотя бы главу 5.</span><span class="r-u">roy.gbiv.com/pubs/dissertation/rest_arch_style.htm</span></a>
  <a class="ref owasp" href="https://owasp.org/API-Security/editions/2023/en/0x11-t10/" target="_blank" rel="noopener"><span class="r-t">OWASP API Security Top 10 (2023)</span><span class="r-d">BOLA, BOPLA, BFLA и остальные семь категорий. Обязательно к прочтению перед собесом на AppSec.</span><span class="r-u">owasp.org/API-Security/editions/2023/en/0x11-t10</span></a>
  <a class="ref ps" href="https://portswigger.net/web-security/api-testing" target="_blank" rel="noopener"><span class="r-t">PortSwigger — API testing</span><span class="r-d">методика тестирования API: поиск эндпоинтов, работа с документацией, массовое присвоение.</span><span class="r-u">portswigger.net/web-security/api-testing</span></a>
  <a class="ref ps" href="https://portswigger.net/web-security/graphql" target="_blank" rel="noopener"><span class="r-t">PortSwigger — GraphQL API vulnerabilities</span><span class="r-d">introspection, обход rate limit через алиасы, доступ к скрытым мутациям.</span><span class="r-u">portswigger.net/web-security/graphql</span></a>

  <h2 class="sect">checkpoint: секция ARCHITECTURE</h2>
  <p class="tx">Проверь понимание архитектуры и API — здесь вопросы уже ближе к реальному собеседованию.</p>
  <div id="quiz-arch"></div>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('api');go('state')">[✓] завершить секцию → cookies и сессии</button>
  </div>
</section>`;
