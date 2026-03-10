'use strict';

const { Prisma } = require('@prisma/client');
const { ZodError } = require('zod');
const config = require('../config/index');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

/**
 * Centralized error handling middleware.
 * Must be registered LAST in the Express middleware chain.
 * Normalizes all errors to a consistent JSON response format.
 *
 * Handles:
 * - ApiError (operational errors)
 * - Prisma errors (database constraint violations, not found)
 * - JWT errors (expired, invalid)
 * - Zod validation errors
 * - Unexpected/programming errors
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let error = err;

  // Convert known error types to ApiError for uniform handling
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'field';
      error = new ApiError(409, `A record with this ${field} already exists`);
    }
    // P2025: Record not found
    else if (err.code === 'P2025') {
      error = new ApiError(404, 'Record not found');
    }
    // P2003: Foreign key constraint violation
    else if (err.code === 'P2003') {
      error = new ApiError(400, 'Related record not found');
    } else {
      error = new ApiError(500, 'Database error', false);
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    error = new ApiError(400, 'Invalid data provided to database');
  } else if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token has expired');
  } else if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  } else if (err instanceof ZodError) {
    const message = err.errors.map((e) => e.message).join(', ');
    error = new ApiError(400, message);
  } else if (!(err instanceof ApiError)) {
    // Programming or unknown error — treat as 500
    error = new ApiError(500, 'Internal server error', false);
  }

  const statusCode = error.statusCode || 500;

  // Log the error with context
  const logMeta = {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${error.message}`, logMeta);
  } else {
    logger.warn(`[${statusCode}] ${error.message}`, logMeta);
  }

  const response = {
    success: false,
    message: error.message,
    statusCode,
    // Include validation errors if present
    ...(error.errors && { errors: error.errors }),
    // Include stack trace only in development for debugging
    ...(config.env === 'development' && !error.isOperational && { stack: err.stack }),
  };

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
