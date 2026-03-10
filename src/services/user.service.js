'use strict';

const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');
const tokenRepository = require('../repositories/token.repository');
const { setCache, getCache, deleteCache } = require('../config/redis');
const ApiError = require('../utils/ApiError');

/** Number of bcrypt salt rounds */
const SALT_ROUNDS = 12;

/** Redis cache TTL for user profiles (5 minutes) */
const USER_CACHE_TTL = 300;

/** Cache key prefix for user profiles */
const userCacheKey = (id) => `user:${id}`;

/**
 * User service — handles user management business logic.
 * Includes Redis caching for read-heavy operations.
 */

/**
 * Create a new user (admin operation).
 * @param {Object} body - User creation data
 * @returns {Promise<Object>} Created user
 * @throws {ApiError} 409 if email already exists
 */
const createUser = async (body) => {
  const { email, password, firstName, lastName, role } = body;

  // Check for duplicate email
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  return userRepository.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    ...(role && { role }),
  });
};

/**
 * Get a paginated list of users with optional filtering.
 * @param {Object} filter - Filter criteria (e.g., { role: 'USER' })
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.limit - Items per page
 * @param {string} [options.sortBy] - Sort field and direction (e.g., 'createdAt:desc')
 * @returns {Promise<{users: Array, total: number, page: number, limit: number}>}
 */
const getUsers = async (filter, options) => {
  const { page = 1, limit = 10, sortBy } = options;
  const skip = (page - 1) * limit;

  // Parse sortBy format: "field:asc" or "field:desc"
  let orderBy = { createdAt: 'desc' };
  if (sortBy) {
    const [field, direction] = sortBy.split(':');
    orderBy = { [field]: direction || 'asc' };
  }

  const { users, total } = await userRepository.findMany(filter, {
    skip,
    take: limit,
    orderBy,
  });

  return { users, total, page, limit };
};

/**
 * Get a user by ID. Results are cached in Redis for performance.
 * @param {string} id - User UUID
 * @returns {Promise<Object>} User object
 * @throws {ApiError} 404 if user not found
 */
const getUserById = async (id) => {
  const cacheKey = userCacheKey(id);

  // Check Redis cache first
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const user = await userRepository.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Cache the result for future requests
  await setCache(cacheKey, user, USER_CACHE_TTL);

  return user;
};

/**
 * Update a user's profile.
 * Invalidates the Redis cache for the updated user.
 * @param {string} id - User UUID
 * @param {Object} body - Fields to update
 * @returns {Promise<Object>} Updated user
 * @throws {ApiError} 404 if user not found
 * @throws {ApiError} 409 if new email already in use
 */
const updateUser = async (id, body) => {
  // If updating email, check for conflicts
  if (body.email) {
    const existingUser = await userRepository.findByEmail(body.email);
    if (existingUser && existingUser.id !== id) {
      throw new ApiError(409, 'Email already in use');
    }
  }

  const user = await userRepository.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const updatedUser = await userRepository.update(id, body);

  // Invalidate cache after update
  await deleteCache(userCacheKey(id));

  return updatedUser;
};

/**
 * Delete a user and all associated tokens.
 * Invalidates the Redis cache for the deleted user.
 * @param {string} id - User UUID
 * @returns {Promise<void>}
 * @throws {ApiError} 404 if user not found
 */
const deleteUser = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Delete associated tokens first (cascade handled by Prisma schema but explicit here)
  await tokenRepository.deleteUserTokens(id);

  // Delete the user
  await userRepository.remove(id);

  // Invalidate cache
  await deleteCache(userCacheKey(id));
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
