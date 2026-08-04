/* ---------- m13 · SAME-ORIGIN POLICY ---------- */
const V_SOP = `
<section class="view" id="view-sop">
  <div class="eyebrow">browser security · модуль 13 · источники: MDN · WHATWG · RFC 6454</div>
  <h1 class="vtitle"><span class="accent">Same-Origin</span> Policy</h1>
  <p class="vlede">Ты открыл в одной вкладке интернет-банк, в другой — случайный сайт. Что мешает скрипту со случайного сайта прочитать твой баланс? Ровно один механизм — Same-Origin Policy. Это <span class="hl">фундамент безопасности всего веба</span>: не заголовок, не настройка сервера, а встроенное правило браузера. Понимание её границ — то, что отделяет человека, который «читал про CORS», от того, кто понимает модель.</p>

  <h2 class="sect">формулировка</h2>
  <div class="card acc-c">
    <div class="card-t">SOP в одном предложении</div>
    <p class="tx" style="margin:0">Документ или скрипт, загруженный с одного origin, <span class="hl">не может читать</span> данные с другого origin, если тот явно не разрешил. Origin = схема + хост + порт (модуль 04).</p>
  </div>
  <p class="tx">Обрати внимание на глагол: <span class="hl">читать</span>. Не «отправлять», не «встраивать» — именно читать. Это и есть та деталь, которую упускают, и из-за которой потом не могут объяснить, почему CSRF вообще возможен.</p>

  <div class="lab">
    <div class="lab-head"><span class="live-dot"></span>sop-matrix.live · что разрешено, а что заблокировано</div>
    <div class="lab-body">
      <p class="tx" style="font-size:12px;margin-bottom:12px">Кликай сценарии — увидишь вердикт браузера и объяснение, почему именно так:</p>
      <div id="sopLab"></div>
    </div>
  </div>

  <h2 class="sect">три категории действий</h2>
  <div class="twrap"><table class="t">
    <tr><th>Категория</th><th>Разрешено?</th><th>Примеры</th></tr>
    <tr>
      <td class="gs">Cross-origin <b>writes</b></td>
      <td class="gs">обычно ДА</td>
      <td>переход по ссылке, редирект, <span class="hl">отправка формы</span> на чужой домен. Браузер не мешает: это базовое поведение веба с 1993 года.</td>
    </tr>
    <tr>
      <td class="gs">Cross-origin <b>embedding</b></td>
      <td class="gs">обычно ДА</td>
      <td><code class="ic">&lt;script src&gt;</code>, <code class="ic">&lt;img&gt;</code>, <code class="ic">&lt;link rel=stylesheet&gt;</code>, <code class="ic">&lt;video&gt;</code>, <code class="ic">&lt;iframe&gt;</code>, <code class="ic">@font-face</code>. Ресурс подгружается и используется — но его содержимое скрипту недоступно.</td>
    </tr>
    <tr>
      <td class="rd">Cross-origin <b>reads</b></td>
      <td class="rd">НЕТ</td>
      <td>чтение ответа <code class="ic">fetch()</code> без CORS-разрешения, доступ к DOM чужого iframe, чтение чужих cookies и localStorage, чтение пикселей чужой картинки на canvas.</td>
    </tr>
  </table></div>

  <div class="card acc-r">
    <div class="card-t">⚡ следствие, которое надо унести из модуля</div>
    <p class="tx" style="margin:0">Запрос <span class="hl">уходит на сервер и выполняется</span>, даже если браузер потом не даст прочитать ответ. Сервер о SOP ничего не знает — он просто обработал запрос и, если там было «перевести деньги», перевёл. Отсюда:</p>
    <p class="tx" style="margin:8px 0 0"><span class="rd">CSRF работает именно поэтому</span>: атакующий отправляет форму на чужой домен, браузер прикладывает cookies, действие выполняется. Что ответ прочитать нельзя — атакующему безразлично, ему нужен побочный эффект, а не ответ. И поэтому же <span class="rd">сообщение «CORS error» в консоли не означает, что запрос не долетел</span> — он долетел и отработал, браузер лишь спрятал ответ.</p>
  </div>

  <h2 class="sect">почему XSS ломает всё</h2>
  <p class="tx">SOP разделяет origin. Но XSS исполняет код <span class="hl">внутри</span> целевого origin — для браузера это родной скрипт страницы. Никакой границы пересекать не нужно, потому что атакующий уже внутри.</p>
  <div class="ascii">  <span class="h">БЕЗ XSS</span>                      <span class="h">С XSS</span>

  evil.com                     bank.com
     │                            │
     │ fetch(bank.com/api)        │ &lt;script&gt; — внедрён атакующим,
     ▼                            │ но исполняется как код bank.com
  <span class="r">SOP: чтение запрещено</span>            ▼
     │                         <span class="g">SOP: всё разрешено</span>
     ▼                            │ читает DOM, cookies, шлёт запросы,
  <span class="f">ответ недоступен</span>              ▼ читает ответы — он СВОЙ
                               <span class="r">полный контроль над сессией</span></div>
  <p class="tx">Отсюда правило: <span class="hl">XSS обесценивает всю клиентскую защиту разом</span> — SameSite, CSRF-токены, HttpOnly (частично). Именно поэтому XSS считают тяжёлой уязвимостью, даже когда «всего лишь alert».</p>

  <h2 class="sect">легальные способы общаться между origin</h2>
  <div class="kv">
    <div class="kv-row"><div class="kv-k">CORS</div><div class="kv-v">Сервер явно разрешает чтение ответа определённым origin. Следующий модуль целиком про это.</div></div>
    <div class="kv-row"><div class="kv-k">postMessage</div><div class="kv-v">Штатный механизм обмена сообщениями между окнами и фреймами разных origin. Правильный способ там, где раньше применяли <code class="ic">document.domain</code>.</div></div>
    <div class="kv-row"><div class="kv-k">CORS-заголовки на статике</div><div class="kv-v">Для шрифтов и картинок, которые нужно читать с canvas: атрибут <code class="ic">crossorigin</code> плюс разрешающие заголовки.</div></div>
    <div class="kv-row"><div class="kv-k">document.domain</div><div class="kv-v"><span class="rd">Устарел, отключается в браузерах.</span> Позволял двум поддоменам «договориться» и получить полный доступ друг к другу. Опасен: одного скомпрометированного поддомена достаточно, чтобы влезть в главный. Если увидишь в коде — это находка для отчёта.</div></div>
  </div>

  <div class="sec-box">
    <div class="sb-t">SEC ▸ postMessage — где ломается</div>
    <p class="tx">Механизм безопасный по замыслу, но обе стороны обязаны проверять, с кем говорят. Две ошибки встречаются почти всегда вместе:</p>
    <div class="code"><span class="code-label">типовые ошибки</span><span class="cmt">// ОТПРАВКА: targetOrigin='*' — сообщение уйдёт любому,</span>
<span class="cmt">// кто окажется в этом окне после редиректа</span>
iframe.contentWindow.postMessage(token, <span class="st">'*'</span>);        <span class="cmt">// ПЛОХО</span>
iframe.contentWindow.postMessage(token, <span class="st">'https://app.example.com'</span>); <span class="cmt">// ок</span>

<span class="cmt">// ПРИЁМ: не проверяется отправитель — принимаем данные от кого угодно</span>
window.addEventListener('message', e =&gt; {
  document.body.innerHTML = e.data;                  <span class="cmt">// ПЛОХО: и origin не проверен, и sink опасный</span>
});
window.addEventListener('message', e =&gt; {
  <span class="kw">if</span> (e.origin !== <span class="st">'https://app.example.com'</span>) <span class="kw">return</span>;   <span class="cmt">// ок</span>
  render(e.data);
});</div>
    <p class="tx" style="margin-bottom:0">Отдельная ловушка: проверка вида <code class="ic">e.origin.indexOf('example.com') !== -1</code> проходит и для <code class="ic">example.com.evil.com</code>. Сравнивать надо строгим равенством.</p>
  </div>

  <div class="sec-box">
    <div class="sb-t">SEC ▸ tabnabbing через target="_blank"</div>
    <p class="tx" style="margin-bottom:0">Ссылка с <code class="ic">target="_blank"</code> исторически давала открытой странице доступ к объекту <code class="ic">window.opener</code> — то есть чужой сайт мог <span class="rd">перенаправить исходную вкладку</span> на свою фишинговую копию, пока пользователь смотрит в новую. Современные браузеры подставляют <code class="ic">rel="noopener"</code> автоматически, но в старых кодовых базах и в нестандартных способах открытия окна проблема жива. Правильно писать явно: <code class="ic">rel="noopener noreferrer"</code>.</p>
  </div>

  <div class="ask-box">
    <div class="sb-t">на собесе спросят</div>
    <div class="q">— Что именно блокирует SOP?</div>
    <div class="a">Чтение ответа и доступ к данным другого origin из скрипта. Не блокирует отправку запроса, не блокирует встраивание ресурсов, не блокирует переход и отправку формы. Формулировка, которая сразу показывает уровень: <span class="hl">«запрос уходит, ответ не читается»</span>.</div>
    <div class="q">— Почему CSRF возможен, если есть SOP?</div>
    <div class="a">Потому что CSRF не требует чтения ответа. Атакующему нужен побочный эффект на сервере, а cross-origin writes SOP разрешает — форму можно отправить куда угодно, и браузер приложит к запросу cookies жертвы. SOP тут просто не тот механизм: от CSRF защищают SameSite, CSRF-токены и проверка Origin на сервере.</div>
    <div class="q">— Чем SOP отличается от CORS?</div>
    <div class="a">SOP — <span class="hl">ограничение</span>, встроенное в браузер и включённое всегда. CORS — <span class="hl">механизм контролируемого ослабления</span> этого ограничения: сервер заголовками говорит, кому можно читать его ответы. То есть CORS не добавляет защиту, а снимает её в разрешённых пределах. Формулировка «мы включили CORS для безопасности» — типичная ошибка, на неё ловят.</div>
  </div>

  <h2 class="sect">референсы модуля</h2>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy" target="_blank" rel="noopener"><span class="r-t">MDN — Same-origin policy</span><span class="r-d">каноническое описание, включая полный список разрешённых embedding-кейсов.</span><span class="r-u">developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy</span></a>
  <a class="ref" href="https://html.spec.whatwg.org/multipage/browsers.html#the-same-origin-concept" target="_blank" rel="noopener"><span class="r-t">WHATWG HTML — The same-origin concept</span><span class="r-d">формальный алгоритм сравнения origin.</span><span class="r-u">html.spec.whatwg.org/multipage/browsers.html#the-same-origin-concept</span></a>
  <a class="ref" href="https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage" target="_blank" rel="noopener"><span class="r-t">MDN — window.postMessage</span><span class="r-d">включая раздел Security concerns: проверка origin и targetOrigin.</span><span class="r-u">developer.mozilla.org/en-US/docs/Web/API/Window/postMessage</span></a>
  <a class="ref ps" href="https://portswigger.net/web-security/cors/same-origin-policy" target="_blank" rel="noopener"><span class="r-t">PortSwigger — Same-origin policy</span><span class="r-d">взгляд со стороны атакующего: что даёт обход и где политика ослаблена.</span><span class="r-u">portswigger.net/web-security/cors/same-origin-policy</span></a>

  <div class="btn-row" style="margin-top:26px">
    <button class="btn" onclick="markDone('sop');go('cors')">[✓] завершить → CORS</button>
  </div>
</section>`;
