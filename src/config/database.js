'use strict';

const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

/**
 * Prisma client singleton to prevent multiple instances in development
 * (Next.js hot reload creates multiple instances without this pattern).
 */
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

// Log slow queries in development
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query', (e) => {
    if (e.duration > 100) {
      logger.debug(`Slow query (${e.duration}ms): ${e.query}`);
    }
  });
}

prisma.$on('error', (e) => {
  logger.error('Prisma error:', e);
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma warning:', e);
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
