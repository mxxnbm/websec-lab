/* ===== LAB: m11 cookie flags ===== */
function buildCookieLab(){
  mkToggleLab('cookieLab','ck',[
    {id:'httponly',k:'HttpOnly',c:'#00e676',on:false},
    {id:'secure',k:'Secure',c:'#38bdf8',on:false},
    {id:'lax',k:'SameSite=Lax',c:'#ffb020',on:false},
    {id:'strict',k:'SameSite=Strict',c:'#ff5370',on:false},
    {id:'host',k:'__Host- префикс',c:'#c792ea',on:false},
    {id:'domain',k:'Domain=example.com',c:'#ff6ac1',on:false}
  ],function(st){
    const name=st.host?'__Host-sid':'sid';
    let parts=[name+'=a3f9c1b0'];
    if(st.host){parts.push('Secure');parts.push('Path=/');}
    else{
      if(st.secure)parts.push('Secure');
      if(st.domain)parts.push('Domain=example.com');
      parts.push('Path=/');
    }
    if(st.strict)parts.push('SameSite=Strict');
    else if(st.lax)parts.push('SameSite=Lax');
    if(st.httponly)parts.push('HttpOnly');
    const hdr='<span class="fn">Set-Cookie</span>: '+parts.join('; ');

    const rows=[];
    rows.push(['Кража через XSS (document.cookie)',
      st.httponly?['gs','защищено']:['rd','УЯЗВИМО'],
      st.httponly?'JS не видит cookie. Но XSS всё ещё может действовать от имени жертвы.':'Скрипт читает document.cookie и отправляет значение атакующему.']);
    rows.push(['Перехват по открытому HTTP',
      (st.secure||st.host)?['gs','защищено']:['rd','УЯЗВИМО'],
      (st.secure||st.host)?'Cookie уходит только по HTTPS.':'Любой случайный HTTP-запрос на домен утащит cookie в открытом виде.']);
    rows.push(['CSRF через cross-site POST',
      (st.strict||st.lax)?['gs','защищено']:['am','по умолчанию Lax'],
      (st.strict||st.lax)?'Cookie не уйдёт в cross-site POST.':'Явного SameSite нет. Chrome применит Lax по умолчанию, но останется окно ~120 секунд после установки cookie, когда cross-site POST пройдёт.']);
    rows.push(['CSRF через ссылку (top-level GET)',
      st.strict?['gs','защищено']:['rd','УЯЗВИМО'],
      st.strict?'Strict не отправляет cookie даже при переходе по ссылке — но ломает UX перехода из писем и поиска.':'Lax пропускает top-level navigation GET. Если есть эндпоинт вида GET /transfer?to=X — он отработает.']);
    rows.push(['Cookie tossing со скомпрометированного поддомена',
      st.host?['gs','защищено']:['rd','УЯЗВИМО'],
      st.host?'__Host- запрещает атрибут Domain и привязывает cookie к одному хосту — поддомен не перезапишет.':'Поддомен может выставить свою cookie с Domain=example.com и подменить сессию на главном домене.']);
    rows.push(['Чтение cookie с соседнего поддомена',
      (st.host||!st.domain)?['gs','ограничено']:['am','доступна всем поддоменам'],
      (st.host||!st.domain)?'Cookie host-only: видна только на выдавшем хосте.':'С Domain=example.com cookie доступна на всех поддоменах, включая уязвимые.']);

    let h='<div class="code" style="margin:0 0 14px">'+hdr+'</div>';
    h+='<div style="display:flex;flex-direction:column;gap:6px">';
    rows.forEach(function(r){
      const cls=r[1][0],lbl=r[1][1];
      const col=cls==='gs'?'#00e676':(cls==='am'?'#ffb020':'#ff5370');
      h+='<div style="border:1px solid rgba(56,189,248,.14);border-left:3px solid '+col+';border-radius:0 7px 7px 0;padding:9px 12px;background:#0c111a">'
        +'<div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap">'
        +'<span style="font-size:12.5px;color:#cdd9e5">'+r[0]+'</span>'
        +'<span style="margin-left:auto;font-size:10px;letter-spacing:1px;color:'+col+'">'+lbl+'</span></div>'
        +'<div style="font-size:11.5px;color:#7d8ea3;line-height:1.6;margin-top:4px">'+r[2]+'</div></div>';
    });
    h+='</div>';
    h+='<div style="margin-top:12px;padding:10px 12px;background:rgba(199,146,234,.07);border-left:2px solid #c792ea;border-radius:0 6px 6px 0;font-size:11.5px;color:#7d8ea3;line-height:1.7">'
      +'<span style="color:#c792ea">ЦЕЛЬ ▸ </span>эталон для сессионной cookie: <code class="ic">__Host-</code> + <code class="ic">HttpOnly</code> + <code class="ic">Secure</code> + <code class="ic">SameSite</code>. '
      +'И помни: <b>никакая комбинация флагов не защищает от XSS</b> — скрипт исполняется в том же origin, и его запросы не являются cross-site.</div>';
    return h;
  });
}

/* ===== LAB: m11 session vs token ===== */
function buildSessionLab(){
  mkStepLab('sessionLab','se',[
    {n:'1',t:'Логин: сервер проверяет пароль',c:'#38bdf8',
     d:'Оба сценария начинаются одинаково: клиент шлёт логин и пароль по HTTPS, сервер сверяет хеш.',
     code:'<span class="fn">POST</span> /login\nContent-Type: application/json\n\n{"user":"alice","pass":"..."}',
     sec:'Здесь же живут проблемы аутентификации: отсутствие rate limiting (перебор), разные ответы для существующего и несуществующего логина (user enumeration), слабые требования к паролю.'},
    {n:'2a',t:'Вариант A: серверная сессия',c:'#00e676',
     d:'Сервер создаёт запись в хранилище (Redis, БД) и выдаёт клиенту только <b>случайный идентификатор</b>. Все данные о пользователе остаются на сервере.',
     code:'<span class="cmt"># на сервере</span>\nsessions["a3f9c1b0..."] = {user_id: 42, role: "user", exp: ...}\n\n<span class="cmt"># клиенту</span>\n<span class="fn">Set-Cookie</span>: __Host-sid=a3f9c1b0...; Secure; HttpOnly; SameSite=Lax; Path=/',
     sec:'Идентификатор обязан быть криптостойким, не менее 128 бит энтропии. Предсказуемый ID (счётчик, время, хеш от логина) = угон чужой сессии перебором. И обязательна ротация ID после логина, иначе возможна session fixation.'},
    {n:'2b',t:'Вариант B: подписанный токен',c:'#c792ea',
     d:'Сервер не хранит ничего. Он формирует токен с данными о пользователе и <b>подписывает</b> его своим ключом. Проверка потом — чистая математика, без похода в хранилище.',
     code:'<span class="cmt"># токен содержит данные внутри себя</span>\nheader:  {"alg":"RS256","typ":"JWT","kid":"2026-01"}\npayload: {"sub":"42","role":"user","exp":1767225600}\nsignature: RSA(header.payload, private_key)',
     sec:'Payload — обычный Base64, <b>не шифрование</b>: любой владелец токена читает содержимое. Не клади туда персональные данные. Алгоритм проверки задаётся на сервере, а не берётся из поля alg токена.'},
    {n:'3',t:'Следующий запрос',c:'#ffb020',
     d:'В обоих случаях браузер сам приложит cookie. Разница в том, что делает сервер: в варианте A он идёт в хранилище за сессией, в варианте B — проверяет подпись и читает данные прямо из токена.',
     sec:'Именно из «браузер приложит сам» и растёт CSRF — cookie отправится и к запросу, инициированному чужим сайтом. Если же токен кладут в заголовок Authorization вручную, CSRF не работает, но токен приходится хранить там, где до него дотянется XSS.'},
    {n:'4',t:'Logout — вот где разница',c:'#ff5370',
     d:'Вариант A: удалили запись из хранилища — сессия мертва мгновенно. Вариант B: <b>отозвать подписанный токен нельзя</b>, он остаётся валидным до истечения exp, даже если пользователь «вышел».',
     code:'<span class="cmt"># A — работает сразу</span>\ndel sessions["a3f9c1b0..."]\n\n<span class="cmt"># B — обходные пути</span>\nблоклист по jti  ·  короткий TTL + refresh  ·  версия токена в профиле',
     sec:'Практическое следствие: уволили сотрудника, отозвали доступ — а его токен живёт ещё 15 минут. Все обходные пути частично возвращают состояние на сервер. Честная формулировка: <b>полный stateless и мгновенный отзыв несовместимы</b>.'},
    {n:'5',t:'Что выбрать',c:'#5c9eff',
     d:'Классическое веб-приложение с одним бэкендом — <b>серверная сессия</b>: проще, безопаснее, отзывается мгновенно. Микросервисы, мобильные клиенты, межсервисные вызовы — <b>токены</b>, ради масштабирования. Частая гибридная схема: короткий access-токен плюс отзываемый refresh, оба в cookie с HttpOnly.',
     sec:'Ответ «всегда JWT» на собеседовании — красный флаг. JWT решает задачу масштабирования и межсервисного доверия, а не «современности». Для монолита с одной базой серверная сессия обычно строго лучше.'}
  ]);
}

/* ===== LAB: m12 access control ===== */
function buildAuthzLab(){
  mkSelLab('authzLab','az',[
    {k:'Чужой заказ',c:'#ff5370',t:'IDOR / BOLA — доступ к чужому объекту',
     d:'Пользователь открывает свой заказ по адресу <code class="ic">/api/orders/1042</code>. Меняет цифру на 1043 — и видит чужой заказ с адресом доставки и телефоном.',
     code:'<span class="cmt">// есть проверка «залогинен ли»</span>\n<span class="kw">if</span> (!session.user) <span class="kw">return</span> 401;\n<span class="kw">return</span> db.orders.find(req.params.id);   <span class="cmt">← НЕТ проверки владельца</span>\n\n<span class="cmt">// правильно</span>\n<span class="kw">const</span> order = db.orders.find(req.params.id);\n<span class="kw">if</span> (order.user_id !== session.user.id) <span class="kw">return</span> 404;',
     sec:'Отсутствует <b>авторизация на уровне объекта</b>. Аутентификация есть — личность подтверждена, — а проверки «а твой ли это объект» нет. A01:2025. Возврат 404 вместо 403 дополнительно не подтверждает существование чужого объекта.'},
    {k:'Скрытая кнопка',c:'#ffb020',t:'BFLA — доступ к чужой функции',
     d:'Кнопка «удалить пользователя» показывается только администраторам. Обычный пользователь находит эндпоинт в бандле фронтенда и вызывает его напрямую из curl — операция выполняется.',
     code:'<span class="cmt">// фронтенд</span>\n{user.isAdmin &amp;&amp; &lt;DeleteButton /&gt;}       <span class="cmt">← это UI, не защита</span>\n\n<span class="cmt">// бэкенд — проверки роли нет вообще</span>\napp.delete(<span class="st">"/api/admin/users/:id"</span>, (req,res) =&gt; { ... });',
     sec:'Отсутствует <b>авторизация на уровне функции</b>. Скрытие в интерфейсе не является контролем доступа: код фронтенда полностью доступен пользователю. Проверять роль надо на сервере, на каждом эндпоинте.'},
    {k:'Смена роли',c:'#c792ea',t:'Mass assignment — вертикальная эскалация',
     d:'Форма редактирования профиля отправляет имя и почту. Атакующий добавляет в JSON поле <code class="ic">"role":"admin"</code>, и сервер применяет весь объект к модели целиком.',
     code:'<span class="cmt">// уязвимо</span>\nUser.update(req.params.id, req.body);          <span class="cmt">← всё, что прислали</span>\n\n<span class="cmt">// правильно — явный список разрешённых полей</span>\nUser.update(id, pick(req.body, [<span class="st">"name"</span>, <span class="st">"email"</span>]));',
     sec:'Allowlist полей, а не попытка отфильтровать «опасные». Отдельно: поля вроде role, balance, is_verified не должны быть доступны для записи через тот же эндпоинт, что и профиль.'},
    {k:'Прямой путь',c:'#00e676',t:'Обход через путь и метод',
     d:'Доступ к <code class="ic">/admin</code> закрыт правилом на прокси. Но правило написано для точного пути, а приложение нормализует <code class="ic">/Admin</code>, <code class="ic">/admin/</code>, <code class="ic">/admin/..;/</code> и <code class="ic">%2fadmin</code> одинаково.',
     code:'<span class="cmt"># на прокси</span>\nlocation = /admin { deny all; }\n\n<span class="cmt"># проходит мимо правила</span>\nGET /Admin        GET /admin/     GET /./admin\nGET /%61dmin      X-Original-URL: /admin',
     sec:'Классический разрыв между двумя парсерами: прокси и приложение по-разному нормализуют путь. Правильно — контроль доступа <b>в приложении</b>, а не только на периметре. Сетевые правила как единственная защита ненадёжны.'},
    {k:'Логика',c:'#38bdf8',t:'Ошибка бизнес-логики',
     d:'В корзине можно указать количество товара. Атакующий отправляет отрицательное значение — сумма заказа становится отрицательной, и баланс пополняется.',
     code:'<span class="cmt">// нет проверки границ</span>\ntotal = item.price * req.body.qty;      <span class="cmt">qty = -10 → total &lt; 0</span>\n\n<span class="cmt">// плюс отдельно: гонка</span>\n<span class="cmt">// 20 одновременных запросов «применить промокод»</span>\n<span class="cmt">// проходят проверку «использован?» до того, как первый успел записать</span>',
     sec:'Такие баги не находит ни один сканер — только понимание предметной области. Сюда же race conditions: проверка и изменение состояния не атомарны. Лечится транзакциями, блокировками и идемпотентными ключами.'}
  ]);
}
