import type { Route } from "../lib/useRoute";
import { useWatchlist } from "../lib/useWatchlist";
import { useTheme } from "../lib/useTheme";

interface Props {
  route: Route;
  query: string;
  onQueryChange: (value: string) => void;
}

export function Header({ route, query, onQueryChange }: Props) {
  const { items } = useWatchlist();
  const { theme, toggle } = useTheme();

  return (
    <header className="header">
      <div className="header__bar">
        <a className="header__brand" href="#/">
          Cine<span>Scope</span>
        </a>

        <search className="header__search">
          <label className="sr-only" htmlFor="q">
            Search movies by title
          </label>
          <input
            id="q"
            type="search"
            className="header__input"
            placeholder="Search movies…"
            value={query}
            autoComplete="off"
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </search>

        <nav className="header__nav">
          <a
            className={`header__tab ${route.name === "watchlist" ? "is-active" : ""}`}
            href="#/watchlist"
            aria-current={route.name === "watchlist" ? "page" : undefined}
          >
            Watchlist
            {items.length > 0 && <span className="header__count">{items.length}</span>}
          </a>

          <button
            type="button"
            className="header__theme"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </nav>
      </div>
    </header>
  );
}
