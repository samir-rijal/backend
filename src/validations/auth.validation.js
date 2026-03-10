'use strict';

const { z } = require('zod');

/**
 * Zod validation schemas for authentication endpoints.
 * All schemas use strict validation to prevent unexpected fields.
 */

/**
 * Schema for POST /auth/register
 */
const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address')
      .toLowerCase()
      .trim(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must not exceed 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),
    firstName: z
      .string({ required_error: 'First name is required' })
      .trim()
      .min(1, 'First name is required')
      .max(50, 'First name must not exceed 50 characters'),
    lastName: z
      .string({ required_error: 'Last name is required' })
      .trim()
      .min(1, 'Last name is required')
      .max(50, 'Last name must not exceed 50 characters'),
  }),
});

/**
 * Schema for POST /auth/login
 */
const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address')
      .toLowerCase()
      .trim(),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

/**
 * Schema for POST /auth/refresh-token
 */
const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required' }),
  }),
});

/**
 * Schema for POST /auth/logout
 */
const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required' }),
  }),
});

/**
 * Schema for POST /auth/change-password
 */
const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: 'Old password is required' }),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must not exceed 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  changePasswordSchema,
};
