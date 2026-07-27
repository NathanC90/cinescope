// Runnable check for the pure helpers — no framework.
//   node --experimental-strip-types src/lib/format.selfcheck.ts
import assert from "node:assert/strict";
import { imageUrl, formatRuntime, formatRating, formatYear, gradientFor } from "./format.ts";

assert.equal(imageUrl("/abc.jpg"), "https://image.tmdb.org/t/p/w500/abc.jpg");
assert.equal(imageUrl("/abc.jpg", "w200"), "https://image.tmdb.org/t/p/w200/abc.jpg");
assert.equal(imageUrl(null), null, "missing path must be null, not a broken URL");

assert.equal(formatRuntime(128), "2h 8m");
assert.equal(formatRuntime(47), "47m");
assert.equal(formatRuntime(120), "2h 0m");
assert.equal(formatRuntime(0), "");
assert.equal(formatRuntime(-5), "");

assert.equal(formatRating(7.842), "7.8");
assert.equal(formatRating(0), "—");

assert.equal(formatYear("2010-07-16"), "2010");
assert.equal(formatYear(""), "");
assert.equal(formatYear(null), "");
assert.equal(formatYear(undefined), "");

// Same seed -> same gradient (stable across renders), different seed -> different gradient.
assert.equal(gradientFor("Inception"), gradientFor("Inception"));
assert.notEqual(gradientFor("Inception"), gradientFor("Arrival"));
assert.match(gradientFor("Inception"), /^linear-gradient\(135deg, hsl\(\d+ 52% 34%\), hsl\(\d+ 58% 18%\)\)$/);

console.log("format.ts: all checks passed");
