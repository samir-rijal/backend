'use strict';

const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');

/**
 * Zod validation middleware factory.
 * Validates req.body, req.params, and req.query against a Zod schema.
 * Returns a 400 error with field-level error details if validation fails.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema with optional body, params, query fields
 * @returns {import('express').RequestHandler} Express middleware function
 *
 * @example
 * router.post('/register', validate(registerSchema), authController.register);
 */
const validate = (schema) => async (req, _res, next) => {
  try {
    // Validate the relevant parts of the request against the schema
    const result = await schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    // Replace request fields with validated (and possibly transformed) values
    if (result.body) req.body = result.body;
    if (result.params) req.params = result.params;
    if (result.query) req.query = result.query;

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      // Format Zod errors into a readable structure
      const errors = err.errors.map((e) => ({
        field: e.path.filter((p) => p !== 'body' && p !== 'params' && p !== 'query').join('.'),
        message: e.message,
      }));

      return next(
        Object.assign(new ApiError(400, 'Validation failed'), { errors }),
      );
    }
    next(err);
  }
};

module.exports = validate;
