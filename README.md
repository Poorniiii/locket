# Locket

A private offline diary that lives only on your device. Your entries are encrypted with your password and never sent anywhere.

*(Originally created with CodeSandbox as "Shy Breeze Diary"; rebranded to Locket as it grew into a full offline-first app.)*

## What it does

- **Sign up once per device** with a user name and password. Everything is stored locally in the browser's IndexedDB, encrypted with a key derived from your password.
- **Log in** any time with your password to unlock your diary. There is no password recovery — the signup screen warns you and requires you to acknowledge it before continuing.
- **Write, save, submit, archive, favorite, edit, delete** diary entries — same model as a paper notebook page: drafts are editable the day you create them, submitted entries are final.
- **Time-stamped entries.** Each entry records its creation time (date and local time) and the list is auto-sorted by that timestamp — newest first by default. The Sort button flips ascending / descending.
- **Confirmation dialogs** for destructive actions. Deleting an entry or deleting your account asks for explicit confirmation through a styled modal — no surprise data loss.
- **Export an encrypted backup** to a `.locket` file. Move it to another device (email it to yourself, drop it in cloud storage), then **import** there. Same password unlocks it on the new device.
- **Works offline.** It's a Progressive Web App — once you've loaded it, it runs without an internet connection. **Settings → Install** offers a one-tap install on Chrome / Edge; Safari and Firefox get clear "Add to Home Screen" instructions in the same place.
- **Looks the same on phone, tablet, and desktop**, with the layout adapting and the menu collapsing to icons on small screens.

## Tech stack

- **React 18** + **TypeScript** (strict mode)
- **Redux Toolkit** + `react-redux` for state, with a thin custom middleware that re-encrypts and persists the diary after every change.
- **Vite 5** + `@vitejs/plugin-react-swc`
- **`vite-plugin-pwa`** for the service worker + manifest (offline + installability)
- **`react-router-dom` 6** for routing, with `AuthGate` / `RequireAuth` for route protection
- **`react-bootstrap`** for Modal / Toast / OverlayTrigger / Tooltip
- **Web Crypto API** for encryption (AES-GCM, 256-bit) and key derivation (PBKDF2-HMAC-SHA-256, 200 000 iterations)
- **IndexedDB** for storing the encrypted blob (one record per device)
- **ESLint** with TypeScript, React, React Hooks, JSX a11y plugins

## Run locally

```bash
npm install
npm run dev       # start dev server on http://localhost:3000
npm run build     # type-check (tsc) + production build to ./dist
npm run preview   # preview the production build
npm run lint      # ESLint over ts/tsx files
```

## How auth works (the short version)

1. On signup, a 16-byte random **salt** is generated. The password + salt go through PBKDF2 to produce a 256-bit AES-GCM **key**.
2. The diary blob (`{ profile, pages }`) is encrypted with the key and a fresh 12-byte **IV**. The ciphertext, salt, and IV are written to IndexedDB. The password itself is never stored.
3. Every diary change (add / update / delete / sort) triggers a re-encrypt with a new IV and a write to IndexedDB — handled by [src/middleware/persistMiddleware.ts](src/middleware/persistMiddleware.ts).
4. On login, the entered password is re-derived against the stored salt; the resulting key is tried against the ciphertext. Decrypt succeeds → you're in. Decrypt fails → wrong password.
5. On logout, the in-memory key is wiped. The ciphertext stays on disk until you log back in or delete the account.

## Sort + timestamps

Each diary entry stamps its own `createdAt` (ISO timestamp) when first written. The `pages` slice keeps the list sorted by that timestamp on every mutation, so the order doesn't drift around as you add/edit. The Sort button on Home / Favorites / Archives flips ascending vs descending and re-applies; the chosen direction lives in slice state for the session. Old entries that pre-date the timestamp field still load, they just sort to the end.

## Export / Import

- **Export** (Settings → Export backup): downloads `locket-backup-YYYY-MM-DD.locket`, a JSON wrapper around the encrypted blob.
- **Import** on another device: pick the file from Settings → confirm the replace prompt → log in with the same password used on the source device.

The export file is the same encrypted bytes that live in IndexedDB — there is no plaintext in it.

## Project layout

```
src/
  main.tsx                 # Vite entry, mounts <App>, registers service worker
  App.tsx                  # Router + AuthGate + RequireAuth wiring
  store.ts                 # Redux store with auth + pages + persist middleware
  hooks.ts                 # Typed useAppDispatch / useAppSelector
  styles.css               # Global styles + design tokens
  types/
    page.ts                # DiaryPage interface
  features/
    authSlice.ts           # status / profile / errors
    pageSlice.ts           # addPage / updatePage / deletePage / sortPages / hydrate / reset
  middleware/
    persistMiddleware.ts   # re-encrypts diary on every pages/* action
  hooks/
    useBootAuth.ts         # Boots auth state from IndexedDB on mount
  crypto/
    encoding.ts            # base64 ↔ Uint8Array + UTF-8 helpers
    keyDerivation.ts       # PBKDF2 → AES-GCM key
    encryption.ts          # encryptJson / decryptJson with AES-GCM
    keyStore.ts            # in-memory CryptoKey holder (cleared on logout)
  storage/
    db.ts                  # IndexedDB wrapper: getAccount / saveAccount / clearAccount
  utils/
    date.ts                # todayLocalDate, formatTimeOfDay
    session.ts             # lockSession, clearLocalAccount (shared logout/clear flows)
  components/
    AuthGate.tsx           # routes to Signup or Login based on whether an account exists
    RequireAuth.tsx        # redirects to / if not unlocked
    Login.tsx              # password-only login form
    Signup.tsx             # user name + password + ack checkbox
    Settings.tsx           # profile + Export / Import / Logout / Delete account
    TopBar.tsx             # brand + nav + tooltips
    Layout.tsx             # TopBar + main wrapper
    Home.tsx               # /home (ListOfNotes)
    ListOfNotes.tsx        # card grid + add / sort / per-card actions
    NewPage.tsx            # create/edit modal (Save / Submit / Update)
    ShowPage.tsx           # read-only view modal
    Favorites.tsx          # /favorites
    Archives.tsx           # /archives
    CardDate.tsx           # shared date + time display for cards
    ConfirmDialog.tsx      # shared confirmation modal (used for delete entry, delete account, replace-on-import)
  images/                  # SVG icons
public/
  icons/locket.svg         # PWA + favicon icon
```

## What's intentionally not built

- Password recovery — the password is the only key; there is no backup of it. The signup screen warns and requires an acknowledgement before letting you continue.
- Multi-account support on a single device — it's one Locket per device, by design.
- Cloud sync — export/import is the deliberate substitute.
- Server-side anything — there is no backend.
