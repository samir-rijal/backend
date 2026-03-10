'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/index');
const tokenRepository = require('../repositories/token.repository');
const ApiError = require('../utils/ApiError');

/**
 * Token service — handles all JWT token operations.
 * Manages generation, verification, storage, and invalidation of tokens.
 */

/**
 * Generate a signed JWT token.
 * @param {string} userId - User UUID to embed in token payload
 * @param {string} role - User role for RBAC
 * @param {string} type - Token type ('access' or 'refresh')
 * @param {string} secret - JWT signing secret
 * @param {string|number} expiresIn - Token expiry (e.g., '15m', '7d')
 * @returns {string} Signed JWT token string
 */
const generateToken = (userId, role, type, secret, expiresIn) => {
  const payload = {
    sub: userId,
    role,
    type,
    iat: Math.floor(Date.now() / 1000),
  };
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generate both access and refresh tokens for a user.
 * Saves the refresh token to the database for validation.
 * @param {Object} user - User object with id and role
 * @returns {Promise<{accessToken: string, refreshToken: string}>} Token pair
 */
const generateAuthTokens = async (user) => {
  // Generate access token (short-lived, not stored in DB)
  const accessToken = generateToken(
    user.id,
    user.role,
    'access',
    config.jwt.accessSecret,
    config.jwt.accessExpiration,
  );

  // Generate refresh token (long-lived, stored in DB)
  const refreshToken = generateToken(
    user.id,
    user.role,
    'refresh',
    config.jwt.refreshSecret,
    config.jwt.refreshExpiration,
  );

  // Decode to get expiration time for DB storage
  const decoded = jwt.decode(refreshToken);
  const expiresAt = new Date(decoded.exp * 1000);

  // Persist refresh token in database
  await saveToken(refreshToken, user.id, 'refresh', expiresAt);

  return { accessToken, refreshToken };
};

/**
 * Verify a JWT token and optionally validate against the database.
 * @param {string} token - JWT token string to verify
 * @param {string} type - Expected token type ('access' or 'refresh')
 * @returns {Promise<Object>} Decoded token payload
 * @throws {ApiError} If token is invalid, expired, or blacklisted
 */
const verifyToken = async (token, type) => {
  const secret = type === 'access' ? config.jwt.accessSecret : config.jwt.refreshSecret;

  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token has expired');
    }
    throw new ApiError(401, 'Invalid token');
  }

  // Verify token type matches expected type
  if (decoded.type !== type) {
    throw new ApiError(401, 'Invalid token type');
  }

  // For refresh tokens, check the database to ensure not blacklisted
  if (type === 'refresh') {
    const tokenRecord = await tokenRepository.findOne(token, type);
    if (!tokenRecord) {
      throw new ApiError(401, 'Token not found');
    }
    if (tokenRecord.blacklisted) {
      throw new ApiError(401, 'Token has been revoked');
    }
    if (new Date() > tokenRecord.expiresAt) {
      throw new ApiError(401, 'Token has expired');
    }
  }

  return decoded;
};

/**
 * Save a token to the database.
 * @param {string} tokenString - JWT token string
 * @param {string} userId - User UUID
 * @param {string} type - Token type
 * @param {Date} expiresAt - Expiration date
 * @returns {Promise<Object>} Created token record
 */
const saveToken = async (tokenString, userId, type, expiresAt) => {
  return tokenRepository.create(tokenString, userId, type, expiresAt);
};

/**
 * Blacklist a token to invalidate it.
 * @param {string} tokenString - JWT token string to invalidate
 * @returns {Promise<void>}
 */
const blacklistToken = async (tokenString) => {
  return tokenRepository.blacklist(tokenString);
};

module.exports = {
  generateToken,
  generateAuthTokens,
  verifyToken,
  saveToken,
  blacklistToken,
};
