import { fetchMovie } from "../lib/tmdb";
import { useAsync } from "../lib/useAsync";
import { imageUrl, formatRating, formatRuntime, gradientFor } from "../lib/format";
import { useWatchlist } from "../lib/useWatchlist";

interface Props {
  id: number;
}

export function DetailView({ id }: Props) {
  const { data: movie, loading, error } = useAsync((signal) => fetchMovie(id, signal), [id]);
  const { has, toggle } = useWatchlist();

  if (loading) {
    return (
      <div className="detail detail--loading" aria-busy="true">
        <div className="skeleton detail__poster" />
        <div className="detail__body">
          <div className="skeleton skeleton--line skeleton--title" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--short" />
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <p className="notice notice--error" role="alert">
        {error ?? "That title could not be found."} <a href="#/">Back to browse</a>
      </p>
    );
  }

  const poster = imageUrl(movie.posterPath, "w500");
  const backdrop = imageUrl(movie.backdropPath, "original");
  const saved = has(movie.id);
  const runtime = formatRuntime(movie.runtime);

  return (
    <article className="detail">
      {backdrop && (
        <div className="detail__backdrop" style={{ backgroundImage: `url(${backdrop})` }} aria-hidden="true" />
      )}

      <div className="detail__poster" style={poster ? undefined : { background: gradientFor(movie.title) }}>
        {poster && <img src={poster} alt={`${movie.title} poster`} />}
      </div>

      <div className="detail__body">
        <h2 className="detail__title">
          {movie.title} {movie.year && <span className="detail__year">({movie.year})</span>}
        </h2>

        {movie.tagline && <p className="detail__tagline">{movie.tagline}</p>}

        <p className="detail__meta">
          <span className="detail__rating">★ {formatRating(movie.rating)}</span>
          {runtime && <span>{runtime}</span>}
          {movie.genres.length > 0 && <span>{movie.genres.join(", ")}</span>}
        </p>

        {movie.overview && <p className="detail__overview">{movie.overview}</p>}

        {movie.director && (
          <p className="detail__credit">
            <strong>Director</strong> {movie.director}
          </p>
        )}
        {movie.cast.length > 0 && (
          <p className="detail__credit">
            <strong>Starring</strong> {movie.cast.join(", ")}
          </p>
        )}

        <button
          type="button"
          className={`btn ${saved ? "btn--saved" : "btn--primary"}`}
          aria-pressed={saved}
          onClick={() => toggle(movie)}
        >
          {saved ? "Remove from watchlist" : "Add to watchlist"}
        </button>
      </div>
    </article>
  );
}
