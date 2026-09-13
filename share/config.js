/* Where the invitation page resolves tokens.
   prod      — the live backend (default)
   dev       — the dev project; picked by `?env=dev` or on localhost/127.0.0.1
   emulator  — the local Functions emulator; picked by `?env=emulator`
   See docs/SHARING.md → "Cloud Functions" → resolveInviteWeb. */

import { pickEnv } from './invite-logic.js';

export const RESOLVE_URLS = {
  prod: 'https://southamerica-east1-listapronta-prod.cloudfunctions.net/resolveInviteWeb',
  dev: 'https://southamerica-east1-listapronta-dev.cloudfunctions.net/resolveInviteWeb',
  emulator: 'http://127.0.0.1:5001/listapronta-dev/southamerica-east1/resolveInviteWeb'
};

/** Milliseconds before the request is aborted and the page shows "offline". */
export const REQUEST_TIMEOUT_MS = 10000;

export function resolveUrl(location) {
  return RESOLVE_URLS[pickEnv(location)] || RESOLVE_URLS.prod;
}

export const RESOLVE_URL = resolveUrl(typeof window !== 'undefined' ? window.location : null);
