'use strict';

const userService = require('../services/user.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

/**
 * User controller — handles HTTP layer for user management endpoints.
 * Delegates business logic to user service and formats responses.
 */

/**
 * POST /users
 * Create a new user (admin only).
 */
const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  return ApiResponse.created(res, { user }, 'User created successfully');
});

/**
 * GET /users
 * Get all users with pagination and filtering (admin only).
 */
const getUsers = catchAsync(async (req, res) => {
  // Pick only allowed filter fields
  const filter = pick(req.query, ['role']);
  // Pick pagination and sort options
  const options = pick(req.query, ['page', 'limit', 'sortBy']);

  // Coerce string numbers to integers for pagination
  if (options.page) options.page = parseInt(options.page, 10);
  if (options.limit) options.limit = parseInt(options.limit, 10);

  const { users, total, page, limit } = await userService.getUsers(filter, options);
  return ApiResponse.paginated(res, users, page, limit, total, 'Users retrieved successfully');
});

/**
 * GET /users/:id
 * Get a user by ID.
 * - Admins can access any user
 * - Regular users can only access their own profile
 */
const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Non-admin users can only view their own profile
  if (req.user.role !== 'ADMIN' && req.user.id !== id) {
    throw new ApiError(403, 'Access denied: You can only view your own profile');
  }

  const user = await userService.getUserById(id);
  return ApiResponse.success(res, { user }, 'User retrieved successfully');
});

/**
 * PATCH /users/:id
 * Update a user's profile.
 * - Admins can update any user
 * - Regular users can only update their own profile
 * - Only admins can change the role field
 */
const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Non-admin users can only update their own profile
  if (req.user.role !== 'ADMIN' && req.user.id !== id) {
    throw new ApiError(403, 'Access denied: You can only update your own profile');
  }

  // Non-admin users cannot change their own role
  if (req.user.role !== 'ADMIN' && req.body.role) {
    throw new ApiError(403, 'Access denied: Only admins can change user roles');
  }

  const user = await userService.updateUser(id, req.body);
  return ApiResponse.success(res, { user }, 'User updated successfully');
});

/**
 * DELETE /users/:id
 * Delete a user (admin only).
 */
const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (req.user.id === id) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  await userService.deleteUser(id);
  return ApiResponse.success(res, null, 'User deleted successfully');
});

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
