'use strict';

const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');
const tokenService = require('./token.service');
const tokenRepository = require('../repositories/token.repository');
const ApiError = require('../utils/ApiError');

/** Number of bcrypt salt rounds — higher = more secure but slower */
const SALT_ROUNDS = 12;

/**
 * Auth service — handles user authentication business logic.
 * Orchestrates user repository and token service operations.
 */

/**
 * Register a new user.
 * Checks for duplicate email, hashes password, creates user, generates tokens.
 * @param {Object} body - Registration data
 * @param {string} body.email - User email
 * @param {string} body.password - Plain text password
 * @param {string} body.firstName - User first name
 * @param {string} body.lastName - User last name
 * @returns {Promise<{user: Object, tokens: Object}>} Created user and auth tokens
 * @throws {ApiError} 409 if email already registered
 */
const register = async (body) => {
  const { email, password, firstName, lastName } = body;

  // Check for duplicate email
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user in database
  const user = await userRepository.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
  });

  // Generate JWT access and refresh tokens
  const tokens = await tokenService.generateAuthTokens(user);

  return { user, tokens };
};

/**
 * Authenticate a user with email and password.
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<{user: Object, tokens: Object}>} Authenticated user and tokens
 * @throws {ApiError} 401 if credentials are invalid or account inactive
 */
const login = async (email, password) => {
  // Find user including password hash
  const user = await userRepository.findByEmail(email, true);

  // Use generic message to prevent user enumeration attacks
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(401, 'Account is deactivated. Please contact support.');
  }

  // Compare provided password with stored hash
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Remove password from user object before returning
  // eslint-disable-next-line no-unused-vars
  const { password: _password, ...userWithoutPassword } = user;

  // Generate new token pair
  const tokens = await tokenService.generateAuthTokens(userWithoutPassword);

  return { user: userWithoutPassword, tokens };
};

/**
 * Refresh an access token using a valid refresh token.
 * Implements token rotation: old refresh token is blacklisted, new pair is generated.
 * @param {string} refreshToken - Current refresh token
 * @returns {Promise<{user: Object, tokens: Object}>} User and new token pair
 * @throws {ApiError} 401 if refresh token is invalid or blacklisted
 */
const refreshToken = async (token) => {
  // Verify and validate the refresh token (checks DB + blacklist status)
  const decoded = await tokenService.verifyToken(token, 'refresh');

  // Get user from token's subject claim
  const user = await userRepository.findById(decoded.sub);
  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  if (!user.isActive) {
    throw new ApiError(401, 'Account is deactivated');
  }

  // Blacklist the old refresh token (token rotation for security)
  await tokenService.blacklistToken(token);

  // Generate new token pair
  const tokens = await tokenService.generateAuthTokens(user);

  return { user, tokens };
};

/**
 * Logout a user by blacklisting their refresh token.
 * @param {string} refreshTokenStr - Refresh token to invalidate
 * @returns {Promise<void>}
 * @throws {ApiError} 404 if token not found
 */
const logout = async (refreshTokenStr) => {
  const tokenRecord = await tokenRepository.findOne(refreshTokenStr, 'refresh');
  if (!tokenRecord) {
    throw new ApiError(404, 'Token not found');
  }
  await tokenService.blacklistToken(refreshTokenStr);
};

/**
 * Change a user's password.
 * Verifies the old password before updating to the new one.
 * @param {string} userId - User UUID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 * @throws {ApiError} 401 if old password is incorrect
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  // Get user with password hash
  const user = await userRepository.findById(userId, true);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Verify old password
  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordValid) {
    throw new ApiError(401, 'Old password is incorrect');
  }

  // Prevent reusing the same password
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    throw new ApiError(400, 'New password must be different from the old password');
  }

  // Hash and update the new password
  const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepository.update(userId, { password: hashedNewPassword });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  changePassword,
};
