**English** | [繁體中文](README.zh-TW.md)

# CineScope

A movie discovery app: browse popular titles, search, open a detail view, and build a
watchlist that survives a refresh. Built with React, TypeScript and Vite.

## Highlights

- **Zero runtime dependencies beyond React.** Routing, data fetching, theming and
  persistence are each ~40 lines of app code rather than a library, so the bundle is
  ~65 kB gzipped and there is no dependency tree to audit.
- **Deep-linkable routes.** `#/movie/5` and `#/watchlist` are shareable and survive a
  refresh on static hosting, where a History-API path would 404 without server rewrites.
- **No request races.** Every fetch runs through `useAsync`, which aborts the superseded
  request so a slow search response can't overwrite a newer one.
- **Accessible by default.** Skip link, visible focus styles, `aria-pressed` on the save
  toggles, labelled search input, `aria-busy` while loading, and `prefers-reduced-motion`
  honoured for the shimmer animations.
- **Light and dark themes.** Follows the OS until the user chooses, then remembers.
- **Real loading and empty states.** Skeletons are sized like the cards they replace, so
  content arriving doesn't shift the layout.

## Running it

```bash
npm install
npm run dev
```

The app ships with local demo data, so it runs with no configuration.

To load live data, point it at the proxy Worker (see below) — `VITE_API_BASE` is a
public URL, not a credential:

```bash
cp .env.example .env
# then set VITE_API_BASE=https://<your-worker>.workers.dev
```

## The TMDB key never reaches the browser

A Vite app calling TMDB directly would have to ship the API key in its bundle, where
anyone can read it. So it doesn't: `worker/` is a small Cloudflare Worker that holds the
key as a secret and forwards requests server-side.

It is not an open relay. Only the three endpoints this app uses are reachable, only
allowlisted origins may call it, unknown query parameters are dropped, and a missing
origin allowlist fails closed. Responses are cached at the edge, so repeat views cost
TMDB nothing.

Deploying it:

```bash
cd worker
npx wrangler deploy
npx wrangler secret put TMDB_KEY   # prompts for the key; never stored in the repo
```

Then set `ALLOWED_ORIGINS` in `worker/wrangler.toml` to your own origins, and add the
Worker URL as a repo variable named `API_BASE` so the deploy workflow picks it up:

```bash
gh variable set API_BASE --body "https://<your-worker>.workers.dev"
```

## Checks

```bash
npm run check   # assert-based self-checks for the pure logic
npm run lint    # oxlint
npm run build   # typecheck + production build
```

`npm run check` covers hash parsing (bad ids, query strings, round-tripping), the
formatting helpers, and the Worker's route and origin allowlists — the logic that can
silently produce wrong output, or quietly expose something, without ever throwing.

## Structure

| Path | Purpose |
| --- | --- |
| `src/lib/tmdb.ts` | Data layer; maps API shapes to UI-ready domain types, falls back to demo data |
| `src/lib/useRoute.ts` | Hash router |
| `src/lib/useAsync.ts` | Fetch lifecycle: loading, error, abort |
| `src/lib/useWatchlist.ts` | localStorage-backed store shared via `useSyncExternalStore` |
| `src/lib/useTheme.ts` | Theme with OS default and persistence |
| `src/components/` | Header, MovieCard, MovieGrid, DetailView |
| `worker/` | Cloudflare Worker proxying TMDB so the API key stays server-side |

Movie data from [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is
not endorsed or certified by TMDB.
