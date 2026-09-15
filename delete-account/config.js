/* Where the deletion-request form posts.
   prod      — the live backend (default)
   dev       — the dev project; picked by `?env=dev` or on localhost/127.0.0.1
   emulator  — the local Functions emulator; picked by `?env=emulator`
   Mirrors share/config.js; see docs/SHARING.md for the same pattern on resolveInviteWeb. */

import { pickEnv } from './request-logic.js';

export const REQUEST_URLS = {
  prod: 'https://southamerica-east1-listapronta-prod.cloudfunctions.net/submitDeletionRequest',
  dev: 'https://southamerica-east1-listapronta-dev.cloudfunctions.net/submitDeletionRequest',
  emulator: 'http://127.0.0.1:5001/listapronta-dev/southamerica-east1/submitDeletionRequest'
};

/** Milliseconds before the request is aborted and the page offers the e-mail route instead. */
export const REQUEST_TIMEOUT_MS = 15000;

export function requestUrl(location) {
  return REQUEST_URLS[pickEnv(location)] || REQUEST_URLS.prod;
}

export const REQUEST_URL = requestUrl(typeof window !== 'undefined' ? window.location : null);
