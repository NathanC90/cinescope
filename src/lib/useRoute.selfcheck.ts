// Run: npm run check
// Covers hash parsing, which is the one piece of routing logic that can silently
// misroute (bad ids, trailing slashes, query strings) without throwing.
import assert from "node:assert/strict";
import { parseHash, hrefFor } from "./useRoute.ts";

// Home, and anything unrecognised, falls back to home rather than rendering nothing.
assert.deepEqual(parseHash(""), { name: "home" });
assert.deepEqual(parseHash("#"), { name: "home" });
assert.deepEqual(parseHash("#/"), { name: "home" });
assert.deepEqual(parseHash("#/nonsense"), { name: "home" });

assert.deepEqual(parseHash("#/watchlist"), { name: "watchlist" });

assert.deepEqual(parseHash("#/movie/42"), { name: "movie", id: 42 });
assert.deepEqual(parseHash("#movie/42"), { name: "movie", id: 42 }, "tolerates a missing slash");
assert.deepEqual(parseHash("#/movie/42?ref=share"), { name: "movie", id: 42 }, "ignores query strings");

// Non-numeric, zero, negative and fractional ids must not reach the fetch layer.
for (const bad of ["#/movie/abc", "#/movie/", "#/movie/0", "#/movie/-3", "#/movie/1.5", "#/movie/NaN"]) {
  assert.deepEqual(parseHash(bad), { name: "home" }, `${bad} should fall back to home`);
}

// hrefFor and parseHash must round-trip, or links would point at the wrong view.
for (const route of [{ name: "home" }, { name: "watchlist" }, { name: "movie", id: 7 }] as const) {
  assert.deepEqual(parseHash(hrefFor(route)), route, `round-trip failed for ${route.name}`);
}

console.log("useRoute.ts: all checks passed");
