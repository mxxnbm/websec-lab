/* ---------- m01 · WHAT IS THE WEB ---------- */
const V_WEB = `
<section class="view" id="view-web">
  <div class="eyebrow">basics · модуль 01 · источники: MDN · CERN · O'Reilly</div>
  <h1 class="vtitle">Что такое <span class="accent">веб</span></h1>
  <p class="vlede">Начнём с путаницы, которую тащат почти все: «интернет» и «веб» — не синонимы. Разберём, чем они отличаются, откуда веб вообще взялся, из каких файлов состоит любой сайт и что стоит за словами «Web 1.0» и «Web 2.0». Без этого дальше будет каша.</p>

  <h2 class="sect">интернет ≠ веб</h2>
  <p class="tx">MDN формулирует это одной фразой: <span class="hl">интернет — это инфраструктура, а веб — сервис, построенный поверх неё</span>. Интернет — физическая сеть: кабели, оптика, роутеры, спутники, протоколы маршрутизации. Веб (World Wide Web) — один из сервисов, которые по этой сети работают. Не единственный: почта (SMTP), передача файлов (FTP), DNS, видеозвонки, торренты, SSH — всё это тоже интернет, но это не веб.</p>

  <div class="ascii"><span class="f">┌──────────────────────────────────────────────────────────────┐</span>
<span class="f">│</span>  <span class="h">СЕРВИСЫ</span>   <span class="g">WEB</span>      EMAIL     FTP      SSH     VoIP    ...   <span class="f">│</span>
<span class="f">│</span>            <span class="g">HTTP/S</span>     SMTP    FTP/SFTP   SSH     SIP           <span class="f">│</span>
<span class="f">├──────────────────────────────────────────────────────────────┤</span>
<span class="f">│</span>  <span class="h">ИНТЕРНЕТ</span>  TCP · UDP · QUIC  →  IP  →  Ethernet / Wi-Fi / 5G <span class="f">│</span>
<span class="f">│</span>            кабели · оптика · роутеры · дата-центры            <span class="f">│</span>
<span class="f">└──────────────────────────────────────────────────────────────┘</span>

    Интернет — <span class="a">дорога</span>.  Веб — <span class="g">магазины вдоль неё</span>.
    Почта и SSH ездят по той же дороге, но это другие здания.</div>

  <h2 class="sect">откуда взялся веб</h2>
  <p class="tx">Веб придумал один человек в одной организации, и это можно проследить по датам — полезно знать, потому что многие «странности» веба объясняются именно тем, что он проектировался как система обмена научными документами, а не как платформа для банков.</p>

  <div class="svgbox">
    <svg viewBox="0 0 760 200" role="img" aria-label="Таймлайн истории веба 1989-2005">
      <line x1="40" y1="96" x2="720" y2="96" stroke="#0ea5c4" stroke-width="2"/>
      <g fill="#38bdf8">
        <circle cx="70" cy="96" r="6"/><circle cx="200" cy="96" r="6"/><circle cx="330" cy="96" r="6"/>
        <circle cx="460" cy="96" r="6"/><circle cx="600" cy="96" r="6"/><circle cx="700" cy="96" r="6"/>
      </g>
      <g font-size="12" fill="#cdd9e5" text-anchor="middle">
        <text x="70" y="76">1989</text><text x="200" y="76">1990</text><text x="330" y="76">1991</text>
        <text x="460" y="76">1993</text><text x="600" y="76">2004-05</text><text x="700" y="76">2014</text>
      </g>
      <g font-size="10.5" fill="#7d8ea3" text-anchor="middle">
        <text x="70" y="122">предложение</text><text x="70" y="136">Berners-Lee</text><text x="70" y="150">в CERN</text>
        <text x="200" y="122">первый сервер</text><text x="200" y="136">и браузер</text><text x="200" y="150">WorldWideWeb</text>
        <text x="330" y="122">выход за</text><text x="330" y="136">пределы CERN</text>
        <text x="460" y="122">30 апреля:</text><text x="460" y="136">код в public</text><text x="460" y="150">domain</text>
        <text x="600" y="122">термин</text><text x="600" y="136">Web 2.0</text><text x="600" y="150">(O'Reilly)</text>
        <text x="700" y="122">термин</text><text x="700" y="136">Web3</text><text x="700" y="150">(G. Wood)</text>
      </g>
      <text x="380" y="24" font-size="12" fill="#38bdf8" text-anchor="middle">ТАЙМЛАЙН: КАК ПОЯВИЛСЯ И МЕНЯЛСЯ ВЕБ</text>
      <text x="380" y="44" font-size="10.5" fill="#4a5a6e" text-anchor="middle">от служебной системы физиков до платформы, на которой держится экономика</text>
    </svg>
    <div class="svgcap">Ключевая дата для нас — <span class="cy">30 апреля 1993</span>: CERN отдал код веба бесплатно и без лицензионных отчислений. Именно это, а не техническое превосходство, сделало веб победителем.</div>
  </div>

  <div class="card acc-p">
    <div class="card-t">◇ почему это важно для AppSec</div>
    <p class="tx" style="margin:0">Веб проектировался в 1989 году для обмена статическими документами между физиками, которые друг другу доверяли. В нём изначально <span class="hl">не было</span> ни аутентификации, ни шифрования, ни разграничения доступа. Всё это навешивалось сверху десятилетиями — cookies, TLS, Same-Origin Policy, CSP. Отсюда главная особенность безопасности веба: <span class="rd">почти каждый защитный механизм — это заплатка поверх системы, которая изначально была открытой</span>. И почти каждая заплатка имеет обходы, потому что должна сохранять обратную совместимость с миром без неё.</p>
  </div>

  <h2 class="sect">модель клиент-сервер</h2>
  <p class="tx">Весь веб держится на одной идее: есть <span class="cy">клиент</span> (тот, кто просит) и <span class="gs">сервер</span> (тот, кто отдаёт). Твой браузер — клиент. Он шлёт запрос, сервер присылает ответ. Всё. Любая загрузка страницы, клик, отправка формы — это запрос от клиента и ответ сервера.</p>

  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>client-server.live · участники и как летит запрос</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Кликай участников модели — узнаешь роль каждого. Потом жми «отправить запрос» и смотри, как летит запрос и ответ:</p>
      <div id="webLab"></div>
    </div>
  </div>

  <h2 class="sect">из чего состоит сайт</h2>
  <p class="tx">Когда сервер отдаёт сайт — он присылает не «страницу», а <span class="hl">набор отдельных файлов</span>. Браузер сначала получает HTML, разбирает его и по ходу дела шлёт новые запросы за всем, на что HTML ссылается. Одна «страница» = десятки, иногда сотни HTTP-запросов.</p>
  <div class="grid2">
    <div class="card acc-c">
      <div class="card-t">Код</div>
      <p class="tx" style="font-size:12px;margin:0"><span class="pk">HTML</span> — структура (скелет страницы), <span class="cy">CSS</span> — оформление (как выглядит), <span class="am">JavaScript</span> — поведение (что делает при клике). Три кита фронтенда, разберём подробно в модуле 07.</p>
    </div>
    <div class="card acc-g">
      <div class="card-t">Ресурсы (assets)</div>
      <p class="tx" style="font-size:12px;margin:0">Всё остальное: картинки, видео, шрифты, PDF, иконки, JSON с данными. Браузер подтягивает их отдельными запросами по мере разбора HTML.</p>
    </div>
  </div>

  <div class="sec-box">
    <div class="sb-t">SEC ▸ каждый файл — это отдельная поверхность атаки</div>
    <p class="tx">Раз страница собирается из десятков файлов с разных доменов (CDN, аналитика, шрифты Google, виджет чата), то <span class="hl">компрометация любого из них компрометирует страницу целиком</span>. Внедрённый через CDN скрипт исполняется с теми же правами, что и твой собственный код — браузер их не различает. Это называется <span class="rd">supply chain attack</span>, и это A03 в OWASP Top 10:2025. Защита — Subresource Integrity и CSP, до них дойдём в секции 06.</p>
  </div>

  <h2 class="sect">web 1.0 → web 2.0 → и что за web3</h2>
  <p class="tx">Эти термины постоянно всплывают на собеседованиях и в статьях, и вокруг них много мути. Разложим честно.</p>

  <div class="twrap"><table class="t">
    <tr><th>Поколение</th><th>Что это</th><th>Технически</th><th>Статус термина</th></tr>
    <tr>
      <td class="cy">Web 1.0<br><span class="dm">~1991-2004</span></td>
      <td>Веб «только для чтения». Статические HTML-страницы, которые кто-то один написал, а все остальные читают. Гостевые книги и счётчики посещений как вершина интерактивности.</td>
      <td>Сервер отдаёт готовый HTML-файл с диска. Каждое действие = полная перезагрузка страницы.</td>
      <td class="am">неформальный, придуман задним числом — стандарта нет</td>
    </tr>
    <tr>
      <td class="gs">Web 2.0<br><span class="dm">~2004-...</span></td>
      <td>Веб «для чтения и записи». Контент создают пользователи: соцсети, вики, блоги, комментарии, YouTube. Сайт превращается в приложение.</td>
      <td>AJAX — страница обновляет куски себя без перезагрузки. Сервер отдаёт данные (JSON), а не готовый HTML. Отсюда API, SPA, мобильные приложения поверх того же бэкенда.</td>
      <td class="gs">термин Tim O'Reilly и Dale Dougherty, статья 2005 года</td>
    </tr>
    <tr>
      <td class="pu">Web 3.0<br><span class="dm">Semantic Web</span></td>
      <td>Видение самого Бернерса-Ли: веб данных, который понимают машины. Не «страница про фильм», а структурированные данные о фильме, которые может обработать программа.</td>
      <td>RDF, OWL, SPARQL, микроразметка schema.org. Частично живёт: именно из-за неё поисковики показывают карточки товаров и рейтинги.</td>
      <td class="pu">W3C, roadmap 1998</td>
    </tr>
    <tr>
      <td class="rd">Web3<br><span class="dm">без точки!</span></td>
      <td><span class="hl">Другое понятие.</span> Децентрализованный веб на блокчейне: кошельки вместо аккаунтов, смарт-контракты вместо бэкенда, токены.</td>
      <td>Ethereum и другие блокчейны, dApps, IPFS, подпись транзакций кошельком вместо логина по паролю.</td>
      <td class="rd">термин Gavin Wood, 2014</td>
    </tr>
  </table></div>

  <div class="ask-box">
    <div class="sb-t">на собесе спросят</div>
    <div class="q">— В чём разница между Web 3.0 и Web3?</div>
    <div class="a">Это два независимых понятия с похожими названиями. <span class="cy">Web 3.0 / Semantic Web</span> — концепция Бернерса-Ли конца 90-х про машиночитаемые данные (RDF, микроразметка). <span class="rd">Web3</span> — термин Гэвина Вуда 2014 года про децентрализацию на блокчейне. Общего у них — только маркетинговое созвучие. Если интервьюер спрашивает про «Web 3.0», уточни, что он имеет в виду — это сам по себе хороший сигнал, что ты в теме.</div>
    <div class="q">— Почему в вебе так много «костылей» в безопасности?</div>
    <div class="a">Потому что обратная совместимость. Веб нельзя «выключить и переписать» — миллиарды страниц продолжают работать по правилам 1995 года. Поэтому каждый новый защитный механизм (SameSite, CSP, HSTS) вводится как <span class="hl">opt-in</span>: по умолчанию всё работает по-старому, а безопасное поведение надо включить явно. Отсюда следствие для AppSec: <span class="rd">небезопасная конфигурация — это конфигурация по умолчанию</span>.</div>
  </div>

  <h2 class="sect">референсы модуля</h2>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work" target="_blank" rel="noopener"><span class="r-t">MDN — How does the Internet work</span><span class="r-d">разграничение «интернет как инфраструктура / веб как сервис» дословно отсюда.</span><span class="r-u">developer.mozilla.org/.../How_does_the_Internet_work</span></a>
  <a class="ref" href="https://home.cern/science/computing/birth-web/short-history-web" target="_blank" rel="noopener"><span class="r-t">CERN — A short history of the Web</span><span class="r-d">первоисточник по датам: 1989 предложение, 1990 первый сервер, 30.04.1993 public domain.</span><span class="r-u">home.cern/science/computing/birth-web/short-history-web</span></a>
  <a class="ref" href="https://www.w3.org/History/1989/proposal.html" target="_blank" rel="noopener"><span class="r-t">Оригинальное предложение Berners-Lee (1989)</span><span class="r-d">тот самый документ, с которого начался веб. Прочитай хотя бы по диагонали — там видно исходную модель доверия.</span><span class="r-u">w3.org/History/1989/proposal.html</span></a>
  <a class="ref" href="https://www.oreilly.com/pub/a/web2/archive/what-is-web-20.html" target="_blank" rel="noopener"><span class="r-t">Tim O'Reilly — What Is Web 2.0 (2005)</span><span class="r-d">статья, которая ввела термин. «Web as platform» — оттуда.</span><span class="r-u">oreilly.com/pub/a/web2/archive/what-is-web-20.html</span></a>
  <a class="ref" href="https://www.w3.org/DesignIssues/Semantic.html" target="_blank" rel="noopener"><span class="r-t">Berners-Lee — Semantic Web Road map</span><span class="r-d">первоисточник по Web 3.0 в изначальном смысле (не блокчейн).</span><span class="r-u">w3.org/DesignIssues/Semantic.html</span></a>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('web');go('net')">[✓] завершить → сеть, IP и DNS</button>
  </div>
</section>`;
