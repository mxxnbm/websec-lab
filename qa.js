/* QA harness — no dependencies. node qa.js */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const FILE = path.join(__dirname, 'out', 'index.html');
const html = fs.readFileSync(FILE, 'utf8');
let FAIL = 0;
function ok(m){ console.log('  \x1b[32mOK\x1b[0m   ' + m); }
function bad(m){ console.log('  \x1b[31mFAIL\x1b[0m ' + m); FAIL++; }
function warn(m){ console.log('  \x1b[33mWARN\x1b[0m ' + m); }
function head(t){ console.log('\n\x1b[36m== ' + t + ' ==\x1b[0m'); }

/* ---------- extract scripts ---------- */
const scripts = [];
const re = /<script[^>]*>([\s\S]*?)<\/script>/g;
let m;
while ((m = re.exec(html)) !== null) scripts.push(m[1]);

head('1 · SYNTAX');
let synOk = 0;
scripts.forEach((s, i) => {
  try { new vm.Script(s, { filename: 'blk' + i + '.js' }); synOk++; }
  catch (e) {
    bad('script #' + i + ': ' + e.message);
    const lm = /blk\d+\.js:(\d+)/.exec(e.stack || '');
    if (lm) {
      const ln = parseInt(lm[1], 10);
      const lines = s.split('\n');
      for (let k = Math.max(0, ln - 3); k < Math.min(lines.length, ln + 2); k++) {
        console.log('       ' + (k + 1) + ': ' + lines[k].slice(0, 160));
      }
    }
  }
});
if (synOk === scripts.length) ok('all ' + scripts.length + ' script block(s) compile');

/* ---------- DOM stub ---------- */
function mkEl(tag) {
  const el = {
    tagName: (tag || 'div').toUpperCase(),
    _html: '', children: [], style: {}, dataset: {}, _cls: {},
    attributes: {},
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = String(v); },
    get textContent() { return String(this._html).replace(/<[^>]*>/g, ''); },
    set textContent(v) { this._html = String(v); },
    appendChild(c) { this.children.push(c); return c; },
    insertAdjacentHTML(pos, s) { this._html = (pos === 'afterbegin') ? (s + this._html) : (this._html + s); },
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return this.attributes[k]; },
    addEventListener() {},
    removeEventListener() {},
    focus() {},
    scrollIntoView() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    classList: {
      _s: {},
      add(c) { this._s[c] = 1; },
      remove(c) { delete this._s[c]; },
      toggle(c, f) { if (f === undefined) { this._s[c] ? delete this._s[c] : this._s[c] = 1; } else { f ? this._s[c] = 1 : delete this._s[c]; } },
      contains(c) { return !!this._s[c]; }
    }
  };
  el.classList = Object.create(el.classList);
  el.classList._s = {};
  return el;
}

const REG = {};
function getEl(id) {
  if (!REG[id]) REG[id] = mkEl('div');
  return REG[id];
}

const store = {};
const localStorage = {
  getItem(k) { return k in store ? store[k] : null; },
  setItem(k, v) { store[k] = String(v); },
  removeItem(k) { delete store[k]; }
};

const document = {
  _views: [],
  getElementById(id) {
    // views created by buildViews are virtual: we register them lazily
    return getEl(id);
  },
  createElement: mkEl,
  addEventListener() {},
  querySelector(sel) { return getEl('sel:' + sel); },
  querySelectorAll(sel) {
    if (sel === '.view') return document._views;
    if (sel === '.nav-item') return document._navs;
    return [];
  },
  body: mkEl('body')
};
document._views = [];
document._navs = [];

const sandbox = {
  document, localStorage, console,
  location: { hash: '', href: 'https://example.test/' },
  setTimeout(f) { return 0; },
  clearTimeout() {},
  setInterval(f) { return 1; },
  clearInterval() {},
  scrollTo() {}, scrollBy() {}, alert() {}, matchMedia(){ return {matches:false, addListener(){}}; },
  requestAnimationFrame(f){ return 0; }, cancelAnimationFrame(){},
  Math, JSON, Date, Object, Array, String, Number, Boolean, RegExp, parseInt, parseFloat, isNaN,
  btoa: s => Buffer.from(String(s), 'binary').toString('base64'),
  atob: s => Buffer.from(String(s), 'base64').toString('binary'),
  escape: global.escape, unescape: global.unescape,
  navigator: { clipboard: { writeText(){ return Promise.resolve(); } } },
  encodeURIComponent, decodeURIComponent
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;

head('2 · SMOKE');
const ctx = vm.createContext(sandbox);
let smokeFatal = false;
try {
  scripts.forEach(s => vm.runInContext(s, ctx, { timeout: 20000 }));
  ok('scripts executed in stub context');
} catch (e) {
  bad('runtime error while loading: ' + e.message);
  smokeFatal = true;
}

function gv(name){ try { return vm.runInContext(name, ctx); } catch(e){ return undefined; } }

if (!smokeFatal) {
  // simulate enterApp pieces
  try {
    ctx.buildNav();
    ok('buildNav()');
  } catch (e) { bad('buildNav: ' + e.message); }

  let viewsHtml = '';
  try {
    ctx.buildViews();
    viewsHtml = REG['mainViews'].innerHTML;
    ok('buildViews() -> ' + viewsHtml.length + ' chars');
  } catch (e) { bad('buildViews: ' + e.message); }

  // register view containers so labs can find their host divs
  const hostIds = [];
  const hre = /<div id="([a-zA-Z0-9_]+)"><\/div>/g;
  let hm;
  while ((hm = hre.exec(viewsHtml)) !== null) hostIds.push(hm[1]);
  // also quiz hosts
  const qre = /id="(quiz-[a-z]+)"/g;
  while ((hm = qre.exec(viewsHtml)) !== null) hostIds.push(hm[1]);
  if (viewsHtml.indexOf('id="cardsHost"') >= 0) hostIds.push('cardsHost');

  try {
    ctx.initAllLabs();
    ok('initAllLabs() — ' + hostIds.length + ' lab/quiz hosts found');
  } catch (e) { bad('initAllLabs: ' + e.message); }

  try { ctx.buildAllQuizzes(); ok('buildAllQuizzes()'); } catch (e) { bad('buildAllQuizzes: ' + e.message); }
  try { ctx.buildCards(); ok('buildCards()'); } catch (e) { bad('buildCards: ' + e.message); }
  try { ctx.lsMigrate(); ctx.buildProgressPanel(); ok('lsMigrate() + buildProgressPanel()'); } catch (e) { bad('progressPanel: ' + e.message); }
  try {
    const code = ctx.exportProgress();
    if (!code) throw new Error('empty export');
    ctx.markDone('web'); ctx._qPick('basics', 0); ctx._qFinish('basics');
    const code2 = ctx.exportProgress();
    if (code2 === code) throw new Error('export did not change after progress');
    if (!ctx.importProgress(code2)) throw new Error('round-trip import failed');
    if (ctx.importProgress('garbage!!!')) throw new Error('accepted garbage payload');
    if (ctx.importProgress('')) throw new Error('accepted empty payload');
    ok('export/import round-trip + rejects malformed input');
  } catch (e) { bad('export/import: ' + e.message); }
  try {
    const q = ctx.loadQuizState();
    const keys = Object.keys(gv('QUIZZES') || {});
    if (Object.keys(q).length !== keys.length) throw new Error('quiz state key mismatch');
    ok('quiz state persists across reload (' + keys.length + ' quizzes)');
  } catch (e) { bad('quiz persistence: ' + e.message); }

  // router: register view- ids
  const MODULES_ = gv('MODULES') || [];
  const mods = MODULES_.map(x => x.id);
  document._views = mods.map(id => { const e = getEl('view-' + id); return e; });
  document._navs = mods.map(id => { const e = mkEl('div'); e.dataset = { id: id }; return e; });
  let goFail = 0;
  mods.forEach(id => { try { ctx.go(id); } catch (e) { bad('go(' + id + '): ' + e.message); goFail++; } });
  if (!goFail) ok('go() over all ' + mods.length + ' modules');

  try { ctx.buildSearchIndex(); ok('buildSearchIndex() -> ' + (gv('SIDX')||[]).length + ' entries'); }
  catch (e) { bad('buildSearchIndex: ' + e.message); }

  try { ctx.refreshProgress(); mods.forEach(id => ctx.markDone(id)); ctx.resetProgress(); ok('progress: markDone/reset over all modules'); }
  catch (e) { bad('progress: ' + e.message); }

  // exercise every window._ handler
  head('3 · HANDLERS');
  const handlers = Object.keys(ctx).filter(k => /^_/.test(k) && typeof ctx[k] === 'function');
  let hFail = 0, hCount = 0;
  const argsets = [[], [0], [1], [-1], [2], [5], [99], [-99], ['x'], ['all'], ['GET'], ['POST'], ['json'], ['form'],
                   ['httponly'], ['secure'], ['lax'], ['strict'], ['host'], ['domain'],
                   ['self'], ['inline'], ['nonce'], ['dyn'], ['obj'], ['base'], ['fa'], ['conn'],
                   ['basics', 0], ['basics', 1], ['protocol', 0], ['client', 1], ['arch', 2], ['state', 3], ['browsersec', 4],
                   ['basics'], ['protocol'], ['client'], ['arch'], ['state'], ['browsersec'],
                   ['basics', 1], ['basics', -1],
                   ['export'], ['import'], ['idle'], [undefined], [null], [{}], [[]]];
  handlers.forEach(h => {
    argsets.forEach(a => {
      hCount++;
      try { ctx[h].apply(null, a); }
      catch (e) { bad(h + '(' + JSON.stringify(a) + '): ' + e.message); hFail++; }
    });
  });
  if (!hFail) ok(handlers.length + ' handlers × ' + argsets.length + ' arg sets = ' + hCount + ' calls, all green');

  /* ---------- tag balance ---------- */
  head('4 · TAG BALANCE');
  function tagBalance(s, label) {
    const VOID = { br:1, hr:1, img:1, input:1, meta:1, link:1, source:1, track:1, area:1, base:1, col:1, embed:1, param:1, wbr:1,
                   path:1, circle:1, rect:1, line:1, polyline:1, polygon:1, ellipse:1, use:1, stop:1 };
    const stack = [];
    const tre = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
    let t, errs = 0;
    while ((t = tre.exec(s)) !== null) {
      const closing = t[1] === '/', name = t[2].toLowerCase(), self = t[4] === '/';
      if (VOID[name] || self) continue;
      if (!closing) stack.push(name);
      else {
        if (!stack.length) { errs++; break; }
        const top = stack.pop();
        if (top !== name) { errs++; break; }
      }
    }
    if (errs || stack.length) { bad(label + ': unbalanced (' + errs + ' mismatch, ' + stack.length + ' unclosed: ' + stack.slice(-4).join(',') + ')'); return false; }
    return true;
  }
  let tbOk = true;
  const secRe = /<section class="view[^"]*" id="view-([a-z]+)">([\s\S]*?)<\/section>/g;
  let sm, secCount = 0;
  while ((sm = secRe.exec(viewsHtml)) !== null) { secCount++; if (!tagBalance(sm[2], 'view#' + sm[1])) tbOk = false; }
  if (secCount !== mods.length) { bad('section split found ' + secCount + ' views, expected ' + mods.length); tbOk = false; }
  if (!tagBalance(viewsHtml, 'views(all)')) tbOk = false;
  hostIds.forEach(id => {
    const el = REG[id];
    if (el && el.innerHTML) { if (!tagBalance(el.innerHTML, 'lab#' + id)) tbOk = false; }
  });
  if (tbOk) ok('views + ' + hostIds.length + ' rendered lab/quiz outputs balanced');

  /* ---------- router coverage ---------- */
  head('5 · ROUTER');
  let rFail = 0;
  MODULES_.forEach(mo => {
    if (viewsHtml.indexOf('id="view-' + mo.id + '"') < 0) { bad('no <section id="view-' + mo.id + '">'); rFail++; }
  });
  if (!rFail) ok('every MODULES id has a matching view');

  // labs referenced in views exist
  const labRefs = [];
  const lre = /<div id="([a-zA-Z0-9_]*Lab)"><\/div>/g;
  while ((hm = lre.exec(viewsHtml)) !== null) labRefs.push(hm[1]);
  let labEmpty = labRefs.filter(id => !REG[id] || !REG[id].innerHTML);
  if (labEmpty.length) bad('labs rendered nothing: ' + labEmpty.join(', '));
  else ok(labRefs.length + ' labs rendered content');

  // quizzes
  const QZ = gv('QUIZZES') || {};
  const qKeys = Object.keys(QZ);
  let qFail = 0;
  qKeys.forEach(k => {
    if (viewsHtml.indexOf('id="quiz-' + k + '"') < 0) { bad('quiz host missing for ' + k); qFail++; }
    QZ[k].q.forEach((q, i) => {
      if (typeof q.c !== 'number' || q.c < 0 || q.c >= q.o.length) { bad('quiz ' + k + ' q' + i + ': bad answer index'); qFail++; }
      if (!q.e) { bad('quiz ' + k + ' q' + i + ': no explanation'); qFail++; }
    });
  });
  if (!qFail) ok(qKeys.length + ' quizzes, ' + qKeys.reduce((a, k) => a + QZ[k].q.length, 0) + ' questions, all valid');
  const cardTags = {};
  const CD = gv('CARDS') || [];
  CD.forEach(c => { cardTags[c.t] = (cardTags[c.t] || 0) + 1; });
  ok(CD.length + ' flashcards across ' + Object.keys(cardTags).length + ' tags');
}

/* ---------- a11y / meta ---------- */
head('6 · A11Y & META');
[['lang="ru"', 'lang attribute'],
 ['name="viewport"', 'viewport meta'],
 ['prefers-reduced-motion', 'reduced motion'],
 ['focus-visible', 'focus-visible styles'],
 ['role="button"', 'role=button on clickables'],
 ['aria-label', 'aria-labels'],
 ['@media(max-width', 'responsive media query'],
 ['charset="UTF-8"', 'charset']
].forEach(p => { if (html.indexOf(p[0]) >= 0) ok(p[1]); else bad('missing: ' + p[1]); });

/* ---------- non-ascii junk ---------- */
head('7 · CHARSET SCAN');
const junk = /[\u0900-\u097F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0600-\u06FF\u0980-\u09FF\u0E00-\u0E7F]/g;
const jm = html.match(junk);
if (jm) {
  bad('stray scripts found: ' + Array.from(new Set(jm)).join(' '));
  jm.slice(0, 5).forEach(ch => {
    const idx = html.indexOf(ch);
    console.log('       ...' + html.slice(Math.max(0, idx - 60), idx + 60).replace(/\n/g, ' ') + '...');
  });
} else ok('no CJK/Devanagari/Arabic/Hangul/Thai/Bengali strays');

const bs = (html.match(/\\\\'/g) || []).length;
if (bs) bad(bs + ' occurrences of double-backslash-quote (heredoc artifact)');
else ok('no escaped-quote artifacts');

/* ---------- privacy scan ---------- */
head('8 · PRIVACY SCAN');
// Только обобщённые классы. Проектные строки (имена компаний, личные ники,
// локальные пути) держим в .privacy-patterns.json — он в .gitignore.
// Смысл: публичный репозиторий не должен содержать те самые идентификаторы,
// которые мы ищем. Иначе сканер сам становится утечкой.
const pats = [
  [/\/home\/[a-z0-9_.-]+\//g,                         'absolute home path'],
  [/\/(?:mnt|media|srv)\/[a-z0-9_.-]+\//g,            'mount path'],
  [/\b[A-Za-z]:\\[A-Za-z0-9_\\.-]{3,}/g,              'Windows drive path'],
  [/[A-Za-z0-9._%+-]+@(?!example\.|evil\.|test\.|localhost)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, 'email address'],
  [/gh[pousr]_[A-Za-z0-9]{16,}|github_pat_[A-Za-z0-9_]{20,}/g, 'GitHub token'],
  [/AKIA[0-9A-Z]{16}/g,                               'AWS access key'],
  [/AIza[0-9A-Za-z_-]{35}/g,                          'Google API key'],
  [/xox[baprs]-[0-9A-Za-z-]{10,}/g,                   'Slack token'],
  [/-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g, 'private key block'],
  [/(?:api[_-]?key|secret|passwd|password|token)\s*[=:]\s*["'][^"']{12,}["']/gi, 'hardcoded credential'],
  [/https?:\/\/[^/\s:@]+:[^/\s@]+@/g,                 'credentials in URL'],
];
try {
  const extraRaw = fs.readFileSync(path.join(__dirname, '.privacy-patterns.json'), 'utf8');
  JSON.parse(extraRaw).forEach(e => pats.push([new RegExp(e.pattern, e.flags || 'gi'), e.label]));
  console.log('       + локальный список паттернов подключён');
} catch (e) { /* локального списка нет — это нормально */ }

let priv = 0;
pats.forEach(p => {
  const f = html.match(p[0]);
  if (f) { bad(p[1] + ' — ' + f.length + ' hit(s): ' + Array.from(new Set(f)).slice(0, 3).join(', ')); priv++; }
});
if (!priv) ok('0 findings — file is shareable');

/* ---------- links ---------- */
head('9 · LINKS');
const links = Array.from(new Set((html.match(/href="(https?:\/\/[^"]+)"/g) || []).map(s => s.slice(6, -1))));
const anchors = html.match(/<a\b[^>]*>/g) || [];
const blanks = anchors.filter(a => /target="_blank"/.test(a));
const missing = blanks.filter(a => !/rel="[^"]*noopener/.test(a));
ok(links.length + ' unique external links, ' + anchors.length + ' anchor tags');
if (missing.length) { bad(missing.length + ' target=_blank anchors without rel=noopener'); missing.slice(0,3).forEach(a => console.log('       ' + a.slice(0,120))); }
else ok('all ' + blanks.length + ' target=_blank anchors have rel=noopener');
const httpLinks = links.filter(l => l.indexOf('http://') === 0);
if (httpLinks.length) bad('non-HTTPS links: ' + httpLinks.join(', '));
else ok('all external links are https');
const domains = {};
links.forEach(l => { const d = (l.split('/')[2] || ''); domains[d] = (domains[d] || 0) + 1; });
console.log('       domains: ' + Object.keys(domains).sort((a, b) => domains[b] - domains[a]).map(d => d + '(' + domains[d] + ')').join(', '));

/* ---------- size ---------- */
head('10 · SIZE');
const bytes = Buffer.byteLength(html, 'utf8');
ok((bytes / 1024).toFixed(1) + ' KB, ' + html.split('\n').length + ' lines, ' + scripts.length + ' script block(s)');

console.log('\n' + (FAIL ? '\x1b[31m✗ ' + FAIL + ' FAILURES\x1b[0m' : '\x1b[32m✓ ALL GREEN\x1b[0m') + '\n');
process.exit(FAIL ? 1 : 0);
