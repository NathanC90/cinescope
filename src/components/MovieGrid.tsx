import type { Movie } from "../types";
import { MovieCard } from "./MovieCard";

interface Props {
  movies: Movie[];
  loading?: boolean;
  /** Shown when not loading and the list is empty. */
  empty?: React.ReactNode;
}

/** Placeholder cards sized like real ones, so loading doesn't shift the layout. */
function Skeletons({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div className="card card--skeleton" key={i} aria-hidden="true">
          <div className="card__poster skeleton" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--short" />
        </div>
      ))}
    </>
  );
}

export function MovieGrid({ movies, loading = false, empty = null }: Props) {
  if (!loading && movies.length === 0) return <>{empty}</>;

  return (
    <div className="grid" aria-busy={loading}>
      {loading ? <Skeletons /> : movies.map((m) => <MovieCard key={m.id} movie={m} />)}
    </div>
  );
}
