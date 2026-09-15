/* Deletion-request page — the decisions, with no DOM.
   Everything here is pure so tests/delete-account.test.mjs can drive it directly, the same split
   the invitation page uses between invite-logic.js and share.js.

   There is no backend and no network: the form composes an e-mail and hands it to the visitor's own
   mail app. Nothing about a request reaches us until they press send in their own client. */

/** Deliberately permissive: this address is a lookup key for a human, not a login. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const DETAILS_MAX = 1000;
export const EMAIL_MAX = 254;

/** What the person is asking for. */
export const SCOPES = ['account', 'data'];

export function isValidEmail(value) {
  return typeof value === 'string' && value.length <= EMAIL_MAX && EMAIL_RE.test(value.trim());
}

/**
 * Validates the form as a whole and returns the values the message is built from.
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
 * The subject stays in one fixed shape in every language, so every request lands in the mailbox
 * looking the same and one filter catches all of them. The address is in it for a quick scan.
 */
export function buildSubject(value) {
  return `[Lista Pronta] Deletion request — ${value.email}`;
}

/**
 * The body is in the language the visitor is reading, because they see it in their mail app and
 * approve it before sending. Plain text, one field per line.
 */
export function buildBody(value, labels) {
  const scopeText = value.scope === 'account' ? labels.scope_account : labels.scope_data;
  return [
    labels.mail_intro,
    '',
    `${labels.label_email}: ${value.email}`,
    `${labels.label_scope}: ${scopeText}`,
    '',
    `${labels.label_details}:`,
    value.details.length > 0 ? value.details : labels.mail_none,
  ].join('\n');
}

/**
 * `encodeURIComponent` leaves a handful of characters that mail clients disagree about; the extra
 * pass keeps the address, subject and body intact across them.
 */
function encodeMailParam(text) {
  return encodeURIComponent(text).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

export function buildMailtoUrl(to, subject, body) {
  return `mailto:${to}?subject=${encodeMailParam(subject)}&body=${encodeMailParam(body)}`;
}

/** Everything the page needs to hand the request to a mail app. */
export function composeMail(to, value, labels) {
  const subject = buildSubject(value);
  const body = buildBody(value, labels);
  return { subject, body, url: buildMailtoUrl(to, subject, body) };
}

/** Language resolution, shared with the rest of the site through the same storage key. */
export const LANGS = ['pt', 'en', 'es'];
export const LANG_STORE_KEY = 'lp-lang';

export function pickLang(queryLang, storedLang) {
  if (LANGS.includes(queryLang)) return queryLang;
  if (LANGS.includes(storedLang)) return storedLang;
  return 'pt';
}
