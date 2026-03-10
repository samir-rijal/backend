'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config/index');
const logger = require('../config/logger');

/**
 * General API rate limiter.
 * Limits each IP to a configurable number of requests per window.
 * Configured via RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX environment variables.
 */
const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,  // Disable X-RateLimit-* headers
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests, please try again later.',
  },
  handler: (req, res, _next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      requestId: req.id,
      ip: req.ip,
      url: req.originalUrl,
    });
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * Stricter rate limiter for authentication endpoints.
 * Limits login/register attempts to prevent brute force attacks.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Maximum 20 auth attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  handler: (req, res, _next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`, {
      requestId: req.id,
      ip: req.ip,
      url: req.originalUrl,
    });
    res.status(options.statusCode).json(options.message);
  },
});

module.exports = { rateLimiter, authRateLimiter };
