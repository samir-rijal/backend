'use strict';

/**
 * Custom error class for operational errors (expected errors that can be handled gracefully).
 * Extends the built-in Error class with HTTP status code and operational flag.
 *
 * @example
 * throw new ApiError(404, 'User not found');
 * throw new ApiError(400, 'Invalid input');
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {boolean} [isOperational=true] - Whether this is an operational error (vs programming error)
   */
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    // Capture the stack trace for debugging (excludes this constructor call)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
