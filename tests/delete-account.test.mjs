/* Unit tests for the deletion-request page logic.
   Run with:  node --test tests/          (no dependencies) */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EMAIL_RE, DETAILS_MAX, EMAIL_MAX, SCOPES, LANGS,
  isValidEmail, validateForm, pickLang,
  buildSubject, buildBody, buildMailtoUrl, composeMail
} from '../delete-account/request-logic.js';
import { COPY, CONTACT_EMAIL } from '../delete-account/copy.js';

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
  assert.equal(isValidEmail('a'.repeat(EMAIL_MAX) + '@exemplo.com'), false);
});

test('the regex is anchored, so it cannot match inside a longer string', () => {
  assert.equal(EMAIL_RE.source.startsWith('^'), true);
  assert.equal(EMAIL_RE.source.endsWith('$'), true);
});

/* ------------------------------------------------------------ validation */

test('a complete form returns the values, trimmed', () => {
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
  assert.deepEqual(validateForm({ email: 'nope', scope: 'nonsense', details: '' }),
    { ok: false, field: 'email', error: 'email_invalid' });
});

test('a scope outside the allow-list is refused', () => {
  assert.deepEqual(validateForm({ email: 'alguem@exemplo.com', scope: 'everything', details: '' }),
    { ok: false, field: 'scope', error: 'scope_invalid' });
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

/* ------------------------------------------------------- the message itself */

const VALUE = { email: 'alguem@exemplo.com', scope: 'account', details: 'quero agora' };

test('the subject has one fixed shape in every language, so one filter catches all of them', () => {
  const expected = '[Lista Pronta] Deletion request — alguem@exemplo.com';
  for (const lang of LANGS) {
    assert.equal(composeMail(CONTACT_EMAIL, VALUE, COPY[lang]).subject, expected, lang);
  }
});

test('the body carries the address, the choice and the notes', () => {
  const body = buildBody(VALUE, COPY.pt);
  assert.match(body, /alguem@exemplo\.com/);
  assert.match(body, /Minha conta e todos os meus dados/);
  assert.match(body, /quero agora/);
});

test('the body names whichever of the two choices was made', () => {
  assert.match(buildBody({ ...VALUE, scope: 'data' }, COPY.en), /Only some data/);
  assert.match(buildBody({ ...VALUE, scope: 'account' }, COPY.en), /My account and all of my data/);
});

test('empty notes read as "none" rather than as a blank line', () => {
  assert.match(buildBody({ ...VALUE, details: '' }, COPY.pt), /\(nenhuma\)/);
  assert.match(buildBody({ ...VALUE, details: '' }, COPY.en), /\(none\)/);
  assert.match(buildBody({ ...VALUE, details: '' }, COPY.es), /\(ninguna\)/);
});

test('the body is written in the language the visitor is reading', () => {
  assert.match(buildBody(VALUE, COPY.pt), /Quero pedir a exclusão/);
  assert.match(buildBody(VALUE, COPY.en), /I would like to request/);
  assert.match(buildBody(VALUE, COPY.es), /Quiero solicitar/);
});

test('the mailto goes to the published address', () => {
  assert.equal(composeMail(CONTACT_EMAIL, VALUE, COPY.pt).url.startsWith('mailto:mazariniapp@gmail.com?'), true);
});

test('the subject and body are percent-encoded, so no field can inject a header', () => {
  const url = buildMailtoUrl('a@b.co', 'x', 'line one\nline two');
  assert.match(url, /body=line%20one%0Aline%20two/);
  assert.equal(url.includes('\n'), false, 'a raw newline would let a value forge a header');
});

test('characters that mail clients disagree about are encoded too', () => {
  const url = buildMailtoUrl('a@b.co', "it's (that)!", '*');
  for (const raw of ["'", '(', ')', '!', '*']) {
    assert.equal(url.includes(raw), false, `${raw} was left raw`);
  }
});

test('an ampersand in the notes cannot add a mailto parameter', () => {
  const url = composeMail(CONTACT_EMAIL, { ...VALUE, details: '&cc=someone@else.com' }, COPY.pt).url;
  assert.equal(url.includes('&cc='), false);
  assert.match(url, /%26cc%3D/);
});

test('the round trip decodes back to what was composed', () => {
  const mail = composeMail(CONTACT_EMAIL, VALUE, COPY.pt);
  const params = new URLSearchParams(mail.url.slice(mail.url.indexOf('?') + 1));
  assert.equal(params.get('subject'), mail.subject);
  assert.equal(params.get('body'), mail.body);
});

test('buildSubject is what composeMail uses', () => {
  assert.equal(composeMail(CONTACT_EMAIL, VALUE, COPY.pt).subject, buildSubject(VALUE));
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
      for (const entry of Array.isArray(value) ? value : [value]) {
        assert.equal(typeof entry, 'string', `${lang}.${key} is not a string`);
        assert.ok(entry.trim().length > 0, `${lang}.${key} is empty`);
      }
    }
  }
});

test('there is an error string for every validation error the logic can return', () => {
  for (const lang of LANGS) {
    for (const error of ['email_required', 'email_invalid', 'scope_invalid', 'details_long']) {
      assert.ok(COPY[lang]['err_' + error], `${lang} is missing err_${error}`);
    }
  }
});

test('there is copy for the one panel the page can show, and for the message', () => {
  for (const lang of LANGS) {
    for (const key of ['opened_h', 'opened_p', 'opened_note', 'opened_again', 'mail_intro', 'mail_none']) {
      assert.ok(COPY[lang][key], `${lang} is missing ${key}`);
    }
  }
});

test('the contact address is the one published in the policy', () => {
  assert.equal(CONTACT_EMAIL, 'mazariniapp@gmail.com');
});

test('no copy promises that the page itself sent anything', () => {
  // The page cannot know: only the visitor's own mail app can send the message.
  for (const lang of LANGS) {
    for (const key of ['opened_h', 'opened_p', 'opened_note']) {
      assert.doesNotMatch(COPY[lang][key], /recebid|received|recibid/i, `${lang}.${key} claims receipt`);
    }
  }
});
