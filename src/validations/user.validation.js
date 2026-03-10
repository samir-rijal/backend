'use strict';

const { z } = require('zod');

/**
 * Zod validation schemas for user management endpoints.
 */

/**
 * Schema for POST /users (admin creates a user)
 */
const createUserSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address')
      .toLowerCase()
      .trim(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must not exceed 100 characters'),
    firstName: z
      .string({ required_error: 'First name is required' })
      .trim()
      .min(1)
      .max(50),
    lastName: z
      .string({ required_error: 'Last name is required' })
      .trim()
      .min(1)
      .max(50),
    role: z.enum(['USER', 'ADMIN', 'MODERATOR']).optional(),
  }),
});

/**
 * Schema for GET /users query parameters
 */
const getUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    sortBy: z
      .string()
      .regex(/^[a-zA-Z]+:(asc|desc)$/, 'sortBy must be in format "field:asc" or "field:desc"')
      .optional(),
    role: z.enum(['USER', 'ADMIN', 'MODERATOR']).optional(),
  }),
});

/**
 * Schema for GET /users/:id, PATCH /users/:id, DELETE /users/:id
 */
const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
});

/**
 * Schema for PATCH /users/:id
 */
const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
  body: z
    .object({
      firstName: z.string().trim().min(1).max(50).optional(),
      lastName: z.string().trim().min(1).max(50).optional(),
      email: z.string().email('Invalid email address').toLowerCase().trim().optional(),
      role: z.enum(['USER', 'ADMIN', 'MODERATOR']).optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

module.exports = {
  createUserSchema,
  getUsersSchema,
  userIdParamSchema,
  updateUserSchema,
};
