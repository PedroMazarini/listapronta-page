/* Deletion-request page — the decisions, with no DOM and no network.
   Everything here is pure so tests/delete-account.test.mjs can drive it directly, the same split
   the invitation page uses between invite-logic.js and share.js. */

export { pickEnv } from '../share/invite-logic.js';

/** Deliberately permissive: this address is a lookup key for a human, not a login. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Mirrors the server's own cap, so the browser refuses before the request is made. */
export const DETAILS_MAX = 1000;
export const EMAIL_MAX = 254;

/** What the person is asking for. The server stores the choice verbatim. */
export const SCOPES = ['account', 'data'];

export function isValidEmail(value) {
  return typeof value === 'string' && value.length <= EMAIL_MAX && EMAIL_RE.test(value.trim());
}

/**
 * Validates the form as a whole and returns the payload the endpoint expects.
 * One error at a time, in field order: the form shows a single message under the offending field.
 */
export function validateForm(input) {
  const email = typeof input?.email === 'string' ? input.email.trim() : '';
  const scope = typeof input?.scope === 'string' ? input.scope : '';
  const details = typeof input?.details === 'string' ? input.details.trim() : '';

  if (email.length === 0) return { ok: false, field: 'email', error: 'email_required' };
  if (!isValidEmail(email)) return { ok: false, field: 'email', error: 'email_invalid' };
  if (!SCOPES.includes(scope)) return { ok: false, field: 'scope', error: 'scope_invalid' };
  if (details.length > DETAILS_MAX) return { ok: false, field: 'details', error: 'details_long' };

  return { ok: true, value: { email, scope, details } };
}

/**
 * Turns an HTTP answer into the one state the page renders.
 * Anything we do not recognise is `failed`, because the page's failure copy already tells the
 * person to write to the e-mail address directly — a wrong state must never look like success.
 */
export function mapApiResult(status, payload) {
  if (status === 200 && payload && payload.status === 'received') return 'sent';
  if (status === 429) return 'rate_limited';
  if (status === 400) return 'failed';
  return 'failed';
}

/** A thrown fetch (offline, DNS, CORS, abort) never means the request landed. */
export function stateFromNetworkError() {
  return 'offline';
}

/** Language resolution, shared with the rest of the site through the same storage key. */
export const LANGS = ['pt', 'en', 'es'];
export const LANG_STORE_KEY = 'lp-lang';

export function pickLang(queryLang, storedLang) {
  if (LANGS.includes(queryLang)) return queryLang;
  if (LANGS.includes(storedLang)) return storedLang;
  return 'pt';
}
