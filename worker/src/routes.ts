// Pure request-shaping for the proxy. No network, no secrets — so routes.selfcheck.ts
// can prove the allowlists hold without deploying anything.
//
// The point of the allowlists: a proxy that forwards any path with a valid key is just
// a free public TMDB relay with your name on it. Only what CineScope actually calls
// gets through.

export interface Route {
  pattern: RegExp;
  /** Seconds to cache at the edge. Popular/detail move slowly; searches less so. */
  ttl: number;
}

export const ROUTES: Route[] = [
  { pattern: /^\/movie\/popular$/, ttl: 3600 },
  { pattern: /^\/movie\/\d{1,9}$/, ttl: 3600 },
  { pattern: /^\/search\/movie$/, ttl: 600 },
];

/** Only these are caller-controlled. Everything else is either dropped or pinned by
 *  the proxy below — the less a caller can steer, the smaller the surface. */
export const ALLOWED_PARAMS = ["page", "query"];

/** TMDB paginates to 500; anything beyond is an error response we'd rather not fetch. */
export const MAX_PAGE = 500;
/** Long enough for any real title, short enough not to be a payload. */
export const MAX_QUERY = 120;

export function matchRoute(pathname: string): Route | null {
  return ROUTES.find((r) => r.pattern.test(pathname)) ?? null;
}

/**
 * Filtered, clamped, order-stable params. Sorting matters: it keeps the cache key
 * identical for requests that differ only in parameter order.
 *
 * `pathname` decides the pinned values: adult content is never enabled regardless of
 * what the caller asks for, and credits are appended only on the detail endpoint.
 */
export function safeParams(params: URLSearchParams, pathname = ""): URLSearchParams {
  const out = new URLSearchParams();

  for (const key of [...ALLOWED_PARAMS].sort()) {
    let value = params.get(key);
    if (value === null || value === "") continue;

    if (key === "page") {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1) continue;
      value = String(Math.min(n, MAX_PAGE));
    }
    if (key === "query") value = value.slice(0, MAX_QUERY);

    out.set(key, value);
  }

  // Pinned server-side, never taken from the caller.
  out.set("include_adult", "false");
  if (/^\/movie\/\d+$/.test(pathname)) out.set("append_to_response", "credits");

  // Re-sort so the pinned keys land in a stable position for the cache key.
  const sorted = new URLSearchParams();
  for (const key of [...out.keys()].sort()) sorted.set(key, out.get(key)!);
  return sorted;
}

/** Origins allowed to call the proxy, from a comma-separated env var. */
export function parseOrigins(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAllowedOrigin(origin: string | null, allowed: string[]): boolean {
  // No allowlist configured means the proxy is unrestricted — refuse instead, so a
  // missing env var fails closed rather than opening the key up to any site.
  if (allowed.length === 0) return false;
  return origin !== null && allowed.includes(origin);
}
