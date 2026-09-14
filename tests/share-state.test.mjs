/* Unit tests for the invitation page logic.
   Run with:  node --test tests/          (no dependencies) */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TOKEN_RE, PLAY_BASE,
  isValidToken, readToken, playUrl, appLinkUrl, intentUrl, avatarSrc,
  pickEnv, stateFromPayload, mapApiResult, resolveState,
  messageParts, membersCaption
} from '../share/invite-logic.js';

const TOKEN = 'A'.repeat(43);
const TOKEN_MIXED = 'aZ0_-' + 'b'.repeat(38);

/* -------------------------------------------------------------- tokens */

test('token regex matches the documented shape', () => {
  assert.equal(TOKEN_RE.source, '^[A-Za-z0-9_-]{43}$');
});

test('isValidToken accepts 43 base64url chars', () => {
  assert.equal(isValidToken(TOKEN), true);
  assert.equal(isValidToken(TOKEN_MIXED), true);
});

test('isValidToken rejects malformed tokens', () => {
  assert.equal(isValidToken('A'.repeat(42)), false);
  assert.equal(isValidToken('A'.repeat(44)), false);
  assert.equal(isValidToken('A'.repeat(42) + '='), false, 'padding is not allowed');
  assert.equal(isValidToken('A'.repeat(42) + '+'), false, 'base64 (not url) chars are rejected');
  assert.equal(isValidToken('A'.repeat(42) + ' '), false);
  assert.equal(isValidToken(''), false);
  assert.equal(isValidToken(null), false);
  assert.equal(isValidToken(undefined), false);
  assert.equal(isValidToken(12345), false);
});

test('readToken pulls invite out of a query string', () => {
  assert.equal(readToken('?invite=' + TOKEN), TOKEN);
  assert.equal(readToken('invite=' + TOKEN), TOKEN);
  assert.equal(readToken('?env=dev&invite=' + TOKEN), TOKEN);
  assert.equal(readToken('?invite=' + TOKEN + '&env=dev'), TOKEN);
});

test('readToken returns empty when there is no token', () => {
  assert.equal(readToken(''), '');
  assert.equal(readToken('?'), '');
  assert.equal(readToken('?env=dev'), '');
  assert.equal(readToken('?invite='), '');
  assert.equal(readToken(null), '');
});

test('readToken decodes percent-encoding without throwing on bad input', () => {
  assert.equal(readToken('?invite=a%2Db'), 'a-b');
  assert.equal(readToken('?invite=%E0%A4%A'), '%E0%A4%A');
});

/* ----------------------------------------------------------------- urls */

test('playUrl carries the invite as an encoded install referrer', () => {
  assert.equal(playUrl(TOKEN), PLAY_BASE + '&referrer=invite%3D' + TOKEN);
});

test('playUrl encodes the = of invite= and nothing else for a valid token', () => {
  const url = playUrl(TOKEN_MIXED);
  assert.equal(url, PLAY_BASE + '&referrer=invite%3D' + TOKEN_MIXED);
  assert.equal(new URL(url).searchParams.get('referrer'), 'invite=' + TOKEN_MIXED);
  assert.equal(new URL(url).searchParams.get('id'), 'app.mazarini.listapronta');
});

test('playUrl falls back to the plain store page for a bad token', () => {
  assert.equal(playUrl('nope'), PLAY_BASE);
  assert.equal(playUrl(''), PLAY_BASE);
});

test('appLinkUrl is the page own https url', () => {
  assert.equal(appLinkUrl(TOKEN), 'https://listapronta.app/share/?invite=' + TOKEN);
  assert.equal(appLinkUrl('nope'), 'https://listapronta.app/share/');
});

test('intentUrl targets the app package with an https fallback', () => {
  const url = intentUrl(TOKEN);
  assert.ok(url.startsWith('intent://listapronta.app/share/?invite=' + TOKEN + '#Intent;'));
  assert.ok(url.includes(';scheme=https;'));
  assert.ok(url.includes(';package=app.mazarini.listapronta;'));
  assert.ok(url.includes('S.browser_fallback_url=' + encodeURIComponent(appLinkUrl(TOKEN))));
  assert.ok(url.endsWith(';end'));
});

test('avatarSrc maps an avatar id onto a bundled file', () => {
  assert.equal(avatarSrc('avatar_07'), '../assets/avatars/avatar_07.webp');
  assert.equal(avatarSrc('avatar_30'), '../assets/avatars/avatar_30.webp');
  assert.equal(avatarSrc('avatar_07', 'assets/avatars/'), 'assets/avatars/avatar_07.webp');
});

test('avatarSrc falls back for ids outside the bundled set', () => {
  assert.equal(avatarSrc('avatar_31'), '../assets/avatars/avatar_01.webp');
  assert.equal(avatarSrc('avatar_00'), '../assets/avatars/avatar_01.webp');
  assert.equal(avatarSrc('../../etc/passwd'), '../assets/avatars/avatar_01.webp');
  assert.equal(avatarSrc(''), '../assets/avatars/avatar_01.webp');
  assert.equal(avatarSrc(undefined), '../assets/avatars/avatar_01.webp');
});

/* ------------------------------------------------------------ environment */

test('pickEnv defaults to prod and switches on localhost or ?env', () => {
  assert.equal(pickEnv({ hostname: 'listapronta.app', search: '' }), 'prod');
  assert.equal(pickEnv({ hostname: 'localhost', search: '' }), 'dev');
  assert.equal(pickEnv({ hostname: '127.0.0.1', search: '' }), 'dev');
  assert.equal(pickEnv({ hostname: 'listapronta.app', search: '?env=dev' }), 'dev');
  assert.equal(pickEnv({ hostname: 'localhost', search: '?env=emulator' }), 'emulator');
  assert.equal(pickEnv({ hostname: 'localhost', search: '?env=prod' }), 'prod');
  assert.equal(pickEnv(null), 'dev');
});

/* ------------------------------------------------------------ api states */

test('a valid payload becomes the valid state', () => {
  const state = stateFromPayload({
    status: 'valid', listName: 'Churrasco', ownerName: 'João',
    ownerAvatarId: 'avatar_02', memberCount: 3
  });
  assert.deepEqual(state, {
    state: 'valid', ownerName: 'João', listName: 'Churrasco',
    ownerAvatarId: 'avatar_02', memberCount: 3
  });
});

test('valid payloads survive missing optional fields', () => {
  const state = stateFromPayload({ status: 'valid' });
  assert.equal(state.state, 'valid');
  assert.equal(state.memberCount, 1);
  assert.equal(state.ownerAvatarId, '');
  assert.ok(state.ownerName.length > 0);
  assert.ok(state.listName.length > 0);
});

test('invalid and disabled both read as "this invite does not work"', () => {
  assert.deepEqual(stateFromPayload({ status: 'invalid' }), { state: 'invalid' });
  assert.deepEqual(stateFromPayload({ status: 'disabled' }), { state: 'invalid' });
});

test('unavailable reads as "the list is gone"', () => {
  assert.deepEqual(stateFromPayload({ status: 'unavailable' }), { state: 'gone' });
});

test('an unknown or missing status is treated as temporary', () => {
  assert.deepEqual(stateFromPayload({ status: 'wat' }), { state: 'offline' });
  assert.deepEqual(stateFromPayload({}), { state: 'offline' });
  assert.deepEqual(stateFromPayload(null), { state: 'offline' });
  assert.deepEqual(stateFromPayload('valid'), { state: 'offline' });
});

test('network and timeout failures map to offline', () => {
  assert.deepEqual(mapApiResult({ error: 'network' }), { state: 'offline' });
  assert.deepEqual(mapApiResult({ error: 'timeout' }), { state: 'offline' });
  assert.deepEqual(mapApiResult(undefined), { state: 'offline' });
});

test('malformed JSON maps to offline, not to invalid', () => {
  assert.deepEqual(mapApiResult({ httpStatus: 200, parseError: true }), { state: 'offline' });
});

test('rate limiting and server errors map to offline', () => {
  assert.deepEqual(mapApiResult({ httpStatus: 429 }), { state: 'offline' });
  assert.deepEqual(mapApiResult({ httpStatus: 500 }), { state: 'offline' });
  assert.deepEqual(mapApiResult({ httpStatus: 503 }), { state: 'offline' });
});

test('a 400 (malformed body) maps to invalid', () => {
  assert.deepEqual(mapApiResult({ httpStatus: 400, json: { error: 'bad request' } }), { state: 'invalid' });
});

test('a 200 payload is mapped by status', () => {
  assert.equal(mapApiResult({ httpStatus: 200, json: { status: 'valid', listName: 'L', ownerName: 'O' } }).state, 'valid');
  assert.equal(mapApiResult({ httpStatus: 200, json: { status: 'disabled' } }).state, 'invalid');
  assert.equal(mapApiResult({ httpStatus: 200, json: { status: 'unavailable' } }).state, 'gone');
});

test('a malformed token is invalid without any API result', () => {
  assert.deepEqual(resolveState('nope', { httpStatus: 200, json: { status: 'valid' } }), { state: 'invalid' });
  assert.deepEqual(resolveState('', null), { state: 'invalid' });
});

test('a good token still goes through the API mapping', () => {
  assert.equal(resolveState(TOKEN, { httpStatus: 200, json: { status: 'valid', ownerName: 'Ana', listName: 'Feira' } }).state, 'valid');
  assert.equal(resolveState(TOKEN, { error: 'network' }).state, 'offline');
});

/* ------------------------------------------------------------- messages */

test('the invitation sentence is split into plain text parts', () => {
  const parts = messageParts('João');
  assert.deepEqual(parts, [
    { text: 'João', strong: true },
    { text: ' compartilhou uma lista com você', strong: false }
  ]);
  assert.equal(parts.map((p) => p.text).join(''), 'João compartilhou uma lista com você');
});

test('the sentence never repeats the list name — the chip below carries it', () => {
  const joined = messageParts('João').map((p) => p.text).join('');
  assert.equal(joined.includes('Churrasco'), false);
  assert.equal(messageParts('João', 'Churrasco').map((p) => p.text).join(''), joined);
});

test('message parts never carry markup — the page renders them as text', () => {
  const parts = messageParts('<img src=x onerror=alert(1)>');
  assert.equal(parts[0].text, '<img src=x onerror=alert(1)>');
  parts.forEach((p) => assert.equal(typeof p.text, 'string'));
});

test('the members line only appears when the list has more than one person', () => {
  assert.equal(membersCaption('João', 1), null);
  assert.equal(membersCaption('João', 0), null);
  assert.equal(membersCaption('João', undefined), null);
  assert.equal(membersCaption('João', 2), 'João e mais 1 pessoa');
  assert.equal(membersCaption('João', 3), 'João e mais 2 pessoas');
  assert.equal(membersCaption('João', 12), 'João e mais 11 pessoas');
});
