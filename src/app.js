'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const config = require('./config/index');
const logger = require('./config/logger');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes/index');
const requestId = require('./middlewares/requestId.middleware');
const { rateLimiter } = require('./middlewares/rateLimiter.middleware');
const errorHandler = require('./middlewares/error.middleware');
const ApiError = require('./utils/ApiError');

const app = express();

// ─── Security Middleware ─────────────────────────────────────────────────────

/**
 * Helmet sets various HTTP headers to improve security.
 * Configured to allow Swagger UI to load its assets.
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }),
);

/**
 * CORS configuration.
 * Allows requests from configured origins with standard methods.
 */
app.use(
  cors({
    origin: config.cors.origin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    credentials: true,
  }),
);

// ─── Request Processing Middleware ───────────────────────────────────────────

// Parse JSON request bodies (limit set to prevent large payload attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Attach unique request ID to every request for tracing
app.use(requestId);

// HTTP request logging via Morgan, piped through Winston
if (config.env !== 'test') {
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
      skip: (_req, res) => config.env === 'production' && res.statusCode < 400,
    }),
  );
}

// Apply general rate limiting to all routes
app.use(rateLimiter);

// ─── API Routes ──────────────────────────────────────────────────────────────

// Swagger API documentation
app.use(
  '/api/v1/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Backend API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
    },
  }),
);

// Mount all API routes under /api/v1
app.use('/api/v1', routes);

// Root redirect to API docs
app.get('/', (_req, res) => {
  res.redirect('/api/v1/docs');
});

// ─── Error Handling ──────────────────────────────────────────────────────────

// Handle unmatched routes
app.use((_req, _res, next) => {
  next(new ApiError(404, 'Route not found'));
});

// Centralized error handler (must be last middleware)
app.use(errorHandler);

module.exports = app;
