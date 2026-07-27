// Domain types. Kept flat and UI-friendly so components never touch raw TMDB shapes.

export interface Movie {
  id: number;
  title: string;
  year: string; // "2010" or "" when unknown
  rating: number; // TMDB vote_average, 0–10 (0 = unrated)
  posterPath: string | null;
  overview: string;
}

export interface MovieDetail extends Movie {
  runtime: number; // minutes, 0 when unknown
  genres: string[];
  backdropPath: string | null;
  tagline: string;
  director: string;
  cast: string[];
}
