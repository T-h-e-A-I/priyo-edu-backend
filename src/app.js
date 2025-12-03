import express from 'express';
import cors from 'cors';

import registerHealthRoutes from './routes/health.js';
import registerAuthRoutes from './routes/auth.js';
import registerVersionRoutes from './routes/version.js';
import { initDb } from '../database/init.js';
import registerCourseRoutes from './routes/course.js';

// Kick off database initialization (non-blocking for app bootstrap).
initDb().catch((error) => {
  console.error('Failed to initialize database schema', error);
});

const app = express();

// Simple request logger to see which APIs are being called
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
    );
  });

  next();
});

// CORS configuration
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Basic middleware
app.use(express.json());

// Create routers here and let route files attach handlers to them
const courseRouter = express.Router();
const healthRouter = express.Router();
const versionRouter = express.Router();
const authRouter = express.Router();

registerCourseRoutes(courseRouter);
registerHealthRoutes(healthRouter);
registerVersionRoutes(versionRouter);
registerAuthRoutes(authRouter);

// Mount modular route handlers
app.use('/api/course', courseRouter);
app.use('/api/health', healthRouter);
app.use('/api/version', versionRouter);
app.use('/api/auth', authRouter);

export default app;
