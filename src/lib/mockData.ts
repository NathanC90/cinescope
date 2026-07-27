// Demo data used when no TMDB key is configured, so the portfolio link always renders
// a full, working UI. Posters/backdrops are intentionally null -> generated gradients.
import type { Movie, MovieDetail } from "../types";

const base = (
  id: number,
  title: string,
  year: string,
  rating: number,
  overview: string,
): Movie => ({ id, title, year, rating, posterPath: null, overview });

export const MOCK_MOVIES: Movie[] = [
  base(1, "Neon Harbour", "2024", 8.2, "A dock worker in a rain-slicked port city discovers the freighters have been arriving empty for years."),
  base(2, "The Cartographer", "2023", 7.6, "A mapmaker is hired to chart an island that appears on no other map — and finds it inhabited."),
  base(3, "Slow Light", "2025", 7.9, "Two astronomers separated by decades exchange messages through a signal that travels impossibly slowly."),
  base(4, "Paper Cities", "2022", 6.8, "An architect builds scale models of towns that then begin to appear, fully formed, in the countryside."),
  base(5, "Salt and Static", "2024", 8.5, "A radio operator on a remote coast starts hearing broadcasts from a station that burned down in 1961."),
  base(6, "The Quiet Fleet", "2021", 7.1, "A fisherwoman assembles a flotilla of neighbours to search for a village that vanished overnight."),
  base(7, "Understory", "2025", 8.0, "A botanist mapping a rainforest canopy realises the trees are coordinating their growth around her."),
  base(8, "Winter Count", "2023", 7.4, "A historian returns to her grandmother's plains homestead to decode a hide painted with a century of winters."),
];

const detailExtras: Record<number, Pick<MovieDetail, "runtime" | "genres" | "tagline" | "director" | "cast">> = {
  1: { runtime: 118, genres: ["Mystery", "Drama"], tagline: "Every ship comes home empty.", director: "Ilse Marchetti", cast: ["Tomas Vela", "June Okafor", "Petra Lindqvist"] },
  2: { runtime: 132, genres: ["Adventure", "Drama"], tagline: "Some places refuse to be found.", director: "Aurelio Banks", cast: ["Nadia Ferrer", "Colm Byrne", "Rui Tanaka"] },
  3: { runtime: 104, genres: ["Science Fiction", "Romance"], tagline: "The message is still arriving.", director: "Wren Abbot", cast: ["Sena Adeyemi", "Marcus Hale", "Iva Novak"] },
  4: { runtime: 97, genres: ["Fantasy", "Drama"], tagline: "He drew them first.", director: "Dolores Kim", cast: ["Anton Reyes", "Bea Halloran", "Yusuf Demir"] },
  5: { runtime: 126, genres: ["Thriller", "Mystery"], tagline: "Listen past the noise.", director: "Nora Vance", cast: ["Elias Storm", "Mira Chandra", "Ben Oyelaran"] },
  6: { runtime: 111, genres: ["Drama"], tagline: "They sailed out together.", director: "Kai Lindgren", cast: ["Solveig Ruiz", "Tam Nguyen", "Greta Sallow"] },
  7: { runtime: 108, genres: ["Science Fiction", "Drama"], tagline: "The forest was already listening.", director: "Priya Raghavan", cast: ["Odile Mercer", "Sam Achebe", "Lena Fischer"] },
  8: { runtime: 121, genres: ["Drama", "History"], tagline: "One year, one line.", director: "Josephine Redcloud", cast: ["Marie Tallgrass", "Owen Brant", "Della Cross"] },
};

export const MOCK_DETAILS: Record<number, MovieDetail> = Object.fromEntries(
  MOCK_MOVIES.map((m) => [m.id, { ...m, backdropPath: null, ...detailExtras[m.id] }]),
);
