'use strict';

const prisma = require('../config/database');

/**
 * User repository — data access layer for the users table.
 * All database interactions for users go through this repository.
 */

/**
 * Fields to always select (excludes sensitive fields like password by default).
 * Use this spread when you don't need the password field.
 */
const userSelectFields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Find a user by their ID.
 * @param {string} id - User UUID
 * @param {boolean} [includePassword=false] - Whether to include the hashed password
 * @returns {Promise<Object|null>} User or null if not found
 */
const findById = async (id, includePassword = false) => {
  return prisma.user.findUnique({
    where: { id },
    select: includePassword ? { ...userSelectFields, password: true } : userSelectFields,
  });
};

/**
 * Find a user by their email address.
 * @param {string} email - User email
 * @param {boolean} [includePassword=false] - Whether to include the hashed password
 * @returns {Promise<Object|null>} User or null if not found
 */
const findByEmail = async (email, includePassword = false) => {
  return prisma.user.findUnique({
    where: { email },
    select: includePassword ? { ...userSelectFields, password: true } : userSelectFields,
  });
};

/**
 * Create a new user.
 * @param {Object} data - User creation data
 * @returns {Promise<Object>} Created user (without password)
 */
const create = async (data) => {
  return prisma.user.create({
    data,
    select: userSelectFields,
  });
};

/**
 * Update a user by ID.
 * @param {string} id - User UUID
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} Updated user (without password)
 */
const update = async (id, data) => {
  return prisma.user.update({
    where: { id },
    data,
    select: userSelectFields,
  });
};

/**
 * Delete a user by ID.
 * @param {string} id - User UUID
 * @returns {Promise<Object>} Deleted user
 */
const remove = async (id) => {
  return prisma.user.delete({
    where: { id },
    select: userSelectFields,
  });
};

/**
 * Find multiple users with filtering and pagination.
 * @param {Object} [filter={}] - Prisma where clause
 * @param {Object} [options={}] - Pagination and sorting options
 * @param {number} [options.skip=0] - Number of records to skip
 * @param {number} [options.take=10] - Number of records to take
 * @param {Object} [options.orderBy] - Prisma orderBy clause
 * @returns {Promise<{users: Array, total: number}>} Users page and total count
 */
const findMany = async (filter = {}, options = {}) => {
  const { skip = 0, take = 10, orderBy = { createdAt: 'desc' } } = options;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where: filter,
      select: userSelectFields,
      skip,
      take,
      orderBy,
    }),
    prisma.user.count({ where: filter }),
  ]);

  return { users, total };
};

module.exports = {
  findById,
  findByEmail,
  create,
  update,
  remove,
  findMany,
};
