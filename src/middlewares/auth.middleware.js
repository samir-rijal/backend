'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/index');
const userRepository = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');

/**
 * Authentication middleware.
 * Extracts and verifies the Bearer JWT access token from the Authorization header.
 * Attaches the full user object to req.user for downstream middleware/controllers.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required. Please provide a Bearer token.');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.accessSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Access token has expired. Please refresh your token.');
      }
      throw new ApiError(401, 'Invalid access token');
    }

    // Ensure this is an access token (not a refresh token being misused)
    if (decoded.type !== 'access') {
      throw new ApiError(401, 'Invalid token type');
    }

    // Fetch fresh user data from database (ensures deactivated accounts are rejected)
    const user = await userRepository.findById(decoded.sub);
    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'Account has been deactivated');
    }

    // Attach user to request for use in controllers
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticate;
