'use strict';

const prisma = require('../config/database');

/**
 * Token repository — data access layer for the tokens table.
 * Manages refresh tokens and reset password tokens.
 */

/**
 * Save a new token to the database.
 * @param {string} token - JWT token string
 * @param {string} userId - User UUID
 * @param {string} type - Token type ('refresh' or 'reset_password')
 * @param {Date} expiresAt - Token expiration date
 * @returns {Promise<Object>} Created token record
 */
const create = async (token, userId, type, expiresAt) => {
  return prisma.token.create({
    data: {
      token,
      userId,
      type,
      expiresAt,
      blacklisted: false,
    },
  });
};

/**
 * Find a token record by token string and type.
 * @param {string} token - JWT token string
 * @param {string} type - Token type
 * @returns {Promise<Object|null>} Token record or null
 */
const findOne = async (token, type) => {
  return prisma.token.findFirst({
    where: {
      token,
      type,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
    },
  });
};

/**
 * Mark a token as blacklisted (invalidated).
 * @param {string} token - JWT token string to blacklist
 * @returns {Promise<Object>} Updated token record
 */
const blacklist = async (token) => {
  return prisma.token.updateMany({
    where: { token },
    data: { blacklisted: true },
  });
};

/**
 * Delete all tokens for a user of a specific type.
 * Useful for logout-all-devices and password reset flows.
 * @param {string} userId - User UUID
 * @param {string} [type] - Token type filter (optional)
 * @returns {Promise<Object>} Prisma delete result
 */
const deleteUserTokens = async (userId, type) => {
  return prisma.token.deleteMany({
    where: {
      userId,
      ...(type && { type }),
    },
  });
};

/**
 * Delete all expired tokens for cleanup purposes.
 * Should be run periodically to keep the tokens table lean.
 * @returns {Promise<Object>} Prisma delete result
 */
const deleteExpiredTokens = async () => {
  return prisma.token.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
};

module.exports = {
  create,
  findOne,
  blacklist,
  deleteUserTokens,
  deleteExpiredTokens,
};
