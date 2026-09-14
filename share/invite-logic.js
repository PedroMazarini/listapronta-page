/* Pure logic for the invitation page. No DOM, no network — so it can be unit
   tested with `node --test tests/` and reused by share/share.js in the browser. */

export const PLAY_BASE = 'https://play.google.com/store/apps/details?id=app.mazarini.listapronta';
export const PACKAGE = 'app.mazarini.listapronta';
export const SHARE_ORIGIN = 'https://listapronta.app';

/** Invitation token: 32 random bytes, base64url, no padding (docs/SHARING.md). */
export const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

export function isValidToken(token) {
  return typeof token === 'string' && TOKEN_RE.test(token);
}

/** Reads `invite` out of a query string. Returns '' when absent. */
export function readToken(search) {
  if (typeof search !== 'string') return '';
  const query = search.charAt(0) === '?' ? search.slice(1) : search;
  for (const pair of query.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const key = eq === -1 ? pair : pair.slice(0, eq);
    if (decodeURIComponent(key.replace(/\+/g, ' ')) !== 'invite') continue;
    const raw = eq === -1 ? '' : pair.slice(eq + 1);
    try {
      return decodeURIComponent(raw.replace(/\+/g, ' '));
    } catch (e) {
      return raw;
    }
  }
  return '';
}

/** Play Store link carrying the invite through the install referrer. */
export function playUrl(token) {
  if (!isValidToken(token)) return PLAY_BASE;
  return PLAY_BASE + '&referrer=' + encodeURIComponent('invite=' + token);
}

/** The page's own https URL — the verified App Link opens it in the app. */
export function appLinkUrl(token) {
  if (!isValidToken(token)) return SHARE_ORIGIN + '/share/';
  return SHARE_ORIGIN + '/share/?invite=' + token;
}

/** Android Chrome intent: URL, falling back to the https page when not installed. */
export function intentUrl(token) {
  const https = appLinkUrl(token);
  const target = https.replace(/^https:\/\//, '');
  return 'intent://' + target + '#Intent;scheme=https;package=' + PACKAGE +
    ';S.browser_fallback_url=' + encodeURIComponent(https) + ';end';
}

const AVATAR_RE = /^avatar_(0[1-9]|[12][0-9]|30)$/;

/** Owner avatar file for an `avatarId` like "avatar_07"; falls back to avatar_01. */
export function avatarSrc(avatarId, base) {
  const dir = base === undefined ? '../assets/avatars/' : base;
  const id = AVATAR_RE.test(avatarId) ? avatarId : 'avatar_01';
  return dir + id + '.webp';
}

/** Which backend to talk to, from the page location. */
export function pickEnv(location) {
  const search = (location && location.search) || '';
  const host = ((location && location.hostname) || '').toLowerCase();
  const env = readParam(search, 'env');
  if (env === 'emulator') return 'emulator';
  if (env === 'dev') return 'dev';
  if (env === 'prod') return 'prod';
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '') return 'dev';
  return 'prod';
}

function readParam(search, name) {
  const query = search.charAt(0) === '?' ? search.slice(1) : search;
  for (const pair of query.split('&')) {
    const eq = pair.indexOf('=');
    const key = eq === -1 ? pair : pair.slice(0, eq);
    if (key === name) return eq === -1 ? '' : decodeURIComponent(pair.slice(eq + 1));
  }
  return null;
}

/**
 * Maps a resolver payload onto a page state.
 * Backend contract (docs/SHARING.md): 200 with
 * `{status:'valid'|'invalid'|'disabled'|'unavailable', listName?, ownerName?, ownerAvatarId?, memberCount?}`.
 */
export function stateFromPayload(payload) {
  if (!payload || typeof payload !== 'object') return { state: 'offline' };
  switch (payload.status) {
    case 'valid':
      return {
        state: 'valid',
        ownerName: asText(payload.ownerName) || 'Alguém',
        listName: asText(payload.listName) || 'lista',
        ownerAvatarId: typeof payload.ownerAvatarId === 'string' ? payload.ownerAvatarId : '',
        memberCount: Number.isFinite(payload.memberCount) ? payload.memberCount : 1
      };
    case 'invalid':
    case 'disabled':
      return { state: 'invalid' };
    case 'unavailable':
      return { state: 'gone' };
    default:
      return { state: 'offline' };
  }
}

function asText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Maps the outcome of one HTTP attempt onto a page state.
 * `result` is `{error}` for a network/timeout failure, otherwise
 * `{httpStatus, json}` or `{httpStatus, parseError: true}`.
 */
export function mapApiResult(result) {
  if (!result || typeof result !== 'object') return { state: 'offline' };
  if (result.error) return { state: 'offline' };
  const code = result.httpStatus;
  if (code === 400) return { state: 'invalid' };
  if (code !== 200) return { state: 'offline' };
  if (result.parseError) return { state: 'offline' };
  return stateFromPayload(result.json);
}

/** Full flow for one token: malformed tokens never reach the network. */
export function resolveState(token, result) {
  if (!isValidToken(token)) return { state: 'invalid' };
  return mapApiResult(result);
}

const MESSAGE = {
  pt: { after: ' compartilhou uma lista com você' }
};

/**
 * The invitation sentence split into plain-text parts, so the page can build it
 * with createTextNode and never put server values through innerHTML.
 *
 * The list name is deliberately absent: it is already shown in the chip right
 * below the sentence, so repeating it made the headline long for no gain.
 */
export function messageParts(ownerName) {
  const copy = MESSAGE.pt;
  return [
    { text: String(ownerName), strong: true },
    { text: copy.after, strong: false }
  ];
}

/** "João e mais 2 pessoas" — null when the owner is alone on the list. */
export function membersCaption(ownerName, memberCount) {
  const others = (Number.isFinite(memberCount) ? memberCount : 1) - 1;
  if (others < 1) return null;
  return String(ownerName) + ' e mais ' + others + (others === 1 ? ' pessoa' : ' pessoas');
}
