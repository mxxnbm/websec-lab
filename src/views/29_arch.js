/* ---------- m09 · ARCHITECTURE / RENDERING ---------- */
const V_ARCH = `
<section class="view" id="view-arch">
  <div class="eyebrow">architecture · модуль 09 · источники: web.dev · MDN · Hoffman</div>
  <h1 class="vtitle">Web 1 → 2 → <span class="accent">сегодня</span></h1>
  <p class="vlede">В модуле 01 мы обсудили поколения веба на уровне идей. Теперь — что за ними стоит технически. Как одна технология (AJAX) превратила сайты в приложения, зачем появились SPA, почему потом маятник качнулся обратно к рендерингу на сервере и как устроено приложение, которое ты будешь анализировать на работе.</p>

  <h2 class="sect">переломный момент: AJAX</h2>
  <p class="tx">До 2005 года любое действие означало полную перезагрузку страницы. Нажал «лайк» — браузер ушёл на сервер, получил новый HTML целиком, отрисовал всё заново. Медленно и неудобно.</p>
  <p class="tx">Технология <span class="cy">AJAX</span> (термин ввёл Jesse James Garrett в феврале 2005) позволила скрипту сходить на сервер <span class="hl">в фоне</span>, получить кусочек данных и обновить только нужную часть страницы. Сначала через <code class="ic">XMLHttpRequest</code>, сегодня — через современный <code class="ic">fetch()</code>.</p>

  <div class="ascii"><span class="h">БЕЗ AJAX (Web 1.0)</span>                <span class="h">С AJAX (Web 2.0)</span>

  клик                              клик
   │                                 │
   ▼                                 ▼
  <span class="r">ПОЛНАЯ перезагрузка</span>              <span class="g">fetch() в фоне</span>
   │  сервер собирает                │  сервер отдаёт
   │  весь HTML заново               │  только JSON: {"likes":42}
   ▼                                 ▼
  <span class="r">белый экран, всё мигает</span>          <span class="g">JS меняет один элемент</span>
   │                                 │
   ▼                                 ▼
  страница отрисована заново        страница не дёрнулась</div>

  <p class="tx">Последствие оказалось шире, чем «стало удобнее»: раз сервер теперь отдаёт <span class="hl">данные, а не разметку</span>, значит его можно отделить от интерфейса. Так родились API, а из них — мобильные приложения, интеграции, партнёрские сервисы. Весь современный веб вырос из этого сдвига.</p>

  <div class="sec-box">
    <div class="sb-t">SEC ▸ что изменилось для атакующего</div>
    <p class="tx">Раньше поверхность атаки = набор страниц. Теперь поверхность атаки = <span class="hl">набор API-эндпоинтов</span>, и он гораздо больше того, что видно в интерфейсе. Кнопка «удалить» может быть скрыта для обычного пользователя в UI, но эндпоинт <code class="ic">DELETE /api/users/42</code> продолжает работать. Отсюда правило номер один в API-безопасности: <span class="rd">скрыть элемент в интерфейсе — не значит закрыть доступ</span>. Проверка прав должна быть на сервере, на каждом эндпоинте, на каждый объект.</p>
    <p class="tx" style="margin-bottom:0">Второе следствие: логика переехала на клиент. Валидация формы, расчёт цены, проверка роли — если это делает JS в браузере, атакующий просто не запускает этот JS и шлёт запрос напрямую. Всё, что видно в исходниках фронтенда, включая «скрытые» админские маршруты и ключи, — известно атакующему.</p>
  </div>

  <h2 class="sect">где рендерится HTML: четыре стратегии</h2>
  <div class="twrap"><table class="t">
    <tr><th>Подход</th><th>Кто собирает HTML</th><th>Плюсы</th><th>AppSec-угол</th></tr>
    <tr>
      <td class="cy">SSR<br><span class="dm">server-side</span></td>
      <td>Сервер на каждый запрос</td>
      <td>Быстрый первый показ, хорошо индексируется</td>
      <td>Инъекции в шаблон на сервере: reflected XSS и <span class="rd">SSTI</span>. Данные пользователя попадают в HTML на сервере.</td>
    </tr>
    <tr>
      <td class="gs">CSR / SPA<br><span class="dm">client-side</span></td>
      <td>Браузер, из JSON</td>
      <td>Плавный интерфейс, нет перезагрузок</td>
      <td>Смещение в <span class="rd">DOM-based XSS</span>, вся авторизация только на API, токены в браузере, роутинг на клиенте легко обойти.</td>
    </tr>
    <tr>
      <td class="am">SSG<br><span class="dm">static</span></td>
      <td>Сборщик заранее, при деплое</td>
      <td>Максимально быстро и дёшево, минимум поверхности</td>
      <td>Самый безопасный вариант — исполняемого кода на сервере нет. Риски смещаются в цепочку сборки и хостинг.</td>
    </tr>
    <tr>
      <td class="pu">Hydration<br><span class="dm">гибрид</span></td>
      <td>Сервер отдаёт HTML, клиент «оживляет»</td>
      <td>Скорость SSR плюс интерактивность SPA</td>
      <td>Двойной рендер = <span class="rd">две точки экранирования</span>. Данные, безопасные в серверном шаблоне, могут попасть в опасный sink при гидратации.</td>
    </tr>
  </table></div>

  <h2 class="sect">как устроено приложение целиком</h2>
  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>app-layers.live · кликай слои приложения</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Кликай по слоям типичного веб-приложения — что там живёт и какие уязвимости водятся именно на этом уровне:</p>
      <div id="archLab"></div>
    </div>
  </div>

  <h2 class="sect">монолит против микросервисов</h2>
  <div class="grid2">
    <div class="card acc-c">
      <div class="card-t">Монолит</div>
      <p class="tx" style="font-size:12px">Одно приложение, один процесс, одна база. Вызов между модулями — обычный вызов функции внутри процесса.</p>
      <p class="tx" style="font-size:12px;margin:0"><span class="gs">Плюс для безопасности:</span> один периметр, одна точка аутентификации, проще аудит. <span class="rd">Минус:</span> пробили в одном месте — получили всё; сложно ограничить радиус поражения.</p>
    </div>
    <div class="card acc-p">
      <div class="card-t">Микросервисы</div>
      <p class="tx" style="font-size:12px">Десятки независимых сервисов, у каждого своя база, общаются по сети через HTTP или очереди. Вход через API gateway.</p>
      <p class="tx" style="font-size:12px;margin:0"><span class="gs">Плюс:</span> изоляция, компрометация одного сервиса не даёт остальные. <span class="rd">Минус:</span> сеть внутри периметра — новая поверхность атаки; появляется вопрос доверия между сервисами (service-to-service auth); резко растёт роль SSRF, потому что изнутри доступны десятки внутренних адресов.</p>
    </div>
  </div>

  <div class="card acc-r">
    <div class="card-t">⚡ классический вопрос: доверие внутри периметра</div>
    <p class="tx" style="margin:0">Типичная ошибка архитектуры: «мы внутри своей сети, значит можно без аутентификации». В такой модели <span class="rd">одна SSRF-уязвимость на фронтовом сервисе даёт полный доступ ко всей внутренней инфраструктуре</span> — включая метаданные облака, внутренние админки и базы. Правильный подход — zero trust: каждый вызов аутентифицирован (mTLS или подписанные токены), каждый сервис проверяет права вызывающего, сеть считается враждебной по умолчанию.</p>
  </div>

  <div class="ask-box">
    <div class="sb-t">на собесе спросят</div>
    <div class="q">— Расскажи про архитектуру онлайн-магазина или банка.</div>
    <div class="a">Частый открытый вопрос — проверяют системное мышление, а не знание конкретного стека. Скелет ответа по слоям: клиенты (веб, мобильный, партнёрские интеграции) → CDN и WAF → балансировщик с терминацией TLS → API gateway (аутентификация, квоты, маршрутизация) → сервисы (каталог, корзина, заказы, платежи, профиль, уведомления) → хранилища (реляционная БД для заказов, кэш для сессий и каталога, объектное хранилище для картинок) → интеграции наружу (платёжный провайдер, доставка, антифрод) → асинхронный слой (очереди для писем, аналитики). Дальше сам добавь угол AppSec: где границы доверия, где хранятся секреты, как сервисы аутентифицируют друг друга, где идемпотентность платежей и почему без неё возникает race condition при двойном списании.</div>
    <div class="q">— Почему в SPA авторизацию нельзя делать на фронтенде?</div>
    <div class="a">Потому что весь код фронтенда находится у пользователя и полностью им контролируется. Скрытие кнопки, проверка роли в JS, клиентский роутинг — это про удобство интерфейса, а не про безопасность: их обходят открытием DevTools или прямым запросом к API из curl. <span class="hl">Единственная настоящая проверка — на сервере, на каждый эндпоинт и на каждый объект.</span> Именно отсутствие второй проверки даёт IDOR и BOLA — это A01 в OWASP Top 10:2025.</div>
  </div>

  <h2 class="sect">референсы модуля</h2>
  <a class="ref" href="https://web.dev/articles/rendering-on-the-web" target="_blank" rel="noopener"><span class="r-t">web.dev — Rendering on the Web</span><span class="r-d">каноническое сравнение SSR, CSR, SSG и гидратации от команды Google.</span><span class="r-u">web.dev/articles/rendering-on-the-web</span></a>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API" target="_blank" rel="noopener"><span class="r-t">MDN — Fetch API</span><span class="r-d">современная замена XMLHttpRequest. Именно через него ходят все SPA.</span><span class="r-u">developer.mozilla.org/en-US/docs/Web/API/Fetch_API</span></a>
  <a class="ref owasp" href="https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html" target="_blank" rel="noopener"><span class="r-t">OWASP — Microservices Security Cheat Sheet</span><span class="r-d">аутентификация между сервисами, распространение контекста пользователя, edge-level authorization.</span><span class="r-u">cheatsheetseries.owasp.org/.../Microservices_Security_Cheat_Sheet.html</span></a>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('arch');go('api')">[✓] завершить → API: REST и другие</button>
  </div>
</section>`;
