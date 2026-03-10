'use strict';

const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * Auth controller — handles HTTP layer for authentication endpoints.
 * Delegates business logic to auth service and formats responses.
 */

/**
 * POST /auth/register
 * Register a new user account.
 */
const register = catchAsync(async (req, res) => {
  const { user, tokens } = await authService.register(req.body);
  return ApiResponse.created(res, { user, tokens }, 'Registration successful');
});

/**
 * POST /auth/login
 * Authenticate user and return JWT tokens.
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.login(email, password);
  return ApiResponse.success(res, { user, tokens }, 'Login successful');
});

/**
 * POST /auth/refresh-token
 * Exchange a valid refresh token for a new token pair.
 */
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken: token } = req.body;
  const { user, tokens } = await authService.refreshToken(token);
  return ApiResponse.success(res, { user, tokens }, 'Token refreshed successfully');
});

/**
 * POST /auth/logout
 * Invalidate the user's refresh token.
 * Requires authentication (access token in Authorization header).
 */
const logout = catchAsync(async (req, res) => {
  const { refreshToken: token } = req.body;
  await authService.logout(token);
  return ApiResponse.success(res, null, 'Logged out successfully');
});

/**
 * POST /auth/change-password
 * Change the authenticated user's password.
 */
const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, oldPassword, newPassword);
  return ApiResponse.success(res, null, 'Password changed successfully');
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  changePassword,
};
