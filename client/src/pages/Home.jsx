import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Ticket, Clapperboard, Heart, ChevronRight } from 'lucide-react';
import { movieApi } from '../api/movieApi.js';
import { useFetch } from '../hooks/useFetch.js';
import MovieGrid from '../components/MovieGrid.jsx';
import ErrorState from '../components/ErrorState.jsx';

export default function Home() {
  useEffect(() => { document.title = 'IMovies — Find your next favourite'; }, []);
  const { data, loading, error, refetch } = useFetch(() => movieApi.getMovies({ limit: 10, sort: 'newest' }), []);
  const movies = data?.data || [];
  const featured = movies[0];

  return (
    <div className="home-page">
      <section className="cinema-hero">
        <div className="hero-art" aria-hidden="true"><div className="hero-orb" /><div className="hero-ring" /><div className="hero-grain" /></div>
        <div className="hero-copy">
          <div className="hero-kicker"><Sparkles size={14} /> YOUR NEXT CINEMA OBSESSION STARTS HERE</div>
          <h1>Stories worth<br /><em>leaving home for.</em></h1>
          <p>Discover the films everyone's talking about. Find your seats. Make a night of it.</p>
          <div className="hero-actions">
            <Link to="/movies" className="primary-cta">Explore movies <ArrowRight size={17} /></Link>
            <Link to="/watchlist" className="secondary-cta"><Heart size={16} /> My watchlist</Link>
          </div>
          <div className="hero-trust"><span><ShieldCheck size={15} /> Secure checkout</span><i /><span><Zap size={15} /> Quick seat booking</span><i /><span><Ticket size={15} /> Digital tickets</span></div>
        </div>
        <div className="hero-side-note"><Clapperboard size={16} /><span>THE BIG SCREEN<br /><b>FEELS DIFFERENT.</b></span></div>
        <div className="hero-bottom-label"><span>IMOVIES ORIGINAL EXPERIENCE</span><span>01 / DISCOVER</span></div>
      </section>

      {featured && !loading && (
        <section className="featured-strip">
          <div className="featured-poster">{featured.poster ? <img src={featured.poster} alt="" /> : <FilmIcon />}</div>
          <div className="featured-copy"><p className="eyebrow">FRESH ON THE BIG SCREEN</p><h2>{featured.title}</h2><p>{featured.genres?.join(' · ') || 'A story worth discovering'}{featured.languages?.[0] ? `  /  ${featured.languages[0]}` : ''}</p></div>
          <Link to={`/movies/${featured._id}`} className="featured-link">Discover film <ArrowRight size={16} /></Link>
        </section>
      )}

      <section className="home-movies">
        <div className="section-heading"><div><p className="eyebrow">PICK YOUR NEXT NIGHT OUT</p><h2>Now showing<span>.</span></h2><p className="section-description">Big stories. Brilliant casts. Your next favourite is right here.</p></div><Link to="/movies" className="text-link">All movies <ChevronRight size={16} /></Link></div>
        {error ? <ErrorState message={error} onRetry={refetch} /> : <MovieGrid movies={movies} loading={loading} skeletonCount={5} />}
      </section>

      <section className="promise-row">
        <div><span className="promise-icon"><Zap size={19} /></span><div><b>Your seats, held</b><p>Take your time at checkout with a temporary seat hold.</p></div></div>
        <div><span className="promise-icon"><ShieldCheck size={19} /></span><div><b>Easy demo booking</b><p>Choose your seats and confirm a demo booking without online payment.</p></div></div>
        <div><span className="promise-icon"><Ticket size={19} /></span><div><b>Ticket-ready</b><p>Your booking details, ready when you are.</p></div></div>
      </section>
    </div>
  );
}

function FilmIcon() { return <Clapperboard size={36} />; }
