// Run: node --experimental-strip-types worker/src/routes.selfcheck.ts
// These allowlists are the only thing stopping the proxy from being a free public
// TMDB relay, so they get checked directly.
import assert from "node:assert/strict";
import { matchRoute, safeParams, parseOrigins, isAllowedOrigin } from "./routes.ts";

// --- routes ---------------------------------------------------------------
assert.ok(matchRoute("/movie/popular"), "popular is proxied");
assert.ok(matchRoute("/movie/550"), "movie detail is proxied");
assert.ok(matchRoute("/search/movie"), "search is proxied");

for (const bad of [
  "/", // nothing at the root
  "/movie", // incomplete
  "/movie/popular/extra",
  "/movie/abc", // id must be numeric
  "/movie/550/credits", // sub-resources are not ours to expose
  "/account", // account endpoints must never be reachable
  "/authentication/token/new",
  "/person/popular",
  "//movie/popular", // protocol-relative style path
  "/MOVIE/POPULAR", // case must not slip through
]) {
  assert.equal(matchRoute(bad), null, `${bad} must not be proxied`);
}

assert.equal(matchRoute("/movie/1234567890"), null, "absurdly long ids are refused");

// --- params ---------------------------------------------------------------
const params = safeParams(
  new URLSearchParams("query=alien&page=2&api_key=leaked&language=de&include_adult=false"),
);
assert.equal(params.get("query"), "alien");
assert.equal(params.get("page"), "2");
assert.equal(params.get("include_adult"), "false");
assert.equal(params.get("api_key"), null, "a caller-supplied key is never forwarded");
assert.equal(params.get("language"), null, "unlisted params are dropped");

// Same params in a different order must produce the same string, or the edge cache
// stores a separate copy per ordering.
assert.equal(
  safeParams(new URLSearchParams("page=1&query=dune")).toString(),
  safeParams(new URLSearchParams("query=dune&page=1")).toString(),
  "param order must not change the cache key",
);

assert.equal(safeParams(new URLSearchParams("query=")).toString(), "", "empty values are dropped");

// --- origins --------------------------------------------------------------
const allowed = parseOrigins("https://nathanc90.github.io, http://localhost:5173");
assert.deepEqual(allowed, ["https://nathanc90.github.io", "http://localhost:5173"]);

assert.equal(isAllowedOrigin("https://nathanc90.github.io", allowed), true);
assert.equal(isAllowedOrigin("http://localhost:5173", allowed), true);
assert.equal(isAllowedOrigin("https://evil.example", allowed), false);
assert.equal(isAllowedOrigin(null, allowed), false, "a missing Origin is not allowed");
assert.equal(
  isAllowedOrigin("https://nathanc90.github.io.evil.example", allowed),
  false,
  "suffix lookalikes must not match",
);

// A missing allowlist must fail closed, not open the proxy to everyone.
assert.equal(isAllowedOrigin("https://nathanc90.github.io", parseOrigins(undefined)), false);
assert.equal(isAllowedOrigin("https://anything.example", parseOrigins("")), false);

console.log("worker routes: all checks passed");
