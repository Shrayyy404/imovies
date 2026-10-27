import React, { useEffect, useState } from 'react';
import { Heart, Film, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MovieGrid from '../components/MovieGrid.jsx';
import { getWatchlist } from '../utils/watchlist.js';

export default function WatchlistPage() {
  const [movies, setMovies] = useState(getWatchlist);
  useEffect(() => {
    document.title = 'My Watchlist — IMovies';
    const refresh = (event) => setMovies(event.detail || getWatchlist());
    window.addEventListener('imovies:watchlist-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('imovies:watchlist-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return (
    <div className="watchlist-page">
      <div className="watchlist-heading">
        <div className="watchlist-icon"><Heart size={22} fill="currentColor" /></div>
        <div>
          <p className="eyebrow">YOUR PERSONAL COLLECTION</p>
          <h1>My Watchlist<span>.</span></h1>
          <p className="watchlist-subtitle">The movies you don't want to miss, all in one place.</p>
        </div>
        <span className="watchlist-count">{movies.length} {movies.length === 1 ? 'movie' : 'movies'}</span>
      </div>
      {movies.length ? <MovieGrid movies={movies} /> : (
        <div className="watchlist-empty">
          <div className="empty-film"><Film size={30} /></div>
          <h2>Your next favourite is out there.</h2>
          <p>Tap the heart on any movie to save it here for later.</p>
          <Link to="/movies" className="primary-cta">Discover movies <ArrowRight size={16} /></Link>
        </div>
      )}
    </div>
  );
}
