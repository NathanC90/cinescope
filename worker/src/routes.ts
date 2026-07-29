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

/** Query parameters we forward. Anything else is dropped rather than passed along. */
export const ALLOWED_PARAMS = ["page", "query", "include_adult", "append_to_response"];

export function matchRoute(pathname: string): Route | null {
  return ROUTES.find((r) => r.pattern.test(pathname)) ?? null;
}

/**
 * Filtered, order-stable params. Sorting matters: it keeps the cache key identical
 * for requests that differ only in parameter order.
 */
export function safeParams(params: URLSearchParams): URLSearchParams {
  const out = new URLSearchParams();
  for (const key of [...ALLOWED_PARAMS].sort()) {
    const value = params.get(key);
    if (value !== null && value !== "") out.set(key, value);
  }
  return out;
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
