/* Lista Pronta — language switching for the legal pages.
   Progressive enhancement, same contract as site.js: without JS the Portuguese version is complete
   and readable and the pills simply never appear. The English and Spanish versions live in the same
   document and are revealed by ?lang= or by the pills.
   No frameworks, no external calls. Shares the landing page's stored preference (lp-lang). */
(function () {
  'use strict';

  var LANGS = ['pt', 'en', 'es'];
  var STORE_KEY = 'lp-lang';
  var HTML_LANG = { pt: 'pt-BR', en: 'en', es: 'es' };
  var LABEL = { pt: 'Idioma', en: 'Language', es: 'Idioma' };

  function all(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  function safeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }

  function initialLang() {
    var query = (new URLSearchParams(window.location.search)).get('lang');
    if (LANGS.indexOf(query) !== -1) return query;
    var stored = safeGet(STORE_KEY);
    if (LANGS.indexOf(stored) !== -1) return stored;
    return 'pt';
  }

  var lang = initialLang();

  function apply() {
    all('[data-lang-section]').forEach(function (section) {
      section.hidden = section.getAttribute('data-lang-section') !== lang;
    });
    all('[data-lang]').forEach(function (button) {
      button.setAttribute('aria-pressed', button.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    document.documentElement.setAttribute('lang', HTML_LANG[lang]);

    var visible = document.querySelector('[data-lang-section="' + lang + '"]');
    var title = visible && visible.getAttribute('data-title');
    if (title) document.title = title;

    all('[data-langs]').forEach(function (box) {
      box.setAttribute('aria-label', LABEL[lang]);
    });
  }

  function setLang(code) {
    if (LANGS.indexOf(code) === -1) return;
    lang = code;
    safeSet(STORE_KEY, code);
    apply();
  }

  function buildPills() {
    all('[data-langs]').forEach(function (box) {
      box.textContent = '';
      LANGS.forEach(function (code) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'lang';
        button.textContent = code.toUpperCase();
        button.setAttribute('data-lang', code);
        button.setAttribute('lang', HTML_LANG[code]);
        button.addEventListener('click', function () { setLang(code); });
        box.appendChild(button);
      });
    });
  }

  buildPills();
  apply();
}());
