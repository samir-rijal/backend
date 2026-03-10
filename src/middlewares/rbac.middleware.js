'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Role-Based Access Control (RBAC) middleware factory.
 * Creates middleware that restricts route access to users with specified roles.
 * Must be used AFTER the authenticate middleware (requires req.user).
 *
 * @param {...string} roles - Allowed roles (e.g., 'ADMIN', 'MODERATOR')
 * @returns {import('express').RequestHandler} Express middleware function
 *
 * @example
 * // Only admins can access this route
 * router.delete('/users/:id', authenticate, authorize('ADMIN'), deleteUser);
 *
 * // Both admins and moderators can access
 * router.get('/reports', authenticate, authorize('ADMIN', 'MODERATOR'), getReports);
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied: Requires one of the following roles: ${roles.join(', ')}`,
        ),
      );
    }

    next();
  };
};

module.exports = authorize;
