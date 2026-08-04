/* ---------- m12 · AUTHN / AUTHZ ---------- */
const V_AUTH = `
<section class="view" id="view-auth">
  <div class="eyebrow">state · модуль 12 · источники: RFC 9110 · RFC 6749 · OWASP</div>
  <h1 class="vtitle">Аутентификация и <span class="accent">авторизация</span></h1>
  <p class="vlede">Сессии дали приложению память. Теперь — как оно понимает, <span class="hl">кто</span> ты и <span class="hl">что тебе можно</span>. Это два разных вопроса, их постоянно путают, и путаница дорого стоит: сломанный контроль доступа — первая категория OWASP Top 10 много лет подряд.</p>

  <h2 class="sect">три процесса, которые путают</h2>
  <div class="grid3">
    <div class="card acc-c"><div class="card-t">Identification</div><p class="tx" style="font-size:12px;margin:0">«Я — Алиса». Заявление о личности <span class="hl">без доказательства</span>. Это ввод логина, номер карты, ID в запросе.</p></div>
    <div class="card acc-g"><div class="card-t">Authentication (AuthN)</div><p class="tx" style="font-size:12px;margin:0">«Докажи». Проверка заявления: пароль, код из SMS, ключ, биометрия. Отвечает на вопрос <span class="hl">кто ты</span>.</p></div>
    <div class="card acc-a"><div class="card-t">Authorization (AuthZ)</div><p class="tx" style="font-size:12px;margin:0">«Тебе сюда можно?». Проверка прав <span class="hl">после</span> подтверждения личности. Отвечает на вопрос <span class="hl">что тебе разрешено</span>.</p></div>
  </div>
  <p class="tx">Аналогия: пропуск в бизнес-центр. Назвал фамилию — identification. Показал паспорт, охрана сверила фото — authentication. Проверили, что твой пропуск открывает 7-й этаж, но не серверную — authorization. <span class="rd">Основная масса реальных уязвимостей — на третьем шаге</span>: личность подтвердили, а права проверить забыли.</p>

  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>access-control.live · где падает проверка</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Кликай сценарии — увидишь, какая именно проверка отсутствует и как называется уязвимость:</p>
      <div id="authzLab"></div>
    </div>
  </div>

  <h2 class="sect">HTTP-схемы аутентификации</h2>
  <p class="tx">Помимо форм логина, в самом протоколе есть встроенный механизм: сервер отвечает <code class="ic">401</code> с заголовком <code class="ic">WWW-Authenticate</code>, клиент повторяет запрос с заголовком <code class="ic">Authorization</code>.</p>
  <div class="twrap"><table class="t">
    <tr><th>Схема</th><th>Как выглядит</th><th>Оценка</th></tr>
    <tr>
      <td class="am">Basic</td>
      <td><code class="ic">Authorization: Basic base64(user:pass)</code></td>
      <td><span class="rd">Base64 — это кодирование, а не шифрование.</span> Пароль летит в каждом запросе и разворачивается в одну строку. Допустимо только поверх TLS и только для служебных задач.</td>
    </tr>
    <tr>
      <td class="am">Digest</td>
      <td>хеш от пароля, nonce, метода и URI</td>
      <td>Пароль не передаётся, но схема использует устаревшие хеши и не защищает тело. Практически мертва.</td>
    </tr>
    <tr>
      <td class="gs">Bearer</td>
      <td><code class="ic">Authorization: Bearer eyJhbGciOi...</code></td>
      <td>Стандарт для API и OAuth. «Bearer» = <span class="hl">на предъявителя</span>: кто владеет токеном, тот и пользователь. Отсюда требование к транспорту и к сроку жизни.</td>
    </tr>
    <tr>
      <td class="cy">mTLS</td>
      <td>клиентский сертификат в TLS</td>
      <td>Сильнейший вариант. Стандарт для взаимодействия сервисов внутри инфраструктуры.</td>
    </tr>
  </table></div>
  <div class="card acc-r">
    <div class="card-t">⚡ ловушка вопроса «какая схема самая безопасная»</div>
    <p class="tx" style="margin:0">Ожидают не название, а рассуждение. Basic плох тем, что передаёт долговременный секрет в каждом запросе. Bearer лучше, но токен на предъявителя — украл значит вошёл, поэтому нужны короткий TTL, привязка к аудитории и HTTPS. Действительно сильные схемы — те, где секрет <span class="hl">не передаётся вообще</span>: mTLS и WebAuthn/passkeys, где происходит подпись челленджа приватным ключом, который не покидает устройство. WebAuthn заодно закрывает фишинг на уровне протокола: подпись привязана к origin, и поддельный домен её не получит.</p>
  </div>

  <h2 class="sect">пароли: как хранить</h2>
  <p class="tx">Пароль <span class="hl">никогда</span> не хранится в открытом виде и не шифруется обратимо. Хранится результат специальной медленной хеш-функции.</p>
  <div class="kv">
    <div class="kv-row"><div class="kv-k">Почему не SHA-256</div><div class="kv-v">Обычные хеши спроектированы быть <span class="hl">быстрыми</span>. На GPU их считают миллиардами в секунду — база утекла, пароли восстановлены за часы. Для паролей нужны намеренно медленные и требовательные к памяти функции.</div></div>
    <div class="kv-row"><div class="kv-k">Что использовать</div><div class="kv-v"><span class="gs">Argon2id</span> — текущая рекомендация OWASP: минимум 19 МиБ памяти, 2 итерации, параллелизм 1. Альтернативы: <span class="gs">scrypt</span>, <span class="gs">bcrypt</span> (work factor не ниже 10), PBKDF2 там, где требует сертификация.</div></div>
    <div class="kv-row"><div class="kv-k">Salt</div><div class="kv-v">Уникальное случайное значение <span class="hl">на каждого пользователя</span>, хранится рядом с хешем и не является секретом. Задача — сделать бесполезными радужные таблицы и не дать увидеть, что у двух юзеров одинаковый пароль.</div></div>
    <div class="kv-row"><div class="kv-k">Pepper</div><div class="kv-v">Глобальный секрет, <span class="hl">хранится отдельно от БД</span> (переменная окружения, HSM, Vault). Смысл: при утечке одной только базы хеши без него бесполезны. Salt и pepper решают разные задачи и не заменяют друг друга.</div></div>
  </div>

  <h2 class="sect">JWT — анатомия</h2>
  <p class="tx">JSON Web Token (RFC 7519) — компактный самодостаточный токен из трёх частей, разделённых точками. Каждая часть закодирована Base64URL.</p>
  <div class="ascii">  <span class="h">eyJhbGciOiJIUzI1NiJ9</span>.<span class="a">eyJzdWIiOiI0MiIsImV4cCI6MTc...}</span>.<span class="g">SflKxwRJSMeKKF2QT4f</span>
  <span class="h">└──── HEADER ─────┘</span> <span class="a">└────── PAYLOAD ──────────┘</span> <span class="g">└─── SIGNATURE ──┘</span>

  <span class="h">HEADER</span>    {"alg":"HS256","typ":"JWT"}     <span class="f">каким алгоритмом подписан</span>
  <span class="a">PAYLOAD</span>   {"sub":"42","role":"user",      <span class="f">claims — данные о субъекте</span>
             "exp":1767225600,"iss":"...",
             "aud":"...","jti":"..."}
  <span class="g">SIGNATURE</span> HMAC/RSA(header.payload, key)  <span class="f">подпись двух первых частей</span>

  <span class="r">ВАЖНО: payload НЕ зашифрован — это просто Base64.</span>
  <span class="r">Любой, у кого есть токен, читает его содержимое.</span>
  <span class="r">Подпись защищает от ИЗМЕНЕНИЯ, но не от ЧТЕНИЯ.</span></div>

  <div class="sec-box">
    <div class="sb-t">SEC ▸ классические промахи с JWT</div>
    <p class="tx"><span class="hl">decode вместо verify</span> — библиотека умеет и то, и другое, и разработчик берёт первое. Подпись не проверяется вообще: подставляй любой payload. Самая частая и самая тяжёлая ошибка.</p>
    <p class="tx"><span class="hl">alg: none</span> — исторически стандарт допускал «алгоритм без подписи». Если сервер доверяет полю <code class="ic">alg</code> из самого токена, атакующий ставит <code class="ic">none</code> и убирает подпись. Алгоритм должен быть <span class="hl">задан на сервере</span>, а не прочитан из токена.</p>
    <p class="tx"><span class="hl">algorithm confusion RS256 → HS256</span> — сервер ждёт асимметричную подпись, но принимает <code class="ic">alg</code> из токена. Атакующий подписывает токен HMAC, используя как секрет <span class="hl">публичный ключ</span> сервера, который общедоступен. Сервер проверяет HMAC тем же публичным ключом — сходится.</p>
    <p class="tx"><span class="hl">общий секрет HS256 на десятки сервисов</span> — компрометация любого одного сервиса позволяет подделывать токены за все остальные, а ротация требует одновременного передеплоя всего. Правильный паттерн: <span class="gs">RS256 или ES256</span>, приватный ключ только у auth-сервиса, остальные проверяют публичным через JWKS.</p>
    <p class="tx" style="margin-bottom:0"><span class="hl">не проверяются exp, aud, iss</span> — вечный токен, или токен от другого сервиса, принятый как свой.</p>
  </div>

  <div class="card acc-a">
    <div class="card-t">◇ logout при stateless-токене</div>
    <p class="tx" style="margin:0">Любимый вопрос. Полноценно отозвать подписанный токен нельзя — сервер не хранит его состояние. Рабочие подходы: <span class="hl">короткий TTL access-токена</span> (5-15 минут) плюс долгоживущий refresh, который хранится на сервере и отзывается; <span class="hl">блоклист по <code class="ic">jti</code></span> до момента истечения; <span class="hl">версия токена</span> в профиле пользователя — при logout инкрементируем, старые перестают проходить. Все три частично возвращают состояние на сервер — и это нормальная цена. Правильная формулировка на собесе: «полный stateless и мгновенный отзыв несовместимы, надо выбирать компромисс».</p>
  </div>

  <h2 class="sect">OAuth 2.0 — делегирование доступа</h2>
  <p class="tx">Задача OAuth: дать стороннему приложению доступ к твоим данным в другом сервисе <span class="hl">без передачи ему пароля</span>. Аналогия — ключ от машины для парковщика: он может завести и припарковать, но не откроет багажник и не поедет через полстраны.</p>
  <div class="kv">
    <div class="kv-row"><div class="kv-k">Resource Owner</div><div class="kv-v">Пользователь — владелец данных.</div></div>
    <div class="kv-row"><div class="kv-k">Client</div><div class="kv-v">Приложение, которое просит доступ.</div></div>
    <div class="kv-row"><div class="kv-k">Authorization Server</div><div class="kv-v">Проверяет личность пользователя и выдаёт токены.</div></div>
    <div class="kv-row"><div class="kv-k">Resource Server</div><div class="kv-v">Хранит данные, отдаёт их по валидному access-токену.</div></div>
  </div>

  <div class="svgbox">
    <svg viewBox="0 0 740 300" role="img" aria-label="OAuth 2.0 Authorization Code Flow">
      <text x="370" y="18" font-size="12" fill="#38bdf8" text-anchor="middle">AUTHORIZATION CODE FLOW (+ PKCE)</text>
      <g font-size="10.5" fill="#cdd9e5">
        <rect x="20" y="34" width="120" height="30" rx="5" fill="#0f1620" stroke="#38bdf8" stroke-opacity=".5"/>
        <text x="80" y="54" text-anchor="middle">Пользователь</text>
        <rect x="300" y="34" width="120" height="30" rx="5" fill="#0f1620" stroke="#ffb020" stroke-opacity=".5"/>
        <text x="360" y="54" text-anchor="middle">Client (app)</text>
        <rect x="580" y="34" width="140" height="30" rx="5" fill="#0f1620" stroke="#00e676" stroke-opacity=".5"/>
        <text x="650" y="54" text-anchor="middle">Auth Server</text>
      </g>
      <g stroke="#4a5a6e" stroke-width="1" stroke-dasharray="2 4">
        <line x1="80" y1="68" x2="80" y2="280"/><line x1="360" y1="68" x2="360" y2="280"/><line x1="650" y1="68" x2="650" y2="280"/>
      </g>
      <g font-size="9.5" fill="#7d8ea3">
        <line x1="80" y1="92" x2="352" y2="92" stroke="#38bdf8" stroke-width="1.3" marker-end="url(#a4)"/>
        <text x="216" y="86" text-anchor="middle" fill="#38bdf8">1 · «войти через X»</text>
        <line x1="360" y1="122" x2="642" y2="122" stroke="#ffb020" stroke-width="1.3" marker-end="url(#a5)"/>
        <text x="500" y="116" text-anchor="middle" fill="#ffb020">2 · редирект на /authorize + state + code_challenge</text>
        <line x1="650" y1="152" x2="88" y2="152" stroke="#00e676" stroke-width="1.3" marker-end="url(#a6)"/>
        <text x="370" y="146" text-anchor="middle" fill="#00e676">3 · экран логина и согласия</text>
        <line x1="80" y1="182" x2="642" y2="182" stroke="#38bdf8" stroke-width="1.3" marker-end="url(#a5)"/>
        <text x="360" y="176" text-anchor="middle" fill="#38bdf8">4 · пользователь одобряет</text>
        <line x1="650" y1="212" x2="368" y2="212" stroke="#00e676" stroke-width="1.3" marker-end="url(#a6)"/>
        <text x="510" y="206" text-anchor="middle" fill="#00e676">5 · редирект с CODE на redirect_uri</text>
        <line x1="360" y1="242" x2="642" y2="242" stroke="#c792ea" stroke-width="1.3" marker-end="url(#a5)"/>
        <text x="500" y="236" text-anchor="middle" fill="#c792ea">6 · CODE + client_secret + code_verifier</text>
        <line x1="650" y1="272" x2="368" y2="272" stroke="#c792ea" stroke-width="1.3" marker-end="url(#a6)"/>
        <text x="505" y="266" text-anchor="middle" fill="#c792ea">7 · access_token (+ refresh, + id_token в OIDC)</text>
      </g>
      <defs>
        <marker id="a4" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z" fill="#38bdf8"/></marker>
        <marker id="a5" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z" fill="#ffb020"/></marker>
        <marker id="a6" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z" fill="#00e676"/></marker>
      </defs>
    </svg>
    <div class="svgcap">Смысл двух шагов вместо одного: <span class="cy">code</span> проходит через браузер и виден в URL, но без <code class="ic">client_secret</code> и <code class="ic">code_verifier</code> он бесполезен. Токен же передаётся напрямую между серверами и в браузер не попадает.</div>
  </div>

  <div class="kv">
    <div class="kv-row"><div class="kv-k">Authorization Code</div><div class="kv-v">Основной и рекомендуемый поток. Для публичных клиентов (SPA, мобильные) обязательно с <span class="hl">PKCE</span>.</div></div>
    <div class="kv-row"><div class="kv-k">Client Credentials</div><div class="kv-v">Сервис-сервис, пользователя в схеме нет вообще.</div></div>
    <div class="kv-row"><div class="kv-k">Implicit</div><div class="kv-v"><span class="rd">Устарел.</span> Токен возвращался прямо во фрагменте URL — утекал в историю, referrer и расширения. Не использовать в новых системах.</div></div>
    <div class="kv-row"><div class="kv-k">Password (ROPC)</div><div class="kv-v"><span class="rd">Устарел.</span> Приложение получает логин и пароль напрямую — то есть ровно то, чего OAuth должен был избежать.</div></div>
  </div>

  <div class="card acc-r">
    <div class="card-t">⚡ главный вопрос: OAuth — это аутентификация?</div>
    <p class="tx"><span class="hl">Нет.</span> OAuth 2.0 — протокол <span class="cy">авторизации</span> (делегирования доступа). Он отвечает на вопрос «можно ли этому приложению читать твой профиль», а не «кто ты». Access-токен вообще ничего не говорит о личности пользователя: он говорит о правах.</p>
    <p class="tx" style="margin-bottom:0">Использовать голый OAuth для логина — классическая ошибка, и она ломается конкретно: приложение принимает access-токен как доказательство личности, но токен, выданный <span class="rd">другому клиенту</span>, тоже пройдёт проверку — это <span class="cy">token substitution</span>. Правильный инструмент — <span class="gs">OpenID Connect</span>: тонкий слой поверх OAuth 2.0, который добавляет <code class="ic">id_token</code> (JWT с проверяемыми полями <code class="ic">iss</code>, <code class="ic">aud</code>, <code class="ic">sub</code>, <code class="ic">nonce</code>), эндпоинт <code class="ic">/userinfo</code> и discovery-документ. Формула для собеса: <span class="hl">OAuth = authorization, OIDC = authentication поверх OAuth</span>.</p>
  </div>

  <div class="sec-box">
    <div class="sb-t">SEC ▸ где ломают OAuth</div>
    <p class="tx"><span class="hl">Слабая валидация redirect_uri</span> — сервер сверяет адрес по префиксу или разрешает подстановку. Атакующий подсовывает жертве ссылку авторизации со своим redirect_uri, код улетает ему, он меняет его на токен. Правильно — <span class="hl">точное совпадение</span> со списком заранее зарегистрированных адресов.</p>
    <p class="tx"><span class="hl">Отсутствие параметра state</span> — открывает CSRF на этапе авторизации: атакующий привязывает свой аккаунт к сессии жертвы. Параметр обязателен и должен проверяться при возврате.</p>
    <p class="tx" style="margin-bottom:0"><span class="hl">Перехват кода у публичного клиента</span> — у SPA и мобильных приложений нет секрета, который можно спрятать. Решается PKCE: клиент заранее шлёт хеш случайного <code class="ic">code_verifier</code>, а при обмене предъявляет сам verifier. Перехваченный код без него бесполезен.</p>
  </div>

  <h2 class="sect">MFA и SSO кратко</h2>
  <div class="grid2">
    <div class="card acc-c"><div class="card-t">MFA — факторы</div><p class="tx" style="font-size:12px;margin:0">Что знаешь (пароль), что имеешь (телефон, ключ), чем являешься (биометрия). Настоящая MFA — из <span class="hl">разных категорий</span>. По устойчивости: SMS слабее всего (SIM swap, перехват), TOTP лучше, <span class="gs">аппаратный ключ или passkey по WebAuthn — единственный вариант, устойчивый к фишингу</span>, потому что подпись привязана к origin.</p></div>
    <div class="card acc-p"><div class="card-t">SSO — единый вход</div><p class="tx" style="font-size:12px;margin:0">Один вход — доступ ко многим приложениям. В корпоративной среде обычно <span class="cy">SAML</span> (XML-based, отсюда XXE и атаки на подпись XML), в потребительской — <span class="cy">OIDC</span>. Плюс — централизованный контроль и мгновенное отключение уволенного. Минус — <span class="rd">единая точка отказа</span>: компрометация identity provider даёт всё сразу.</p></div>
  </div>

  <div class="ask-box">
    <div class="sb-t">на собесе спросят</div>
    <div class="q">— Скомпрометирован секрет, которым подписаны все сессионные JWT. Что делаешь?</div>
    <div class="a">По шагам: (1) немедленно ротировать ключ и инвалидировать все выданные токены — практически это принудительный релогин всех пользователей; (2) если поддерживается несколько ключей через <code class="ic">kid</code> и JWKS, ввести новый ключ и вывести старый из доверенных; (3) расследовать, как утёк, — секрет в репозитории, в переменных CI, в логах; (4) устранить архитектурную причину: перейти с общего HS256 на RS256/ES256, чтобы приватный ключ был только у auth-сервиса; (5) убрать секреты из кода в менеджер секретов, включить автоматическую ротацию и сканирование репозиториев. Собеседующий ждёт именно связки «немедленные действия + устранение первопричины».</div>
    <div class="q">— Чем IDOR отличается от Broken Access Control?</div>
    <div class="a">IDOR — это <span class="hl">частный случай</span> Broken Access Control, а не отдельная категория. Broken Access Control (A01) — вся семья: горизонтальная эскалация (доступ к данным равного пользователя), вертикальная (доступ к функциям администратора), обход через path traversal, обход через прямой вызов API. IDOR — конкретно про доступ к объекту по его идентификатору без проверки владельца. На собесе полезно назвать иерархию, а не просто определение.</div>
    <div class="q">— Как правильно связать access и refresh токены?</div>
    <div class="a">Access — короткий (5-15 минут), в cookie с HttpOnly, Secure, SameSite. Refresh — длинный (дни-недели), в cookie с HttpOnly, Secure, <code class="ic">SameSite=Strict</code> и <span class="hl">узким Path</span>, чтобы он не летел в каждом запросе. Refresh должен быть <span class="hl">одноразовым (rotating)</span>: при использовании выдаётся новый, старый гасится. Если сервер видит повторное применение уже погашенного refresh — это признак кражи, и правильная реакция — инвалидировать всю цепочку и потребовать повторный вход.</div>
  </div>

  <h2 class="sect">референсы модуля</h2>
  <a class="ref owasp" href="https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html" target="_blank" rel="noopener"><span class="r-t">OWASP — Password Storage Cheat Sheet</span><span class="r-d">актуальные параметры Argon2id, bcrypt и scrypt. Отсюда цифры 19 МиБ / 2 итерации.</span><span class="r-u">cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html</span></a>
  <a class="ref rfc" href="https://datatracker.ietf.org/doc/html/rfc6749" target="_blank" rel="noopener"><span class="r-t">RFC 6749 — OAuth 2.0</span><span class="r-d">первоисточник: роли, потоки, параметры. Раздел 4.1 — тот самый authorization code flow.</span><span class="r-u">datatracker.ietf.org/doc/html/rfc6749</span></a>
  <a class="ref rfc" href="https://datatracker.ietf.org/doc/html/rfc7519" target="_blank" rel="noopener"><span class="r-t">RFC 7519 — JSON Web Token</span><span class="r-d">структура токена и стандартные claims.</span><span class="r-u">datatracker.ietf.org/doc/html/rfc7519</span></a>
  <a class="ref" href="https://openid.net/developers/how-connect-works/" target="_blank" rel="noopener"><span class="r-t">OpenID Connect — how it works</span><span class="r-d">объяснение от самого консорциума: чем OIDC дополняет OAuth и зачем нужен id_token.</span><span class="r-u">openid.net/developers/how-connect-works</span></a>
  <a class="ref ps" href="https://portswigger.net/web-security/oauth" target="_blank" rel="noopener"><span class="r-t">PortSwigger — OAuth authentication vulnerabilities</span><span class="r-d">разбор всех классических ошибок с лабами: redirect_uri, state, утечка кода.</span><span class="r-u">portswigger.net/web-security/oauth</span></a>
  <a class="ref ps" href="https://portswigger.net/web-security/jwt" target="_blank" rel="noopener"><span class="r-t">PortSwigger — JWT attacks</span><span class="r-d">alg none, algorithm confusion, jwk и jku injection. С практикой.</span><span class="r-u">portswigger.net/web-security/jwt</span></a>

  <h2 class="sect">checkpoint: секция STATE</h2>
  <p class="tx">Самая насыщенная секция позади. Эти вопросы почти дословно повторяют то, что спрашивают на собеседованиях по AppSec.</p>
  <div id="quiz-state"></div>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('auth');go('sop')">[✓] завершить секцию → Same-Origin Policy</button>
  </div>
</section>`;
