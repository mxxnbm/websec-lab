/* ---------- m17 · OWASP MAP / NEXT ---------- */
const V_OWASP = `
<section class="view" id="view-owasp">
  <div class="eyebrow">next · модуль 17 · источник: OWASP Top 10:2025</div>
  <h1 class="vtitle">Карта <span class="accent">OWASP Top 10</span></h1>
  <p class="vlede">Фундамент собран. Теперь — общий язык, на котором говорит вся индустрия. OWASP Top 10 не список уязвимостей, а <span class="hl">список категорий рисков</span>, составленный на основе данных о реальных находках. Актуальная редакция — <span class="cy">2025</span>, она сменила версию 2021. Здесь мы не разбираем каждую категорию вглубь: задача модуля — показать, где в уже пройденной картине живёт каждая, чтобы дальше учить их осмысленно.</p>

  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>owasp-map.live · десять категорий и где они живут</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Кликай категории — увидишь суть, типичный пример и то, к какому модулю курса она привязана:</p>
      <div id="owaspLab"></div>
    </div>
  </div>

  <h2 class="sect">что изменилось от 2021 к 2025</h2>
  <div class="twrap"><table class="t">
    <tr><th>2025</th><th>Было в 2021</th><th>Комментарий</th></tr>
    <tr><td class="rd">A01 Broken Access Control</td><td>A01</td><td>Осталась первой. Сюда же <span class="hl">переехал SSRF</span>, который в 2021 был отдельной категорией A10.</td></tr>
    <tr><td class="am">A02 Security Misconfiguration</td><td>A05</td><td>Поднялась на три позиции: облака, дефолтные настройки, забытые админки.</td></tr>
    <tr><td class="pu">A03 Software Supply Chain Failures</td><td>A06 (Vulnerable Components)</td><td><span class="hl">Расширена</span>: теперь не только уязвимые зависимости, но и компрометация процесса сборки, реестров пакетов, CI/CD.</td></tr>
    <tr><td class="cy">A04 Cryptographic Failures</td><td>A02</td><td>Опустилась со второго места.</td></tr>
    <tr><td class="gs">A05 Injection</td><td>A03</td><td>Опустилась с третьего. Причина не в том, что инъекций стало меньше, а в том, что современные фреймворки закрывают их по умолчанию.</td></tr>
    <tr><td class="cy">A06 Insecure Design</td><td>A04</td><td>Про архитектурные ошибки, которые нельзя починить патчем.</td></tr>
    <tr><td class="am">A07 Authentication Failures</td><td>A07 (Identification and Auth)</td><td>Переименована и уточнена.</td></tr>
    <tr><td class="pu">A08 Software or Data Integrity Failures</td><td>A08</td><td>Без изменений позиции.</td></tr>
    <tr><td class="cy">A09 Security Logging &amp; Alerting Failures</td><td>A09 (Logging and Monitoring)</td><td>Акцент сместился с «мониторинга» на <span class="hl">алертинг</span>: мало собирать логи, надо реагировать.</td></tr>
    <tr><td class="gs">A10 Mishandling of Exceptional Conditions</td><td>—</td><td><span class="hl">Новая категория</span>: неверная обработка ошибок и краевых состояний, fail-open вместо fail-closed, утечки в трассировках.</td></tr>
  </table></div>

  <div class="card acc-a">
    <div class="card-t">⚡ как правильно говорить про Top 10 на собеседовании</div>
    <p class="tx" style="margin:0">Три вещи, которые ценят. Первое: Top 10 — это <span class="hl">осведомлённость, а не стандарт соответствия</span>; для полноты проверки берут OWASP ASVS и WSTG. Второе: категории <span class="hl">пересекаются</span> — один и тот же баг может быть и Broken Access Control, и Insecure Design, в зависимости от того, разовый это промах или системная проблема. Третье: знай <span class="hl">номер актуальной редакции</span> и что в ней поменялось — это показывает, что ты следишь за областью, а не выучил список пять лет назад.</p>
  </div>

  <h2 class="sect">как пройденное связано с уязвимостями</h2>
  <div class="ascii"> <span class="h">ЧТО ТЫ ВЫУЧИЛ</span>                  <span class="a">ЧТО ИЗ ЭТОГО ЛОМАЕТСЯ</span>

 модуль 05 · HTTP-заголовки  ──▶  Host header injection, smuggling
 модуль 06 · кэш и прокси    ──▶  cache poisoning, cache deception
 модуль 07 · HTML и парсинг  ──▶  <span class="r">XSS</span> (reflected, stored, DOM)
 модуль 08 · DOM, sinks      ──▶  <span class="r">DOM-based XSS</span>, prototype pollution
 модуль 09 · архитектура     ──▶  <span class="r">SSRF</span>, доверие внутри периметра
 модуль 10 · API             ──▶  <span class="r">IDOR / BOLA</span>, mass assignment, XXE
 модуль 11 · cookies         ──▶  <span class="r">CSRF</span>, session fixation, cookie tossing
 модуль 12 · auth            ──▶  <span class="r">Broken Access Control</span>, JWT-атаки, OAuth
 модуль 13 · SOP             ──▶  почему всё вышеперечисленное вообще возможно
 модуль 14 · CORS            ──▶  утечка данных через мисконфиг
 модуль 15 · CSP             ──▶  обходы политики, второй рубеж против XSS
 модуль 16 · headers         ──▶  clickjacking, MIME-sniffing, утечки Referer</div>

  <h2 class="sect">куда идти дальше</h2>
  <div class="roadmap">
    <div class="rm-stage"><span class="rm-num">ШАГ 1</span>
      <div class="rm-t">PortSwigger Web Security Academy<span class="rm-tag now">начни здесь</span></div>
      <div class="rm-d">Бесплатно, с лабами, лучший практический ресурс в индустрии. Порядок для старта: <span class="cy">Access control</span> → <span class="cy">XSS</span> → <span class="cy">CSRF</span> → <span class="cy">SQL injection</span> → <span class="cy">Authentication</span>. Именно клиентские темы первыми — они опираются напрямую на SOP и cookies, которые ты уже знаешь.</div></div>
    <div class="rm-stage"><span class="rm-num">ШАГ 2</span>
      <div class="rm-t">Burp Suite Community<span class="rm-tag">инструмент</span></div>
      <div class="rm-d">Поставь прокси, добавь его CA в браузер, посмотри реальный трафик обычного сайта. Всё, что ты видел в модуле 05 на схемах, увидишь вживую. Proxy → Repeater → Intruder — этого хватает на первый год.</div></div>
    <div class="rm-stage"><span class="rm-num">ШАГ 3</span>
      <div class="rm-t">OWASP WSTG + ASVS<span class="rm-tag">методология</span></div>
      <div class="rm-d">WSTG — как тестировать (пошаговая методика по категориям). ASVS — какие требования предъявлять к приложению по уровням. Это то, чем реально пользуются в работе, в отличие от Top 10.</div></div>
    <div class="rm-stage"><span class="rm-num">ШАГ 4</span>
      <div class="rm-t">Своя уязвимая лаборатория<span class="rm-tag">практика</span></div>
      <div class="rm-d">Juice Shop, DVWA, WebGoat — поднять локально и ломать без ограничений. Затем HackTheBox или TryHackMe для более реалистичных сценариев.</div></div>
    <div class="rm-stage"><span class="rm-num">ШАГ 5</span>
      <div class="rm-t">Secure coding и SSDLC<span class="rm-tag next">сторона AppSec</span></div>
      <div class="rm-d">Пентест — только половина работы AppSec. Вторая: threat modeling (STRIDE), ревью кода на безопасность, встраивание SAST, DAST, SCA и секрет-сканеров в CI/CD, работа с командами разработки. На собеседовании на AppSec это спрашивают наравне с уязвимостями.</div></div>
  </div>

  <div class="card acc-c">
    <div class="card-t">◇ что делать прямо сейчас</div>
    <p class="tx" style="margin:0">Не переходи сразу к следующему курсу. Сначала: пройди <span class="cy">все шесть чекпоинт-квизов</span> ещё раз с чистого листа и добей до 100%. Затем прогони <span class="cy">флеш-карты</span> — они собраны по всем модулям. И главное — <span class="hl">объясни вслух три темы</span>, которые дались тяжелее всего, будто интервьюеру. Где начал путаться в формулировках, туда и вернись. Это дешевле, чем обнаружить пробел на собеседовании.</p>
  </div>

  <h2 class="sect">референсы</h2>
  <a class="ref owasp" href="https://owasp.org/Top10/2025/" target="_blank" rel="noopener"><span class="r-t">OWASP Top 10:2025</span><span class="r-d">актуальная редакция с разбором каждой категории, CWE и рекомендациями.</span><span class="r-u">owasp.org/Top10/2025</span></a>
  <a class="ref owasp" href="https://owasp.org/www-project-web-security-testing-guide/" target="_blank" rel="noopener"><span class="r-t">OWASP Web Security Testing Guide</span><span class="r-d">полная методика тестирования: от information gathering до API testing.</span><span class="r-u">owasp.org/www-project-web-security-testing-guide</span></a>
  <a class="ref owasp" href="https://owasp.org/www-project-application-security-verification-standard/" target="_blank" rel="noopener"><span class="r-t">OWASP ASVS</span><span class="r-d">стандарт требований к безопасности приложения по уровням. То, что реально используют в SSDLC.</span><span class="r-u">owasp.org/www-project-application-security-verification-standard</span></a>
  <a class="ref ps" href="https://portswigger.net/web-security/learning-paths" target="_blank" rel="noopener"><span class="r-t">PortSwigger — Learning paths</span><span class="r-d">готовые траектории по темам и уровням сложности.</span><span class="r-u">portswigger.net/web-security/learning-paths</span></a>
  <a class="ref owasp" href="https://cheatsheetseries.owasp.org/" target="_blank" rel="noopener"><span class="r-t">OWASP Cheat Sheet Series</span><span class="r-d">короткие практические памятки почти по любой теме безопасности. Настольный справочник.</span><span class="r-u">cheatsheetseries.owasp.org</span></a>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('owasp');go('cards')">[✓] завершить курс → флеш-карты</button>
    <button class="btn sm gh" onclick="go('home')">↑ на обзор</button>
  </div>
</section>`;

/* ---------- FLASHCARDS VIEW ---------- */
const V_CARDS = `
<section class="view" id="view-cards">
  <div class="eyebrow">next · режим повторения</div>
  <h1 class="vtitle">Флеш-<span class="accent">карты</span></h1>
  <p class="vlede">Интервальное повторение работает лучше перечитывания. Смотри на вопрос, <span class="hl">сначала сформулируй ответ вслух или про себя</span>, и только потом переворачивай карточку. Провальная попытка вспомнить полезнее, чем узнавание готового текста — именно она укрепляет след в памяти.</p>
  <div class="card acc-c">
    <div class="card-t">◇ как пользоваться</div>
    <p class="tx" style="margin:0">Фильтруй по темам, если готовишься к конкретному блоку. Перемешивай колоду — порядок не должен становиться подсказкой. Проходи всю колоду <span class="cy">за день до собеседования</span> и коротко <span class="cy">утром в день собеседования</span>: этого достаточно, чтобы формулировки были наготове.</p>
  </div>
  <div id="cardsHost"></div>
  <div class="btn-row" style="margin-top:22px">
    <button class="btn sm gh" onclick="go('home')">↑ на обзор курса</button>
    <button class="btn sm gh" onclick="openSearch()">⌕ поиск по курсу (Ctrl+K)</button>
  </div>
</section>`;
