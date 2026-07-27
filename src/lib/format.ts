// Pure, dependency-free formatting helpers. No DOM, no env — so they're trivially testable
// (see format.selfcheck.ts, run with: node --experimental-strip-types src/lib/format.selfcheck.ts).

const IMG_BASE = "https://image.tmdb.org/t/p";

export type PosterSize = "w200" | "w500" | "original";

/** Build a TMDB image URL, or null when there's no image (caller shows a placeholder). */
export function imageUrl(path: string | null, size: PosterSize = "w500"): string | null {
  return path ? `${IMG_BASE}/${size}${path}` : null;
}

/** 128 -> "2h 8m", 47 -> "47m", 0/unknown -> "". */
export function formatRuntime(minutes: number): string {
  if (!minutes || minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

/** One-decimal rating, or an em dash when unrated. */
export function formatRating(rating: number): string {
  return rating > 0 ? rating.toFixed(1) : "—";
}

/** Pull the year from a TMDB "YYYY-MM-DD" release date. */
export function formatYear(releaseDate: string | null | undefined): string {
  return releaseDate ? releaseDate.slice(0, 4) : "";
}

/** Deterministic CSS gradient from a string — used for poster placeholders so the
 *  no-artwork state still looks designed rather than broken. */
export function gradientFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const a = hash % 360;
  const b = (a + 40) % 360;
  return `linear-gradient(135deg, hsl(${a} 52% 34%), hsl(${b} 58% 18%))`;
}
