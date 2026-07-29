import { useState, useDeferredValue } from "react";
import { Header } from "./components/Header";
import { MovieGrid } from "./components/MovieGrid";
import { DetailView } from "./components/DetailView";
import { useRoute } from "./lib/useRoute";
import { useAsync } from "./lib/useAsync";
import { useWatchlist } from "./lib/useWatchlist";
import { fetchPopular, searchMovies, isLiveData } from "./lib/tmdb";
import "./App.css";

function Browse({ query }: { query: string }) {
  // Deferred so typing stays responsive while the previous grid is still on screen.
  const deferred = useDeferredValue(query.trim());
  const searching = deferred.length > 0;

  const popular = useAsync((signal) => fetchPopular(signal), [], searching);
  const results = useAsync((signal) => searchMovies(deferred, signal), [deferred], !searching);

  const active = searching ? results : popular;

  if (active.error) {
    return (
      <p className="notice notice--error" role="alert">
        {active.error}
      </p>
    );
  }

  return (
    <>
      <h2 className="section-title">
        {searching ? `Results for “${deferred}”` : "Popular right now"}
      </h2>
      <MovieGrid
        movies={active.data ?? []}
        loading={active.loading}
        empty={
          <p className="notice">
            Nothing matched “{deferred}”. Try another title.
          </p>
        }
      />
    </>
  );
}

function Watchlist() {
  const { items } = useWatchlist();

  return (
    <>
      <h2 className="section-title">Your watchlist</h2>
      <MovieGrid
        movies={items}
        empty={
          <p className="notice">
            Nothing saved yet. <a href="#/">Browse movies</a> and hit Save to build your list.
          </p>
        }
      />
    </>
  );
}

export default function App() {
  const { route, navigate } = useRoute();
  const [query, setQuery] = useState("");

  // Searching from the watchlist or a detail page should take you where results appear.
  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.trim() && route.name !== "home") navigate({ name: "home" });
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Header route={route} query={query} onQueryChange={handleQueryChange} />

      <main className="main" id="main">
        {route.name === "movie" ? (
          <>
            <a className="back-link" href="#/">
              ← Back
            </a>
            <DetailView id={route.id} />
          </>
        ) : route.name === "watchlist" ? (
          <Watchlist />
        ) : (
          <Browse query={query} />
        )}
      </main>

      <footer className="footer">
        {isLiveData ? (
          <p>
            Data from{" "}
            <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
              TMDB
            </a>
          </p>
        ) : (
          <p>
            Running on local demo data — set <code>VITE_API_BASE</code> to load live titles.
          </p>
        )}
      </footer>
    </>
  );
}
