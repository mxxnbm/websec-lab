/* ---------- m11 · COOKIES / SESSIONS ---------- */
const V_STATE = `
<section class="view" id="view-state">
  <div class="eyebrow">state · модуль 11 · источники: RFC 6265 · MDN · OWASP</div>
  <h1 class="vtitle">Cookies и <span class="accent">сессии</span></h1>
  <p class="vlede">HTTP не помнит предыдущие запросы — мы разобрали это в модуле 05. Но приложению надо помнить, что ты залогинен. Механизм, который это чинит, придумали в 1994 году, и он до сих пор несёт на себе половину веб-аутентификации. Это самый плотный модуль курса по количеству вопросов на собеседовании: атрибуты cookie спрашивают почти везде.</p>

  <h2 class="sect">как это работает</h2>
  <div class="ascii">  <span class="h">1. ЛОГИН</span>
  браузер ──── POST /login {user, pass} ───────▶ сервер
                                                  <span class="f">проверил, создал сессию</span>
  браузер ◀─── <span class="g">Set-Cookie: sid=a3f9...; HttpOnly</span> ── сервер

  <span class="h">2. ЛЮБОЙ СЛЕДУЮЩИЙ ЗАПРОС — браузер сам приложит cookie</span>
  браузер ──── GET /account <span class="g">Cookie: sid=a3f9...</span> ───▶ сервер
                                                  <span class="f">нашёл сессию → знает, кто ты</span>
  браузер ◀─── 200 OK, твой профиль ───────────── сервер

  <span class="r">КЛЮЧЕВОЕ: браузер прикладывает cookie АВТОМАТИЧЕСКИ,</span>
  <span class="r">к любому запросу на этот домен — включая запросы,</span>
  <span class="r">которые инициировал ЧУЖОЙ сайт. Отсюда растёт CSRF.</span></div>

  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>cookie-flags.live · включай атрибуты, смотри что меняется</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Переключай флаги — увидишь итоговый заголовок <code class="ic">Set-Cookie</code> и от каких атак защищает каждая комбинация:</p>
      <div id="cookieLab"></div>
    </div>
  </div>

  <h2 class="sect">атрибуты cookie: что каждый реально даёт</h2>
  <div class="kv">
    <div class="kv-row"><div class="kv-k">HttpOnly</div><div class="kv-v">JS не видит cookie через <code class="ic">document.cookie</code>. Защищает от <span class="hl">кражи</span> при XSS — но не от самого XSS. Скрипт всё ещё может действовать от имени жертвы: браузер приложит cookie к его запросам автоматически.</div></div>
    <div class="kv-row"><div class="kv-k">Secure</div><div class="kv-v">Cookie отправляется только по HTTPS. Защищает от перехвата в открытом канале. Без него cookie утечёт при любом случайном HTTP-запросе на домен.</div></div>
    <div class="kv-row"><div class="kv-k">SameSite=Strict</div><div class="kv-v">Не отправляется вообще ни в каких cross-site запросах — включая обычный переход по ссылке с другого сайта. Максимальная защита от CSRF, но ломает UX: перешёл из письма — оказался разлогинен.</div></div>
    <div class="kv-row"><div class="kv-k">SameSite=Lax</div><div class="kv-v"><span class="hl">Значение по умолчанию в Chrome с версии 80 (2020).</span> Отправляется при top-level navigation методом GET (клик по ссылке), но не при cross-site POST, не в фоновых запросах, не в iframe и не в img. Разумный компромисс.</div></div>
    <div class="kv-row"><div class="kv-k">SameSite=None</div><div class="kv-v">Отправляется всегда, включая cross-site. <span class="hl">Обязательно требует <code class="ic">Secure</code></span>. Нужен для встраиваемых виджетов и OAuth-редиректов. Сам по себе ничего не защищает.</div></div>
    <div class="kv-row"><div class="kv-k">Domain</div><div class="kv-v">Расширяет область действия на поддомены. <span class="rd">Без него cookie host-only</span> — доступна строго на том хосте, что её выдал. С <code class="ic">Domain=example.com</code> — на домене и <span class="hl">всех его поддоменах</span>. Чем шире, тем больше поверхность.</div></div>
    <div class="kv-row"><div class="kv-k">Path</div><div class="kv-v">Ограничивает по пути. <code class="ic">Path=/</code> — на все пути. Слабая изоляция: скрипт с одного пути легко читает cookie другого через iframe, поэтому как защиту Path не рассматривают.</div></div>
    <div class="kv-row"><div class="kv-k">Expires / Max-Age</div><div class="kv-v">Срок жизни. Без них cookie сессионная — умирает при закрытии браузера (хотя «восстановление вкладок» это ломает). <code class="ic">Max-Age</code> в секундах, приоритетнее <code class="ic">Expires</code>.</div></div>
    <div class="kv-row"><div class="kv-k">Partitioned</div><div class="kv-v">CHIPS: cookie партиционируется по сайту верхнего уровня. Виджет на <code class="ic">a.com</code> и тот же виджет на <code class="ic">b.com</code> получают разные хранилища — межсайтовая слежка не работает, а функциональность встраивания сохраняется. Требует <code class="ic">Secure</code>.</div></div>
  </div>

  <h2 class="sect">префиксы имени — недооценённая защита</h2>
  <div class="code"><span class="code-label">cookie prefixes</span><span class="fn">Set-Cookie</span>: __Secure-sid=abc; <span class="op">Secure</span>; Path=/
<span class="cmt">   └ браузер примет ТОЛЬКО если стоит Secure и выставлено по HTTPS</span>

<span class="fn">Set-Cookie</span>: __Host-sid=abc; <span class="op">Secure</span>; Path=/
<span class="cmt">   └ требует Secure + Path=/ + ЗАПРЕЩАЕТ атрибут Domain</span>
<span class="cmt">     → cookie намертво привязана к одному хосту</span>
<span class="cmt">     → поддомен НЕ может её ни прочитать, ни перезаписать</span></div>
  <p class="tx"><code class="ic">__Host-</code> — единственная защита от <span class="cy">cookie tossing</span>. Правила выставления cookie устроены так, что поддомен может записать cookie на родительский домен (см. таблицу ниже). Скомпрометированный <code class="ic">blog.example.com</code> ставит свою <code class="ic">Set-Cookie: sid=атакующий; Domain=example.com</code> — и подменяет сессию на главном сайте. Браузер отдаст обе, а сервер обычно возьмёт первую попавшуюся. С префиксом <code class="ic">__Host-</code> это невозможно.</p>

  <h2 class="sect">правила Domain: кто кому может ставить cookie</h2>
  <div class="twrap"><table class="t">
    <tr><th>Кто выставляет</th><th>Что в Set-Cookie</th><th>Результат</th></tr>
    <tr><td><code class="ic">shop.example.com</code></td><td>без Domain</td><td class="gs">host-only: видна только на <code class="ic">shop.example.com</code></td></tr>
    <tr><td><code class="ic">shop.example.com</code></td><td><code class="ic">Domain=shop.example.com</code></td><td class="gs">то же самое, только на этом хосте</td></tr>
    <tr><td><code class="ic">shop.example.com</code></td><td><code class="ic">Domain=example.com</code></td><td class="am">видна на <code class="ic">example.com</code> и <span class="hl">всех поддоменах</span> — включая соседние</td></tr>
    <tr><td><code class="ic">shop.example.com</code></td><td><code class="ic">Domain=admin.example.com</code></td><td class="rd">браузер отклонит: нельзя ставить cookie на чужой поддомен</td></tr>
    <tr><td><code class="ic">shop.example.com</code></td><td><code class="ic">Domain=evil.com</code></td><td class="rd">браузер отклонит: чужой домен</td></tr>
  </table></div>
  <p class="tx">Правило в одну строку: <span class="hl">cookie можно выставить на себя или на родительский домен, но не на чужой поддомен и не на чужой домен</span>. Именно «на родителя» и делает поддомены опасными.</p>

  <div class="sec-box">
    <div class="sb-t">SEC ▸ где SameSite не спасает</div>
    <p class="tx"><span class="hl">Поддомены — это same-site.</span> Запрос с <code class="ic">evil.example.com</code> на <code class="ic">app.example.com</code> для SameSite не является cross-site. Скомпрометировали любой поддомен — защита от CSRF на cookies перестала работать.</p>
    <p class="tx"><span class="hl">GET, меняющий состояние.</span> <code class="ic">Lax</code> пропускает top-level navigation GET. Если у приложения есть <code class="ic">GET /transfer?to=X</code>, Lax его не остановит.</p>
    <p class="tx"><span class="hl">Окно Lax+POST в Chrome.</span> Для cookie, выставленных <span class="hl">без явного атрибута SameSite</span>, Chrome применяет Lax по умолчанию, но не применяет ограничение к cross-site POST в первые <span class="cy">120 секунд</span> после установки cookie. Сделано, чтобы не ломать OAuth-редиректы. Практическое следствие: если удаётся заставить приложение переустановить cookie, открывается окно для CSRF. Мораль: <span class="rd">ставь SameSite явно</span>, не полагайся на дефолт.</p>
    <p class="tx"><span class="hl">Method override.</span> Некоторые фреймворки трактуют GET с заголовком <code class="ic">X-HTTP-Method-Override: POST</code> как POST. Браузер видит GET и применяет Lax-правила для GET, приложение выполняет POST-логику.</p>
    <p class="tx" style="margin-bottom:0"><span class="hl">XSS обходит всё.</span> Скрипт исполняется в том же origin, его запросы вообще не cross-site — SameSite к ним неприменим в принципе. Никакая настройка cookie не защищает от XSS.</p>
  </div>

  <h2 class="sect">сессия на сервере против токена</h2>
  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>session-vs-token.live · два способа помнить пользователя</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Пройди по шагам оба сценария — увидишь, где хранится состояние и что происходит при logout:</p>
      <div id="sessionLab"></div>
    </div>
  </div>

  <div class="grid2">
    <div class="card acc-c">
      <div class="card-t">Серверная сессия (stateful)</div>
      <p class="tx" style="font-size:12px">Cookie содержит только <span class="hl">случайный идентификатор</span>. Все данные — на сервере (в памяти, Redis, БД).</p>
      <p class="tx" style="font-size:12px;margin:0"><span class="gs">Плюс:</span> мгновенный отзыв — удалил запись, сессия мертва. Данные не покидают сервер. <span class="rd">Минус:</span> нужно общее хранилище для всех узлов, лишний поход в него на каждый запрос.</p>
    </div>
    <div class="card acc-p">
      <div class="card-t">Токен (stateless)</div>
      <p class="tx" style="font-size:12px">Токен сам содержит данные о пользователе и <span class="hl">подписан</span> сервером. Проверка — только математика, без похода в хранилище.</p>
      <p class="tx" style="font-size:12px;margin:0"><span class="gs">Плюс:</span> масштабируется, удобно между сервисами. <span class="rd">Минус:</span> <span class="hl">нельзя отозвать до истечения срока</span> — уволили сотрудника, а его токен живёт ещё 15 минут. Лечится коротким TTL и списком отзыва, что частично возвращает stateful.</p>
    </div>
  </div>

  <h2 class="sect">жизненный цикл сессии</h2>
  <div class="kv">
    <div class="kv-row"><div class="kv-k">Генерация ID</div><div class="kv-v">Только криптостойкий генератор случайных чисел, не менее 128 бит энтропии. Предсказуемый ID (счётчик, timestamp, хеш от логина) = угон чужой сессии перебором.</div></div>
    <div class="kv-row"><div class="kv-k">Ротация при логине</div><div class="kv-v">Обязательно выдавать <span class="hl">новый</span> идентификатор после успешной аутентификации и после смены привилегий. Иначе возможна <span class="rd">session fixation</span>: атакующий заранее навязывает жертве известный ему ID, жертва логинится — и он получает авторизованную сессию.</div></div>
    <div class="kv-row"><div class="kv-k">Тайм-ауты</div><div class="kv-v">Два независимых: idle timeout (бездействие, минуты-часы) и absolute timeout (максимальная жизнь независимо от активности).</div></div>
    <div class="kv-row"><div class="kv-k">Logout</div><div class="kv-v">Уничтожать сессию <span class="hl">на сервере</span>, а не только удалять cookie в браузере. Удаление cookie у клиента ничего не значит, если у атакующего уже есть её значение.</div></div>
    <div class="kv-row"><div class="kv-k">Привязка</div><div class="kv-v">Опционально: сверять User-Agent или подсеть IP. Помогает против угона, но ломает мобильных пользователей при переключении сети — поэтому применяется осторожно.</div></div>
  </div>

  <div class="ask-box">
    <div class="sb-t">на собесе спросят</div>
    <div class="q">— Есть XSS, но cookie стоит HttpOnly. Возможен захват аккаунта?</div>
    <div class="a">Да. HttpOnly мешает <span class="hl">украсть</span> cookie, а не действовать от имени жертвы. Скрипт может: прочитать CSRF-токен из DOM и отправить запрос на смену пароля или почты; повесить кейлоггер на форму; вызвать любой внутренний API — браузер приложит сессионную cookie сам; отрисовать фишинговый оверлей; вытащить и отправить содержимое страницы. HttpOnly снижает удобство атаки, но не закрывает её. Это одна из самых частых проверок на собеседовании.</div>
    <div class="q">— Cookie с <code class="ic">seller.example.com</code> — увидит ли её <code class="ic">example.com</code>? А наоборот?</div>
    <div class="a">Зависит от <code class="ic">Domain</code>. Если <code class="ic">seller.example.com</code> поставил cookie <span class="hl">без Domain</span> — она host-only, родительский домен её не увидит. Если поставил <code class="ic">Domain=example.com</code> — увидит и родитель, и все соседние поддомены. Обратно: cookie, выставленная на <code class="ic">example.com</code> с <code class="ic">Domain=example.com</code>, доступна на всех поддоменах, включая <code class="ic">seller</code>. Cookie, выставленная на <code class="ic">example.com</code> без Domain, поддоменам не видна.</div>
    <div class="q">— Пришли две cookie с одинаковым именем и разными значениями. Какую возьмёт сервер?</div>
    <div class="a">Честный ответ: <span class="hl">однозначного правила нет</span>. Заголовок <code class="ic">Cookie</code> не передаёт ни Domain, ни Path — сервер видит просто список пар. Порядок зависит от специфичности Path и времени создания, а выбор — от конкретной серверной библиотеки: одни берут первую, другие последнюю. Именно эта неопределённость и делает возможным cookie tossing. Правильный вывод для собеседования — не угадывать поведение, а исключить ситуацию: префикс <code class="ic">__Host-</code>.</div>
    <div class="q">— Где хранить сессионный токен: cookie или localStorage?</div>
    <div class="a">Для сессии браузерного приложения — <span class="hl">cookie с HttpOnly, Secure, SameSite и префиксом __Host-</span>. Логика: XSS страшнее CSRF, потому что CSRF надёжно закрывается токеном и SameSite, а от кражи токена из localStorage при XSS защиты нет вообще. localStorage оправдан там, где cookie не работают by design: кросс-доменные SPA, мобильные приложения, публичные API-клиенты.</div>
  </div>

  <h2 class="sect">референсы модуля</h2>
  <a class="ref rfc" href="https://www.rfc-editor.org/rfc/rfc6265.html" target="_blank" rel="noopener"><span class="r-t">RFC 6265 — HTTP State Management</span><span class="r-d">базовая спецификация cookies. Преемник (6265bis) с SameSite и префиксами пока в статусе черновика, хотя браузеры его уже реализовали.</span><span class="r-u">rfc-editor.org/rfc/rfc6265.html</span></a>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie" target="_blank" rel="noopener"><span class="r-t">MDN — Set-Cookie</span><span class="r-d">полный справочник по всем атрибутам, включая Partitioned и префиксы.</span><span class="r-u">developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie</span></a>
  <a class="ref owasp" href="https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" target="_blank" rel="noopener"><span class="r-t">OWASP — Session Management Cheat Sheet</span><span class="r-d">эталон требований к сессиям: энтропия ID, ротация, тайм-ауты, logout. Читать целиком перед собесом.</span><span class="r-u">cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html</span></a>
  <a class="ref ps" href="https://portswigger.net/web-security/csrf/bypassing-samesite-restrictions" target="_blank" rel="noopener"><span class="r-t">PortSwigger — Bypassing SameSite restrictions</span><span class="r-d">все обходы, включая окно Lax+POST и трюк с method override. С лабами.</span><span class="r-u">portswigger.net/web-security/csrf/bypassing-samesite-restrictions</span></a>
  <a class="ref" href="https://web.dev/articles/samesite-cookies-explained" target="_blank" rel="noopener"><span class="r-t">web.dev — SameSite cookies explained</span><span class="r-d">визуальный разбор Strict, Lax, None и что изменилось после Chrome 80.</span><span class="r-u">web.dev/articles/samesite-cookies-explained</span></a>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('state');go('auth')">[✓] завершить → аутентификация и авторизация</button>
  </div>
</section>`;
