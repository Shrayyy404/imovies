import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Clock, Heart, ArrowUpRight } from 'lucide-react';
import { formatDuration } from '../utils/format.js';
import { isInWatchlist, toggleWatchlist } from '../utils/watchlist.js';

export default function MovieCard({ movie }) {
  const [imgError, setImgError] = useState(false);
  const [saved, setSaved] = useState(() => isInWatchlist(movie._id));
  useEffect(() => {
    const sync = (event) => setSaved((event.detail || []).some((item) => item._id === movie._id));
    window.addEventListener('imovies:watchlist-changed', sync);
    return () => window.removeEventListener('imovies:watchlist-changed', sync);
  }, [movie._id]);

  const handleSave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setSaved(toggleWatchlist(movie));
  };

  return (
    <article className="movie-card group">
      <Link to={`/movies/${movie._id}`} className="movie-card-link" aria-label={`View ${movie.title}`}>
        <div className="movie-poster">
          {!imgError && movie.poster ? (
            <img src={movie.poster} alt={movie.title} loading="lazy" onError={() => setImgError(true)} />
          ) : (
            <div className="poster-fallback"><Film size={34} /><span>{movie.title}</span></div>
          )}
          <div className="poster-shade" />
          {movie.certificate && <span className="movie-certificate">{movie.certificate}</span>}
          <span className="poster-open"><ArrowUpRight size={17} /></span>
          <span className="poster-book-label">Explore movie <span>↗</span></span>
        </div>
        <div className="movie-card-info">
          <h3>{movie.title}</h3>
          <p className="movie-genres">{movie.genres?.join(' · ') || 'Feature film'}</p>
          <div className="movie-meta"><span><Clock size={13} /> {formatDuration(movie.duration)}</span><span>{movie.languages?.[0] || 'Cinema'}</span></div>
        </div>
      </Link>
      <button type="button" className={`watchlist-toggle ${saved ? 'is-saved' : ''}`} onClick={handleSave} aria-label={saved ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`} title={saved ? 'Remove from watchlist' : 'Add to watchlist'}>
        <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
      </button>
    </article>
  );
}
