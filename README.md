# IMovies

IMovies is a React/Vite client with an Express/MongoDB API for browsing movies, selecting seats, and confirming demo bookings without online payment. Razorpay integration has been removed.

## Quick start (Windows PowerShell)

Requirements:
- Node.js 20.19+ or 22.12+ recommended for Vite 8.
- MongoDB running locally at `127.0.0.1:27017`, or a MongoDB connection string you control.

This package includes `server/.env` and `client/.env` for local development. The server environment uses a local MongoDB URI and a randomly generated development JWT secret. **These settings are for local development only. Never use this JWT secret in production or commit `.env` files to GitHub.** The root `.gitignore` excludes `.env` files.

### 1. Check the environment

If MongoDB is not installed, install MongoDB Community Server or use a MongoDB Atlas database. If using Atlas, update `MONGO_URI` in `server/.env` to your own connection string. Do not share that string publicly.

### 2. Install dependencies

Open a terminal in the project root and run:

```powershell
cd server
npm install
cd ..\client
npm install
```

### 3. Seed sample movies and theatres

Make sure MongoDB is running, then in a terminal:

```powershell
cd server
npm run seed:sample
```

### 4. Start the backend

In a terminal at `server/`:

```powershell
npm start
```

Wait for `Server running in development mode on port 5001`.

### 5. Start the frontend

Open a second terminal at `client/`:

```powershell
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173/`.

Keep both terminals open. If the server reports a MongoDB connection error, MongoDB is not reachable or `MONGO_URI` needs correcting. If the frontend loads but has no movie data, run the sample-data seeder after the database is available.

## Demo booking mode

Online payment integration has been removed. Users can confirm a demo booking after holding seats; the server records the booking and marks the seats as booked without collecting money. Displayed ticket amounts are informational only and do not represent payment. This is a demonstration flow, not a real cinema ticket or payment receipt.

## Before pushing to GitHub

- Do not commit `server/.env` or `client/.env`; `.gitignore` excludes `.env` files.
- Keep `.env.example` files as safe templates, with no real secrets.
- Never put database credentials, JWT secrets, or payment credentials in source control.

## Production notes

Deploy the `server` and `client` separately, or place both behind one HTTPS reverse proxy. Set production environment variables in the hosting provider's secret manager, use a unique secret, and configure a reachable MongoDB database. The API must be reachable over HTTPS, and the hosting proxy must forward WebSocket upgrades for Socket.io. Poster uploads currently use local disk, so production hosting needs persistent storage or object storage before relying on uploaded posters across redeploys.
