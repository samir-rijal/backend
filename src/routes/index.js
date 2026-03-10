'use strict';

const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const healthRoutes = require('./health.routes');

const router = express.Router();

/**
 * Route aggregator — mounts all route modules under /api/v1.
 * All routes are prefixed with their respective module name.
 */

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/health', healthRoutes);

module.exports = router;
