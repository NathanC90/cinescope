// TMDB proxy. The API key lives here as a Worker secret and is attached server-side,
// so it never reaches the browser — which is the whole reason this exists.
//
// Guarantees worth stating plainly:
//   - the key is never echoed in a response, an error, or a cache key
//   - only the three endpoints CineScope uses are reachable (see routes.ts)
//   - a missing origin allowlist fails closed
import { matchRoute, safeParams, parseOrigins, isAllowedOrigin } from "./routes";

export interface Env {
  /** wrangler secret put TMDB_KEY */
  TMDB_KEY: string;
  /** Comma-separated origins allowed to call this proxy. */
  ALLOWED_ORIGINS: string;
}

const TMDB = "https://api.themoviedb.org/3";

function cors(origin: string | null): Record<string, string> {
  return origin
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
      }
    : { Vary: "Origin" };
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = request.headers.get("Origin");
    const allowed = parseOrigins(env.ALLOWED_ORIGINS);
    const ok = isAllowedOrigin(origin, allowed);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: ok ? 204 : 403, headers: cors(ok ? origin : null) });
    }
    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405, null);
    }
    if (!ok) {
      return json({ error: "Origin not allowed" }, 403, null);
    }

    const url = new URL(request.url);
    const route = matchRoute(url.pathname);
    if (!route) {
      return json({ error: "Not found" }, 404, origin);
    }

    const params = safeParams(url.searchParams, url.pathname);

    // Cache key is built from the public request only — never from the upstream URL,
    // which carries the key and would write it into the cache index.
    const cacheKey = new Request(`${url.origin}${url.pathname}?${params}`, { method: "GET" });
    const cache = caches.default;

    const hit = await cache.match(cacheKey);
    if (hit) {
      const cached = new Response(hit.body, hit);
      for (const [k, v] of Object.entries(cors(origin))) cached.headers.set(k, v);
      cached.headers.set("X-Proxy-Cache", "HIT");
      return cached;
    }

    const upstream = new URL(TMDB + url.pathname);
    for (const [k, v] of params) upstream.searchParams.set(k, v);
    upstream.searchParams.set("api_key", env.TMDB_KEY);

    let tmdb: Response;
    try {
      tmdb = await fetch(upstream.toString(), { headers: { Accept: "application/json" } });
    } catch {
      // Deliberately generic: an upstream error message could contain the request URL.
      return json({ error: "Upstream request failed" }, 502, origin);
    }

    if (!tmdb.ok) {
      return json({ error: `TMDB responded ${tmdb.status}` }, tmdb.status, origin);
    }

    const body = await tmdb.text();
    const response = new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${route.ttl}`,
        ...cors(origin),
      },
    });

    // Cache without the CORS headers baked in, so a second allowed origin isn't served
    // another origin's Access-Control-Allow-Origin value.
    const forCache = new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${route.ttl}`,
      },
    });
    ctx.waitUntil(cache.put(cacheKey, forCache));

    response.headers.set("X-Proxy-Cache", "MISS");
    return response;
  },
};
