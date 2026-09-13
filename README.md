# listapronta.app

The public website for **Lista Pronta**, the shared shopping-list app for Android.
Static GitHub Pages site: plain HTML, CSS and vanilla JavaScript — no framework, no
build step, no bundler. The only external resource is the Google Fonts stylesheet for
Nunito (600/700/800), with a system fallback stack.

It serves two pages:

- **`/`** — the landing page (PT default, EN and ES through a small JS dictionary).
- **`/share/`** — the invitation page an invite link opens
  (`https://listapronta.app/share/?invite=<token>`), which also is the app's verified
  Android App Link.

## Structure

```
index.html                 landing page (PT is the markup default)
styles.css                 all styles for every page (tokens from the app theme)
site.js                    landing-page behaviour + PT/EN/ES dictionary
share/index.html           invitation page (mint ground, noindex)
share/share.js             DOM only: renders the states, wires the CTAs
share/invite-logic.js      pure logic (token, URLs, state mapping) — ES module, unit tested
share/config.js            which resolveInviteWeb backend to call
tests/share-state.test.mjs node --test suite for share/invite-logic.js
assets/                    appicon, bag, emptybag, cat_* category stickers
assets/avatars/            avatar_01 … avatar_30 (the app's full avatar set)
.well-known/assetlinks.json  Android App Link verification
.nojekyll                  so GitHub Pages serves /.well-known/
404.html                   not-found page, links home
CNAME                      listapronta.app — do not edit
```

## Running it locally

```sh
python3 -m http.server 8787
```

Then open:

- `http://127.0.0.1:8787/` — landing page
- `http://127.0.0.1:8787/?lang=en` (or `#en`, or the PT/EN/ES pills) — other languages
- `http://127.0.0.1:8787/share/?invite=<43-char token>` — invitation page
- `http://127.0.0.1:8787/share/` — no token, renders the "invite is not valid" state

Serve from the repository root: `share/index.html` loads `../styles.css` and
`../assets/…`, and `share/share.js` is an ES module, so opening the files over
`file://` will not work.

### Tests

```sh
node --test                       # from the repository root
node --test tests/*.test.mjs      # or just this suite
```

No dependencies, no `package.json` — the suite only uses `node:test` and
`node:assert`. It covers `share/invite-logic.js`: token validation, the Play URL with
the encoded install referrer, the `intent://` URL, avatar-id mapping, environment
selection and the mapping from every API outcome (valid / invalid / disabled /
unavailable / malformed JSON / rate limit / server error / network failure) onto a
page state, plus the invitation sentence and the members line.

## How the share page works

1. It reads `invite` from the query string and checks it against
   `^[A-Za-z0-9_-]{43}$` (the documented token shape, see `docs/SHARING.md` in the app
   repository). A missing or malformed token renders the "invite is not valid" state
   and **no request is made**.
2. It `POST`s `{"token": "…"}` as JSON to `resolveInviteWeb`, aborting after 10 s
   through an `AbortController`.
3. It renders one of: **loading**, **valid**, **invalid/disabled**, **unavailable**,
   **offline / temporary failure** (with a "Tentar de novo" button). The status is also
   announced through an `aria-live="polite"` region.
4. Server values (owner name, list name, avatar id) are written with `textContent` and
   `createTextNode` — never `innerHTML`. The avatar id is matched against
   `avatar_01 … avatar_30` before it becomes a file path.

### Backend configuration (`share/config.js`)

| Environment | When it is used | URL |
| --- | --- | --- |
| `prod` | default | `https://southamerica-east1-listapronta-prod.cloudfunctions.net/resolveInviteWeb` |
| `dev` | `?env=dev`, or hostname `localhost` / `127.0.0.1` | `https://southamerica-east1-listapronta-dev.cloudfunctions.net/resolveInviteWeb` |
| `emulator` | `?env=emulator` | `http://127.0.0.1:5001/listapronta-dev/southamerica-east1/resolveInviteWeb` |

`?env=prod` forces production even on localhost. The function must allow the calling
origin through its CORS allow-list (`https://listapronta.app`, plus localhost in the
emulator), otherwise the page falls back to the offline state.

## What still has to be filled in

### 1. The Play App Signing fingerprint in `.well-known/assetlinks.json`

`assetlinks.json` currently lists **only the debug signing certificate**:

```
3B:10:56:EC:4B:72:97:24:29:0B:8C:71:B5:FA:FA:A5:65:3B:7E:6C:57:F5:5C:D3:35:0F:2E:2D:D5:47:90:39
```

App Links will **not** verify for builds installed from Google Play until the
**Play App Signing SHA-256** is added as a second entry in
`sha256_cert_fingerprints`. JSON has no comments, so this note is the placeholder.

Get it from *Play Console → your app → Test and release → Setup → App signing →
App signing key certificate → SHA-256 certificate fingerprint*, then:

```json
"sha256_cert_fingerprints": [
  "3B:10:56:EC:4B:72:97:24:29:0B:8C:71:B5:FA:FA:A5:65:3B:7E:6C:57:F5:5C:D3:35:0F:2E:2D:D5:47:90:39",
  "PASTE:THE:PLAY:APP:SIGNING:SHA256:HERE"
]
```

Verify afterwards with
`https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://listapronta.app&relation=delegate_permission/common.handle_all_urls`.

### 2. Privacy policy and Terms of use

The footer shows them as `[em breve] / [coming soon] / [próximamente]` placeholders —
plain text, not links. Replace the `<span>` elements in `index.html` (keys `privacy`
and `terms` in `site.js`) with real links once the documents exist.

## Notes

- **`noindex`**: `/share/` and `404.html` carry `<meta name="robots" content="noindex">`.
  Invitation URLs are personal, single-purpose links and must not end up in search
  results. The landing page is indexable.
- **`.nojekyll`** is required: without it GitHub Pages runs Jekyll, which skips
  directories starting with a dot, and `/.well-known/assetlinks.json` would 404 —
  breaking App Link verification.
- **No JS, no problem**: the landing page is fully readable in Portuguese without
  JavaScript. JS only adds the language switch and the interactive list demos.
- **Reduced motion**: every animation is disabled under
  `@media (prefers-reduced-motion: reduce)`.
- **`CNAME`** holds the custom domain and must stay exactly as it is.
