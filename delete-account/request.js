/* Deletion-request page — DOM only. Every decision lives in request-logic.js.
   Values are written with textContent, never innerHTML.

   Progressive enhancement, same contract as the rest of the site: the form starts `hidden` in the
   markup and only this script reveals it. With no JS — or if this module fails to load — the page
   still explains the in-app route and shows the e-mail address, so the person is never left
   without a way to ask. */

import { validateForm, mapApiResult, stateFromNetworkError, pickLang, LANG_STORE_KEY } from './request-logic.js';
import { COPY } from './copy.js';
import { REQUEST_URL, REQUEST_TIMEOUT_MS } from './config.js';

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

  // A visible result or error was written in the previous language; re-render it.
  if (shownState) renderState(shownState);
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

/* --------------------------------------------------------------------- state */

let shownState = null;

const STATE_COPY = {
  sent: { title: 'sent_h', body: 'sent_p', note: 'sent_note', action: 'sent_again' },
  failed: { title: 'fail_h', body: 'fail_p', action: 'retry' },
  offline: { title: 'offline_h', body: 'offline_p', action: 'retry' },
  rate_limited: { title: 'rate_h', body: 'rate_p', action: 'retry' }
};

function renderState(state) {
  const copy = STATE_COPY[state];
  if (!copy) return;
  shownState = state;

  ui.stateTitle.textContent = t(copy.title);
  ui.stateBody.textContent = t(copy.body);

  if (copy.note) {
    ui.stateNote.textContent = t(copy.note);
    ui.stateNote.hidden = false;
  } else {
    ui.stateNote.hidden = true;
  }

  ui.stateAction.textContent = t(copy.action);
  ui.stateAction.hidden = false;

  ui.state.dataset.state = state;
  ui.state.hidden = false;
  ui.form.hidden = true;
}

function backToForm() {
  shownState = null;
  ui.state.hidden = true;
  ui.form.hidden = false;
  clearErrors();
  ui.email.focus();
}

function resetForm() {
  ui.form.reset();
  backToForm();
}

/* -------------------------------------------------------------------- submit */

function selectedScope() {
  const checked = document.querySelector('input[name="scope"]:checked');
  return checked ? checked.value : '';
}

async function post(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(REQUEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    let body = null;
    try { body = await response.json(); } catch (e) { body = null; }
    return mapApiResult(response.status, body);
  } finally {
    clearTimeout(timer);
  }
}

let sending = false;

async function onSubmit(event) {
  event.preventDefault();
  if (sending) return;

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

  sending = true;
  ui.submit.disabled = true;
  ui.submit.textContent = t('submitting');

  let state;
  try {
    state = await post(result.value);
  } catch (error) {
    state = stateFromNetworkError();
  } finally {
    sending = false;
    ui.submit.disabled = false;
    ui.submit.textContent = t('submit');
  }

  renderState(state);
}

/* ---------------------------------------------------------------------- boot */

buildPills();
applyCopy();
ui.form.hidden = false;
ui.form.addEventListener('submit', onSubmit);
ui.stateAction.addEventListener('click', () => {
  if (shownState === 'sent') resetForm();
  else backToForm();
});
