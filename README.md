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

The app ships with local demo data, so it runs with no configuration. To load live data,
add a free [TMDB](https://www.themoviedb.org/settings/api) key:

```bash
cp .env.example .env
# then set VITE_TMDB_KEY=your_key
```

## Checks

```bash
npm run check   # assert-based self-checks for the pure logic
npm run lint    # oxlint
npm run build   # typecheck + production build
```

`npm run check` covers hash parsing (bad ids, query strings, round-tripping) and the
formatting helpers — the logic that can silently produce wrong output without throwing.

## Structure

| Path | Purpose |
| --- | --- |
| `src/lib/tmdb.ts` | Data layer; maps API shapes to UI-ready domain types, falls back to demo data |
| `src/lib/useRoute.ts` | Hash router |
| `src/lib/useAsync.ts` | Fetch lifecycle: loading, error, abort |
| `src/lib/useWatchlist.ts` | localStorage-backed store shared via `useSyncExternalStore` |
| `src/lib/useTheme.ts` | Theme with OS default and persistence |
| `src/components/` | Header, MovieCard, MovieGrid, DetailView |

Movie data from [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is
not endorsed or certified by TMDB.
