import type { Movie } from "../types";
import { imageUrl, formatRating, gradientFor } from "../lib/format";
import { hrefFor } from "../lib/useRoute";
import { useWatchlist } from "../lib/useWatchlist";

interface Props {
  movie: Movie;
}

export function MovieCard({ movie }: Props) {
  const { has, toggle } = useWatchlist();
  const saved = has(movie.id);
  const poster = imageUrl(movie.posterPath, "w500");

  return (
    <article className="card">
      {/* The whole poster is the link target, so the hit area matches what looks clickable. */}
      <a className="card__link" href={hrefFor({ name: "movie", id: movie.id })}>
        <div className="card__poster" style={poster ? undefined : { background: gradientFor(movie.title) }}>
          {poster ? (
            <img src={poster} alt="" loading="lazy" decoding="async" />
          ) : (
            <span className="card__initials" aria-hidden="true">
              {movie.title.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <h3 className="card__title">{movie.title}</h3>
      </a>

      <p className="card__meta">
        <span>{movie.year || "—"}</span>
        <span className="card__rating" title="Average rating out of 10">
          ★ {formatRating(movie.rating)}
        </span>
      </p>

      <button
        type="button"
        className={`card__save ${saved ? "is-saved" : ""}`}
        aria-pressed={saved}
        onClick={() => toggle(movie)}
      >
        {saved ? "Saved" : "Save"}
        <span className="sr-only"> {movie.title} to watchlist</span>
      </button>
    </article>
  );
}
