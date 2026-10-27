const KEY = 'imovies_watchlist_v1';

export function getWatchlist() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function isInWatchlist(id) {
  return getWatchlist().some((movie) => movie._id === id);
}

export function toggleWatchlist(movie) {
  const current = getWatchlist();
  const exists = current.some((item) => item._id === movie._id);
  const next = exists ? current.filter((item) => item._id !== movie._id) : [...current, movie];
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('imovies:watchlist-changed', { detail: next }));
  return !exists;
}
