// Hash routing in ~40 lines instead of a router dependency. Hash (not History) is
// deliberate: this deploys to static hosting (GitHub Pages), where /movie/5 would 404
// on refresh without server rewrites. #/movie/5 is deep-linkable and shareable as-is.
import { useSyncExternalStore, useCallback } from "react";

export type Route =
  | { name: "home" }
  | { name: "watchlist" }
  | { name: "movie"; id: number };

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, "").split("?")[0];
  const [segment, param] = path.split("/");

  if (segment === "watchlist") return { name: "watchlist" };
  if (segment === "movie") {
    const id = Number(param);
    if (Number.isInteger(id) && id > 0) return { name: "movie", id };
  }
  return { name: "home" };
}

export function hrefFor(route: Route): string {
  switch (route.name) {
    case "watchlist":
      return "#/watchlist";
    case "movie":
      return `#/movie/${route.id}`;
    default:
      return "#/";
  }
}

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

/** Current route, re-rendering on back/forward and any hash change. */
export function useRoute() {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => "",
  );

  const navigate = useCallback((route: Route) => {
    window.location.hash = hrefFor(route);
  }, []);

  return { route: parseHash(hash), navigate };
}
