# IMovies UI refresh

## What's changed
- Reworked the home page into a cinematic, responsive dark-red hero with clearer calls to action, trust highlights, a featured movie strip, and cleaner movie section headings.
- Redesigned movie cards with larger poster presentation, hover treatment, and an accessible heart action.
- Added a personal Watchlist page at `/watchlist`.
- Watchlist saves movie details in browser localStorage and syncs updates between cards/pages in the same tab; it works without requiring a new backend endpoint or login.
- Added Watchlist navigation on desktop and mobile.

## Notes
- Existing movie browsing, movie detail, showtime, seat selection, demo checkout, and admin routes are retained.
- A production build could not be completed in this environment because npm dependency installation timed out, leaving Vite unavailable. Run `npm install` in `client/`, then `npm run build` to verify in your environment.


## Demo booking mode

Online payment integration has been removed. Users can confirm a demo booking after holding seats; the server records the booking and marks the seats as booked without collecting money. Displayed ticket amounts are informational only and do not represent a payment.
