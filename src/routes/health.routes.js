'use strict';

const express = require('express');
const healthController = require('../controllers/health.controller');

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     description: Returns the current health status of the service, including database and Redis connectivity, uptime, and version information.
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [healthy, degraded]
 *                       example: healthy
 *                     uptime:
 *                       type: number
 *                       description: Server uptime in seconds
 *                       example: 3600
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     services:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: string
 *                           enum: [connected, disconnected]
 *                           example: connected
 *                         redis:
 *                           type: string
 *                           enum: [connected, disconnected]
 *                           example: connected
 *                     version:
 *                       type: string
 *                       example: 1.0.0
 *                     environment:
 *                       type: string
 *                       example: production
 *       503:
 *         description: Service is degraded (database unavailable)
 */
router.get('/', healthController.healthCheck);

module.exports = router;
