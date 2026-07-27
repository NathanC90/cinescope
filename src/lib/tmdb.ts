// TMDB data layer. Every function returns UI-ready domain types (see ../types.ts).
// With no VITE_TMDB_KEY set, falls back to local demo data so the app is always presentable.
import type { Movie, MovieDetail } from "../types";
import { formatYear } from "./format";
import { MOCK_MOVIES, MOCK_DETAILS } from "./mockData";

const KEY = import.meta.env.VITE_TMDB_KEY as string | undefined;
const BASE = "https://api.themoviedb.org/3";

export const isLiveData = Boolean(KEY);

interface TmdbMovie {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  vote_average?: number;
  poster_path?: string | null;
  overview?: string;
}

function toMovie(m: TmdbMovie): Movie {
  return {
    id: m.id,
    title: m.title ?? m.name ?? "Untitled",
    year: formatYear(m.release_date),
    rating: m.vote_average ?? 0,
    posterPath: m.poster_path ?? null,
    overview: m.overview ?? "",
  };
}

async function get<T>(path: string, params: Record<string, string> = {}, signal?: AbortSignal): Promise<T> {
  const url = new URL(BASE + path);
  url.searchParams.set("api_key", KEY!);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`TMDB request failed (${res.status})`);
  return res.json() as Promise<T>;
}

/** Popular titles for the landing grid. */
export async function fetchPopular(signal?: AbortSignal): Promise<Movie[]> {
  if (!KEY) return MOCK_MOVIES;
  const data = await get<{ results: TmdbMovie[] }>("/movie/popular", { page: "1" }, signal);
  return data.results.map(toMovie);
}

/** Search by title. Empty query returns [] without a network call. */
export async function searchMovies(query: string, signal?: AbortSignal): Promise<Movie[]> {
  const q = query.trim();
  if (!q) return [];
  if (!KEY) {
    const needle = q.toLowerCase();
    return MOCK_MOVIES.filter(
      (m) => m.title.toLowerCase().includes(needle) || m.overview.toLowerCase().includes(needle),
    );
  }
  const data = await get<{ results: TmdbMovie[] }>("/search/movie", { query: q, include_adult: "false" }, signal);
  return data.results.map(toMovie);
}

interface TmdbDetail extends TmdbMovie {
  runtime?: number;
  tagline?: string;
  backdrop_path?: string | null;
  genres?: { name: string }[];
  credits?: {
    crew?: { job?: string; name?: string }[];
    cast?: { name?: string }[];
  };
}

/** Full detail for one title, including director and top billing. */
export async function fetchMovie(id: number, signal?: AbortSignal): Promise<MovieDetail> {
  if (!KEY) {
    const mock = MOCK_DETAILS[id];
    if (!mock) throw new Error("Movie not found");
    return mock;
  }

  const d = await get<TmdbDetail>(`/movie/${id}`, { append_to_response: "credits" }, signal);
  return {
    ...toMovie(d),
    runtime: d.runtime ?? 0,
    genres: d.genres?.map((g) => g.name) ?? [],
    backdropPath: d.backdrop_path ?? null,
    tagline: d.tagline ?? "",
    director: d.credits?.crew?.find((c) => c.job === "Director")?.name ?? "",
    cast: (d.credits?.cast ?? []).slice(0, 4).map((c) => c.name ?? "").filter(Boolean),
  };
}
