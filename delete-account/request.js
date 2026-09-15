/* Deletion-request page — DOM only. Every decision lives in request-logic.js.
   Values are written with textContent, never innerHTML.

   The form does one thing: it composes an e-mail and hands it to the visitor's own mail app. There
   is no endpoint and no network call, so nothing about a request exists anywhere until the person
   presses send in their own client.

   Progressive enhancement, same contract as the rest of the site: the form starts `hidden` in the
   markup and only this script reveals it. With no JS — or if this module fails to load — the page
   still explains the in-app route and shows the address, so nobody is left without a way to ask. */

import { validateForm, composeMail, pickLang, LANG_STORE_KEY } from './request-logic.js';
import { COPY, CONTACT_EMAIL } from './copy.js';

const el = (id) => document.getElementById(id);
const all = (selector) => Array.prototype.slice.call(document.querySelectorAll(selector));

const ui = {
  form: el('req-form'),
  email: el('req-email'),
  details: el('req-details'),
  submit: el('req-submit'),
  errors: {
    email: el('req-email-error'),
    scope: el('req-scope-error'),
    details: el('req-details-error')
  },
  state: el('req-state'),
  stateTitle: el('req-state-title'),
  stateBody: el('req-state-body'),
  stateNote: el('req-state-note'),
  stateAction: el('req-state-action')
};

/* ------------------------------------------------------------------ language */

function safeGet(key) {
  try { return window.localStorage.getItem(key); } catch (e) { return null; }
}

function safeSet(key, value) {
  try { window.localStorage.setItem(key, value); } catch (e) { /* private mode */ }
}

let lang = pickLang(new URLSearchParams(window.location.search).get('lang'), safeGet(LANG_STORE_KEY));

function t(key) {
  return COPY[lang][key];
}

function applyCopy() {
  const dict = COPY[lang];

  all('[data-i18n]').forEach((node) => {
    const value = dict[node.getAttribute('data-i18n')];
    if (typeof value === 'string') node.textContent = value;
  });

  all('[data-i18n-aria-label]').forEach((node) => {
    const value = dict[node.getAttribute('data-i18n-aria-label')];
    if (typeof value === 'string') node.setAttribute('aria-label', value);
  });

  // List copy is an array; rebuild the <li> children rather than assuming a count.
  all('[data-i18n-list]').forEach((node) => {
    const values = dict[node.getAttribute('data-i18n-list')];
    if (!Array.isArray(values)) return;
    node.textContent = '';
    values.forEach((value) => {
      const item = document.createElement('li');
      item.textContent = value;
      node.appendChild(item);
    });
  });

  document.documentElement.setAttribute('lang', dict.lang);
  document.title = dict.doc_title;

  all('[data-lang]').forEach((button) => {
    button.setAttribute('aria-pressed', button.getAttribute('data-lang') === lang ? 'true' : 'false');
  });

  // A visible panel or error was written in the previous language; re-render it.
  if (panelShown) renderPanel();
  if (shownError) showError(shownError.field, shownError.key);
}

function buildPills() {
  all('[data-langs]').forEach((box) => {
    box.textContent = '';
    ['pt', 'en', 'es'].forEach((code) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lang';
      button.textContent = code.toUpperCase();
      button.setAttribute('data-lang', code);
      button.setAttribute('lang', COPY[code].lang);
      button.addEventListener('click', () => {
        lang = code;
        safeSet(LANG_STORE_KEY, code);
        applyCopy();
      });
      box.appendChild(button);
    });
  });
}

/* -------------------------------------------------------------------- errors */

let shownError = null;

function clearErrors() {
  shownError = null;
  Object.keys(ui.errors).forEach((field) => {
    ui.errors[field].textContent = '';
    ui.errors[field].hidden = true;
  });
  ui.email.removeAttribute('aria-invalid');
  ui.details.removeAttribute('aria-invalid');
}

function showError(field, key) {
  clearErrors();
  shownError = { field, key };
  const node = ui.errors[field];
  if (!node) return;
  node.textContent = t('err_' + key);
  node.hidden = false;
  const input = field === 'email' ? ui.email : field === 'details' ? ui.details : null;
  if (input) {
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  }
}

/* --------------------------------------------------------------------- panel */

let panelShown = false;

/**
 * The one panel there is. It never claims the request was sent — only the person's own mail app can
 * do that — so it says what is left to do and what to try if nothing opened.
 */
function renderPanel() {
  panelShown = true;
  ui.stateTitle.textContent = t('opened_h');
  ui.stateBody.textContent = t('opened_p');
  ui.stateNote.textContent = t('opened_note');
  ui.stateNote.hidden = false;
  ui.stateAction.textContent = t('opened_again');
  ui.stateAction.hidden = false;
  ui.state.dataset.state = 'opened';
  ui.state.hidden = false;
  ui.form.hidden = true;
}

function backToForm() {
  panelShown = false;
  ui.state.hidden = true;
  ui.form.hidden = false;
  clearErrors();
  ui.email.focus();
}

/* -------------------------------------------------------------------- submit */

function selectedScope() {
  const checked = document.querySelector('input[name="scope"]:checked');
  return checked ? checked.value : '';
}

function onSubmit(event) {
  event.preventDefault();
  clearErrors();

  const result = validateForm({
    email: ui.email.value,
    scope: selectedScope(),
    details: ui.details.value
  });

  if (!result.ok) {
    showError(result.field, result.error);
    return;
  }

  const mail = composeMail(CONTACT_EMAIL, result.value, COPY[lang]);
  // Assigning location is what opens the mail app; the page itself does not navigate away.
  window.location.href = mail.url;
  renderPanel();
}

/* ---------------------------------------------------------------------- boot */

buildPills();
applyCopy();
ui.form.hidden = false;
ui.form.addEventListener('submit', onSubmit);
ui.stateAction.addEventListener('click', backToForm);
