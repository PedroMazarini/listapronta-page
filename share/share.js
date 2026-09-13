/* Invitation page — DOM only. Every decision lives in invite-logic.js.
   Server values are written with textContent / createTextNode, never innerHTML. */

import {
  readToken, isValidToken, playUrl, appLinkUrl, intentUrl,
  avatarSrc, resolveState, messageParts, membersCaption
} from './invite-logic.js';
import { resolveUrl, REQUEST_TIMEOUT_MS } from './config.js';

const STORE_FLAG = 'lp-invite-store-visited';

const el = (id) => document.getElementById(id);

const ui = {
  body: document.body,
  status: el('share-status'),
  art: el('art'),
  bagHero: el('bag-hero'),
  bagSkeleton: el('bag-skeleton'),
  ownerAvatar: el('owner-avatar'),
  ownerAvatarImg: el('owner-avatar-img'),
  loading: el('state-loading'),
  valid: el('state-valid'),
  error: el('state-error'),
  msg: el('share-msg'),
  listName: el('list-name'),
  membersLine: el('members-line'),
  membersAvatarImg: el('members-avatar-img'),
  membersText: el('members-text'),
  icons: { invalid: el('icon-invalid'), gone: el('icon-gone'), offline: el('icon-offline') },
  errorTitle: el('error-title'),
  errorBody: el('error-body'),
  errorNote: el('error-note'),
  retry: el('cta-retry'),
  play: el('cta-play'),
  playError: el('cta-play-error'),
  open: el('cta-open'),
  openLabel: el('cta-open-label'),
  openError: el('cta-open-error'),
  openLoading: el('cta-open-loading')
};

const COPY = {
  loading: 'Abrindo seu convite…',
  invalid: {
    title: 'Este convite não vale mais',
    body: 'Ele pode ter expirado ou sido desativado por quem compartilhou a lista. Peça um novo link e tente de novo.'
  },
  gone: {
    title: 'Esta lista não está mais disponível',
    body: 'Quem compartilhou apagou a lista ou encerrou o compartilhamento. Não há mais nada para abrir por este convite.'
  },
  offline: {
    title: 'Não deu para carregar o convite',
    body: 'Verifique sua conexão e tente de novo. O link continua válido.'
  },
  openApp: 'Abrir no Lista Pronta',
  openAfterInstall: 'Já instalei — abrir convite'
};

const token = readToken(window.location.search);

/* ------------------------------------------------------------- helpers */

function safeGet(key) {
  try { return window.localStorage.getItem(key); } catch (e) { return null; }
}
function safeSet(key, value) {
  try { window.localStorage.setItem(key, value); } catch (e) { /* private mode */ }
}

function announce(text) {
  if (ui.status) ui.status.textContent = text;
}

function setState(name) {
  ui.body.setAttribute('data-state', name);
  ui.loading.hidden = name !== 'loading';
  ui.valid.hidden = name !== 'valid';
  ui.error.hidden = name === 'loading' || name === 'valid';
  if (ui.art) ui.art.hidden = name !== 'loading' && name !== 'valid';
}

function isAndroidChrome() {
  const ua = navigator.userAgent || '';
  if (!/Android/i.test(ua)) return false;
  if (/(FBAN|FBAV|Instagram|Line\/|wv\))/i.test(ua)) return false;
  return /Chrome\/|CriOS/i.test(ua);
}

/** Both "open" buttons point at the page's own https URL (the verified App Link). */
function wireOpenButtons() {
  const https = isValidToken(token) ? appLinkUrl(token) : appLinkUrl('');
  [ui.open, ui.openError, ui.openLoading].forEach((node) => {
    if (!node) return;
    node.setAttribute('href', https);
    if (isValidToken(token) && isAndroidChrome()) {
      node.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = intentUrl(token);
      });
    }
  });
}

function wirePlayButtons() {
  const url = playUrl(token);
  [ui.play, ui.playError].forEach((node) => {
    if (!node) return;
    node.setAttribute('href', url);
    node.addEventListener('click', () => {
      safeSet(STORE_FLAG, '1');
      window.setTimeout(refreshOpenLabel, 50);
    });
  });
}

function refreshOpenLabel() {
  if (!ui.openLabel) return;
  const visited = safeGet(STORE_FLAG) === '1';
  ui.openLabel.textContent = visited ? COPY.openAfterInstall : COPY.openApp;
}

/* --------------------------------------------------------------- render */

function renderValid(data) {
  // message: built from text nodes, never innerHTML
  ui.msg.textContent = '';
  messageParts(data.ownerName, data.listName).forEach((part) => {
    if (part.strong) {
      const strong = document.createElement('strong');
      strong.appendChild(document.createTextNode(part.text));
      ui.msg.appendChild(strong);
    } else {
      ui.msg.appendChild(document.createTextNode(part.text));
    }
  });

  ui.listName.textContent = data.listName;

  const src = avatarSrc(data.ownerAvatarId);
  ui.ownerAvatarImg.setAttribute('src', src);
  ui.ownerAvatarImg.setAttribute('alt', '');
  ui.ownerAvatar.hidden = false;
  ui.bagHero.classList.remove('bag-hero--loading');
  if (ui.bagSkeleton) ui.bagSkeleton.hidden = true;

  const caption = membersCaption(data.ownerName, data.memberCount);
  if (caption) {
    ui.membersAvatarImg.setAttribute('src', src);
    ui.membersText.textContent = caption;
    ui.membersLine.hidden = false;
  } else {
    ui.membersLine.hidden = true;
  }

  setState('valid');
  refreshOpenLabel();
  announce(ui.msg.textContent);
  document.title = data.listName + ' — convite | Lista Pronta';
}

function renderError(kind) {
  const copy = COPY[kind] || COPY.offline;
  ui.errorTitle.textContent = copy.title;
  ui.errorBody.textContent = copy.body;

  const shown = ui.icons[kind] ? kind : 'invalid';
  Object.keys(ui.icons).forEach((key) => {
    if (ui.icons[key]) ui.icons[key].hidden = key !== shown;
  });

  const temporary = kind === 'offline';
  ui.retry.hidden = !temporary;
  ui.errorNote.hidden = temporary;
  if (ui.playError) ui.playError.hidden = temporary;

  setState(kind);
  announce(copy.title + '. ' + copy.body);
  document.title = copy.title + ' | Lista Pronta';
}

/* -------------------------------------------------------------- network */

async function request(url, body) {
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = window.setTimeout(() => { if (controller) controller.abort(); }, REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller ? controller.signal : undefined,
      referrerPolicy: 'no-referrer',
      credentials: 'omit',
      cache: 'no-store'
    });
    let json = null;
    let parseError = false;
    try {
      json = await response.json();
    } catch (e) {
      parseError = true;
    }
    return { httpStatus: response.status, json, parseError };
  } catch (e) {
    return { error: e && e.name === 'AbortError' ? 'timeout' : 'network' };
  } finally {
    window.clearTimeout(timer);
  }
}

async function load() {
  if (!isValidToken(token)) {
    renderError('invalid');
    return;
  }
  setState('loading');
  announce(COPY.loading);

  const result = await request(resolveUrl(window.location), { token });
  const next = resolveState(token, result);

  if (next.state === 'valid') renderValid(next);
  else renderError(next.state);
}

/* ----------------------------------------------------------------- boot */

wirePlayButtons();
wireOpenButtons();
refreshOpenLabel();

if (ui.retry) ui.retry.addEventListener('click', () => { load(); });

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refreshOpenLabel();
});

load();
