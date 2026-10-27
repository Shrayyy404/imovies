// Local sample data for the iMovies portfolio demo. No backend or payment gateway required.
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(18, 30, 0, 0);
const later = new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000);

export const DEMO_CITIES = ['Indore', 'Mumbai', 'Delhi', 'Bengaluru', 'Pune'];

export const DEMO_MOVIES = [
  { _id: 'demo-movie-1', title: 'The Last Horizon', poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80', genres: ['Sci-Fi', 'Adventure'], duration: 142, languages: ['English', 'Hindi'], certificate: 'UA 13+', rating: 8.4, releaseDate: '2026-10-10', description: 'A daring crew follows a mysterious signal beyond the edge of known space, discovering that the greatest journey is the one that brings them home.', cast: ['Aarav Mehta', 'Mira Kapoor', 'Dev Khanna'], trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { _id: 'demo-movie-2', title: 'Midnight in Mumbai', poster: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=600&q=80', genres: ['Drama', 'Romance'], duration: 126, languages: ['Hindi'], certificate: 'UA 13+', rating: 7.9, releaseDate: '2026-09-28', description: 'Two strangers miss the last train and discover the city — and themselves — over one unforgettable night.', cast: ['Ishaan Rao', 'Anaya Shah'] },
  { _id: 'demo-movie-3', title: 'Shadow Protocol', poster: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80', genres: ['Action', 'Thriller'], duration: 118, languages: ['Hindi', 'English'], certificate: 'UA 16+', rating: 8.1, releaseDate: '2026-10-18', description: 'When a covert operation goes wrong, one analyst has a single night to uncover the truth before the city goes dark.', cast: ['Kabir Sethi', 'Rhea Nair'] },
  { _id: 'demo-movie-4', title: 'Little Big Dreams', poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=80', genres: ['Family', 'Comedy'], duration: 104, languages: ['Hindi'], certificate: 'U', rating: 7.7, releaseDate: '2026-10-05', description: 'A spirited young inventor turns a quiet neighbourhood upside down with one wonderfully impossible idea.', cast: ['Tara Joshi', 'Manav Verma'] },
  { _id: 'demo-movie-5', title: 'Echoes of Tomorrow', poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80', genres: ['Mystery', 'Sci-Fi'], duration: 133, languages: ['English'], certificate: 'UA 13+', rating: 8.6, releaseDate: '2026-10-21', description: 'A sound engineer begins hearing fragments of tomorrow hidden inside ordinary recordings.', cast: ['Nina Cole', 'Arjun Malhotra'] },
  { _id: 'demo-movie-6', title: 'The Grand Getaway', poster: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=600&q=80', genres: ['Adventure', 'Comedy'], duration: 111, languages: ['Hindi', 'English'], certificate: 'UA 7+', rating: 7.8, releaseDate: '2026-09-20', description: 'A chaotic road trip, a missing suitcase and four friends who are very bad at making plans.', cast: ['Rohan Das', 'Simran Gill'] },
];

export const DEMO_THEATRE = { _id: 'demo-theatre-1', name: 'IMovies Grand Cinemas', address: 'Central Avenue', city: 'Indore' };

export function getDemoMovie(id) {
  return DEMO_MOVIES.find((movie) => movie._id === id) || DEMO_MOVIES[0];
}
export function getDemoShows(movieId) {
  const movie = getDemoMovie(movieId);
  const dates = [0, 1, 2].map((offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  });
  return [{ theatre: DEMO_THEATRE, shows: dates.flatMap((date, index) => [12, 15, 18].map((hour, slot) => {
    const start = new Date(date);
    start.setHours(hour + (slot === 2 ? 30 : 0), slot === 2 ? 0 : 30, 0, 0);
    return { _id: `demo-show-${movie._id}-${index}-${slot}`, movie, theatre: DEMO_THEATRE, startTime: start.toISOString(), price: slot === 2 ? 320 : 240, language: movie.languages?.[0] || 'Hindi', screenName: `Screen ${slot + 1}`, status: 'scheduled' };
  })) }];
}
export function demoShow(showId) {
  const match = String(showId || '').match(/^demo-show-(demo-movie-\d+)-(\d+)-(\d+)$/);
  const movie = getDemoMovie(match?.[1]);
  const group = getDemoShows(movie._id)[0];
  return group.shows.find((show) => show._id === showId) || group.shows[0];
}
const BOOKING_KEY = 'imovies_demo_bookings_v1';
export function readBookings() {
  try { return JSON.parse(localStorage.getItem(BOOKING_KEY) || '{}'); } catch { return {}; }
}
export function saveBooking(booking) {
  const bookings = readBookings();
  bookings[booking._id] = booking;
  localStorage.setItem(BOOKING_KEY, JSON.stringify(bookings));
  return booking;
}
export function getBooking(id) { return readBookings()[id] || null; }
export function createDemoSeats() {
  const seats = [];
  for (const row of ['A', 'B', 'C', 'D', 'E', 'F']) {
    for (let n = 1; n <= 8; n++) {
      seats.push({ label: `${row}${n}`, row, number: n, status: (row === 'A' && [4, 5].includes(n)) || (row === 'D' && n === 7) ? 'booked' : 'available', isMine: false, type: row === 'F' ? 'premium' : 'standard' });
    }
  }
  return seats;
}
export function makeId() {
  return 'xxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, () => Math.floor(Math.random() * 16).toString(16));
}
