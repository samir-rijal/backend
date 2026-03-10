'use strict';

/**
 * Wraps async route handlers to automatically catch and forward errors to Express error middleware.
 * Eliminates the need for try/catch blocks in every controller method.
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function that catches rejected promises
 *
 * @example
 * router.get('/users', catchAsync(async (req, res) => {
 *   const users = await userService.getUsers();
 *   res.json(users);
 * }));
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;
