/* Unit tests for the deletion-request page logic.
   Run with:  node --test tests/          (no dependencies) */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EMAIL_RE, DETAILS_MAX, EMAIL_MAX, SCOPES, LANGS,
  isValidEmail, validateForm, mapApiResult, stateFromNetworkError, pickLang
} from '../delete-account/request-logic.js';
import { COPY, CONTACT_EMAIL } from '../delete-account/copy.js';
import { REQUEST_URLS, requestUrl } from '../delete-account/config.js';

/* --------------------------------------------------------------- e-mail */

test('a plain address is accepted', () => {
  assert.equal(isValidEmail('alguem@exemplo.com'), true);
  assert.equal(isValidEmail('  alguem@exemplo.com  '), true, 'surrounding space is trimmed');
  assert.equal(isValidEmail('a.b+tag@sub.exemplo.com.br'), true);
});

test('an address without a domain dot or with spaces is refused', () => {
  assert.equal(isValidEmail('alguem@exemplo'), false);
  assert.equal(isValidEmail('alguem'), false);
  assert.equal(isValidEmail('alguem @exemplo.com'), false);
  assert.equal(isValidEmail('@exemplo.com'), false);
  assert.equal(isValidEmail(''), false);
});

test('a non-string is refused rather than thrown at', () => {
  assert.equal(isValidEmail(null), false);
  assert.equal(isValidEmail(undefined), false);
  assert.equal(isValidEmail(42), false);
});

test('an address longer than the field limit is refused', () => {
  const long = 'a'.repeat(EMAIL_MAX) + '@exemplo.com';
  assert.equal(isValidEmail(long), false);
});

test('the regex is anchored, so it cannot match inside a longer string', () => {
  assert.equal(EMAIL_RE.source.startsWith('^'), true);
  assert.equal(EMAIL_RE.source.endsWith('$'), true);
});

/* ------------------------------------------------------------ validation */

test('a complete form returns the payload, trimmed', () => {
  const result = validateForm({ email: ' alguem@exemplo.com ', scope: 'account', details: '  urgente  ' });
  assert.deepEqual(result, { ok: true, value: { email: 'alguem@exemplo.com', scope: 'account', details: 'urgente' } });
});

test('details are optional and arrive as an empty string', () => {
  const result = validateForm({ email: 'alguem@exemplo.com', scope: 'data', details: '' });
  assert.equal(result.ok, true);
  assert.equal(result.value.details, '');
});

test('a missing e-mail is reported before anything else', () => {
  const result = validateForm({ email: '   ', scope: 'nonsense', details: 'x'.repeat(DETAILS_MAX + 1) });
  assert.deepEqual(result, { ok: false, field: 'email', error: 'email_required' });
});

test('an invalid e-mail is reported before the scope', () => {
  const result = validateForm({ email: 'nope', scope: 'nonsense', details: '' });
  assert.deepEqual(result, { ok: false, field: 'email', error: 'email_invalid' });
});

test('a scope outside the allow-list is refused', () => {
  const result = validateForm({ email: 'alguem@exemplo.com', scope: 'everything', details: '' });
  assert.deepEqual(result, { ok: false, field: 'scope', error: 'scope_invalid' });
});

test('details over the cap are refused, exactly at the boundary', () => {
  const email = 'alguem@exemplo.com';
  assert.equal(validateForm({ email, scope: 'account', details: 'x'.repeat(DETAILS_MAX) }).ok, true);
  assert.deepEqual(
    validateForm({ email, scope: 'account', details: 'x'.repeat(DETAILS_MAX + 1) }),
    { ok: false, field: 'details', error: 'details_long' }
  );
});

test('a missing input object does not throw', () => {
  assert.equal(validateForm(undefined).ok, false);
  assert.equal(validateForm(null).error, 'email_required');
});

test('both documented scopes validate', () => {
  for (const scope of SCOPES) {
    assert.equal(validateForm({ email: 'a@b.co', scope, details: '' }).ok, true, scope);
  }
});

/* ---------------------------------------------------------- API mapping */

test('only a 200 that says "received" counts as sent', () => {
  assert.equal(mapApiResult(200, { status: 'received' }), 'sent');
});

test('a 200 with an unexpected body is a failure, never a silent success', () => {
  assert.equal(mapApiResult(200, { status: 'queued' }), 'failed');
  assert.equal(mapApiResult(200, {}), 'failed');
  assert.equal(mapApiResult(200, null), 'failed');
});

test('rate limiting has its own state', () => {
  assert.equal(mapApiResult(429, { error: 'rate-limited' }), 'rate_limited');
});

test('every other status is a failure', () => {
  for (const status of [400, 403, 405, 500, 502, 0]) {
    assert.equal(mapApiResult(status, null), 'failed', String(status));
  }
});

test('a thrown fetch is offline, not sent', () => {
  assert.equal(stateFromNetworkError(), 'offline');
});

/* ------------------------------------------------------------- language */

test('the query parameter wins, then storage, then Portuguese', () => {
  assert.equal(pickLang('en', 'es'), 'en');
  assert.equal(pickLang(null, 'es'), 'es');
  assert.equal(pickLang(null, null), 'pt');
  assert.equal(pickLang('klingon', 'zz'), 'pt');
});

/* ----------------------------------------------------------------- copy */

test('the three languages carry exactly the same keys', () => {
  const reference = Object.keys(COPY.pt).sort();
  for (const lang of LANGS) {
    assert.deepEqual(Object.keys(COPY[lang]).sort(), reference, `${lang} differs from pt`);
  }
});

test('list copy is an array of the same length in every language', () => {
  for (const key of ['inapp_steps', 'deleted', 'kept']) {
    const size = COPY.pt[key].length;
    assert.ok(size > 0, key);
    for (const lang of LANGS) {
      assert.ok(Array.isArray(COPY[lang][key]), `${lang}.${key} is not an array`);
      assert.equal(COPY[lang][key].length, size, `${lang}.${key} has a different length`);
    }
  }
});

test('no copy string is left empty', () => {
  for (const lang of LANGS) {
    for (const [key, value] of Object.entries(COPY[lang])) {
      const values = Array.isArray(value) ? value : [value];
      for (const entry of values) {
        assert.equal(typeof entry, 'string', `${lang}.${key} is not a string`);
        assert.ok(entry.trim().length > 0, `${lang}.${key} is empty`);
      }
    }
  }
});

test('there is an error string for every validation error the logic can return', () => {
  const errors = ['email_required', 'email_invalid', 'scope_invalid', 'details_long'];
  for (const lang of LANGS) {
    for (const error of errors) {
      assert.ok(COPY[lang]['err_' + error], `${lang} is missing err_${error}`);
    }
  }
});

test('there is copy for every state the page can render', () => {
  const states = { sent: 'sent_h', failed: 'fail_h', offline: 'offline_h', rate_limited: 'rate_h' };
  for (const lang of LANGS) {
    for (const key of Object.values(states)) {
      assert.ok(COPY[lang][key], `${lang} is missing ${key}`);
    }
  }
});

test('the contact address is the one published in the policy', () => {
  assert.equal(CONTACT_EMAIL, 'mazariniapp@gmail.com');
});

/* --------------------------------------------------------------- config */

test('the endpoint is chosen by environment, and prod is the default', () => {
  assert.equal(requestUrl({ search: '', hostname: 'listapronta.app' }), REQUEST_URLS.prod);
  assert.equal(requestUrl({ search: '?env=dev', hostname: 'listapronta.app' }), REQUEST_URLS.dev);
  assert.equal(requestUrl({ search: '?env=emulator', hostname: 'localhost' }), REQUEST_URLS.emulator);
  assert.equal(requestUrl({ search: '', hostname: 'localhost' }), REQUEST_URLS.dev);
});

test('no location at all counts as local, the same as the invitation page', () => {
  // pickEnv treats an empty hostname as localhost, so a module imported outside a browser
  // resolves to dev rather than quietly pointing test runs at the production backend.
  assert.equal(requestUrl(null), REQUEST_URLS.dev);
});

test('every endpoint points at the same function name and region', () => {
  for (const [env, url] of Object.entries(REQUEST_URLS)) {
    assert.ok(url.endsWith('/submitDeletionRequest'), `${env} does not end in the function name`);
    assert.ok(url.includes('southamerica-east1'), `${env} is not in the São Paulo region`);
  }
});

test('the live endpoint is https and points at the prod project', () => {
  assert.ok(REQUEST_URLS.prod.startsWith('https://'));
  assert.ok(REQUEST_URLS.prod.includes('listapronta-prod'));
});
