import { DEMO_MOVIES, getDemoMovie, getDemoShows } from './demoData.js';

const ok = (data) => ({ success: true, data });

export const movieApi = {
  getMovies: async (params = {}) => {
    let movies = [...DEMO_MOVIES];
    if (params.search) movies = movies.filter((m) => m.title.toLowerCase().includes(String(params.search).toLowerCase()));
    if (params.genre) movies = movies.filter((m) => m.genres?.includes(params.genre));
    if (params.language) movies = movies.filter((m) => m.languages?.includes(params.language));
    const page = Number(params.page || 1);
    const limit = Number(params.limit || 10);
    const totalPages = Math.max(1, Math.ceil(movies.length / limit));
    return { success: true, data: movies.slice((page - 1) * limit, page * limit), pagination: { page, totalPages, hasNext: page < totalPages, hasPrev: page > 1, total: movies.length } };
  },
  getMovie: async (id) => ok(getDemoMovie(id)),
  getFilters: async () => ok({ genres: [...new Set(DEMO_MOVIES.flatMap((m) => m.genres || []))].sort(), languages: [...new Set(DEMO_MOVIES.flatMap((m) => m.languages || []))].sort() }),
  getMovieShows: async (movieId) => ok(getDemoShows(movieId)),
};
