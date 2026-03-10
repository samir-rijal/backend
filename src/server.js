'use strict';

const http = require('http');

// Load environment variables first before any other imports
require('dotenv').config();

const app = require('./app');
const config = require('./config/index');
const logger = require('./config/logger');
const prisma = require('./config/database');
const { connectRedis, disconnectRedis } = require('./config/redis');

const server = http.createServer(app);

/**
 * Graceful shutdown handler.
 * Closes the HTTP server, database connections, and Redis connections
 * before exiting the process. This allows in-flight requests to complete.
 *
 * @param {string} signal - OS signal that triggered the shutdown
 */
const gracefulShutdown = async (signal) => {
  logger.info(`[Server] Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('[Server] HTTP server closed');

    try {
      // Disconnect from the database
      await prisma.$disconnect();
      logger.info('[Database] Disconnected from PostgreSQL');

      // Disconnect from Redis
      await disconnectRedis();
      logger.info('[Redis] Disconnected from Redis');

      logger.info('[Server] Graceful shutdown complete');
      process.exit(0);
    } catch (err) {
      logger.error('[Server] Error during graceful shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('[Server] Graceful shutdown timeout, forcing exit');
    process.exit(1);
  }, 10000); // 10 second timeout
};

/**
 * Start the server.
 * Connects to Redis and starts listening for connections.
 */
const startServer = async () => {
  try {
    // Attempt to connect to Redis (non-blocking, app continues if Redis is unavailable)
    await connectRedis();

    server.listen(config.port, () => {
      logger.info(`[Server] Running in ${config.env} mode on port ${config.port}`);
      logger.info(`[Server] API documentation: http://localhost:${config.port}/api/v1/docs`);
    });

    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`[Server] Port ${config.port} is already in use`);
      } else {
        logger.error('[Server] Server error:', err);
      }
      process.exit(1);
    });
  } catch (err) {
    logger.error('[Server] Failed to start:', err);
    process.exit(1);
  }
};

// Register graceful shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('[Server] Unhandled Promise Rejection:', err);
  gracefulShutdown('unhandledRejection');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('[Server] Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

startServer();

module.exports = server; // Export for testing
