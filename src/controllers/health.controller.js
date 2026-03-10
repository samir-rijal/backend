'use strict';

const prisma = require('../config/database');
const { isConnected } = require('../config/redis');
const catchAsync = require('../utils/catchAsync');

/**
 * Health controller — provides system status information.
 * Used for monitoring, load balancer health checks, and uptime tracking.
 */

/**
 * GET /health
 * Returns comprehensive system health information including:
 * - Server uptime
 * - Timestamp
 * - Database connectivity
 * - Redis connectivity
 */
const healthCheck = catchAsync(async (req, res) => {
  // Check database connectivity
  let databaseStatus = 'connected';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (_err) {
    databaseStatus = 'disconnected';
  }

  // Check Redis connectivity
  const redisStatus = isConnected() ? 'connected' : 'disconnected';

  const healthData = {
    status: databaseStatus === 'connected' ? 'healthy' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      database: databaseStatus,
      redis: redisStatus,
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  const statusCode = databaseStatus === 'connected' ? 200 : 503;
  return res.status(statusCode).json({
    success: databaseStatus === 'connected',
    message: databaseStatus === 'connected' ? 'Service is healthy' : 'Service is degraded',
    data: healthData,
  });
});

module.exports = {
  healthCheck,
};
