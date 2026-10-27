import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { validateEnv } from './config/validateEnv.js';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import mongoSanitize from './middleware/mongoSanitize.js';
import { requestLogger } from './utils/logger.js';
import authRoutes         from './routes/authRoutes.js';
import movieRoutes        from './routes/movieRoutes.js';
import theatreRoutes      from './routes/theatreRoutes.js';
import showRoutes         from './routes/showRoutes.js';
import bookingRoutes      from './routes/bookingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes        from './routes/adminRoutes.js';
import { startHoldCleanup, stopHoldCleanup } from './utils/holdCleanup.js';
import { initSocket } from './utils/socket.js';

// ── 1. Startup validation (must be called first) ──────────────────────────────
validateEnv();

// ── 2. Connect to MongoDB ─────────────────────────────────────────────────────
await connectDB();

// ── 3. App + HTTP server ──────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ── 4. Initialize Socket.io ───────────────────────────────────────────────────
const io = initSocket(server);

// ── 5. Security & Pre-Routing Middleware (order matters) ──────────────────────
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Remove X-Powered-By
app.disable('x-powered-by');

// Helmet security headers
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production'
        ? {
            directives: {
              defaultSrc: ["'self'"],
              imgSrc: ["'self'", 'data:', 'https:'],
            },
          }
        : false,
    crossOriginEmbedderPolicy: false,
  })
);

// Compression
app.use(compression());

// Single origin CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: false,
  })
);

// Request duration / error logger
app.use(requestLogger);

// ── 6. Request body parsing ──────────────────────────────────────────────────
// Global JSON & URL-encoded parsing (clamped to 10kb)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// NoSQL injection sanitizer (strips keys starting with $ or containing .)
app.use(mongoSanitize);

// Static uploads
app.use('/uploads', express.static('uploads'));

// ── 9. General Rate Limiter on /api (300 requests per 15 min per IP) ─────────
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

app.use('/api', generalApiLimiter);

// Health is intentionally covered by the general /api limiter as well.
app.get('/api/health', (_req, res) =>
  res.json({
    ok: true,
    uptime: Math.floor(process.uptime()),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
);

// ── 10. API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/movies',        movieRoutes);
app.use('/api/theatres',      theatreRoutes);
app.use('/api/shows',         showRoutes);
app.use('/api/bookings',      bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin',         adminRoutes);

// ── 11. Error Handling (always last) ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── 12. Start server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  startHoldCleanup();
});

// ── 13. Graceful Shutdown & Process Handlers ──────────────────────────────────
let isShuttingDown = false;
const handleShutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[Server] ${signal} signal received. Starting graceful shutdown...`);

  // Force close process if cleanup takes more than 10 seconds
  const forceTimer = setTimeout(() => {
    console.error('[Server] Cleanup took too long. Forcefully terminating.');
    process.exit(1);
  }, 10000);
  forceTimer.unref();

  server.close(async () => {
    console.log('[Server] HTTP connections closed.');
    stopHoldCleanup();
    console.log('[Server] Hold cleanup scheduler stopped.');

    if (io) {
      io.close();
      console.log('[Server] Socket.io server closed.');
    }

    try {
      await mongoose.connection.close(false);
      console.log('[Server] MongoDB connection closed.');
    } catch (err) {
      console.error('[Server] Error closing MongoDB:', err.message);
    }

    clearTimeout(forceTimer);
    console.log('[Server] Graceful shutdown complete. Exiting.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT',  () => handleShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[Process] Unhandled Rejection:', reason);
  handleShutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err);
  handleShutdown('uncaughtException');
});

export { io };
