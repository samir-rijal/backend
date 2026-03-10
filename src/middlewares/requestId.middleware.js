'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Request ID middleware.
 * Attaches a unique UUID to each request for distributed tracing and log correlation.
 * The ID is set in both req.id and the 'X-Request-Id' response header.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const requestId = (req, res, next) => {
  // Use existing request ID from header (for distributed tracing) or generate a new one
  const id = req.headers['x-request-id'] || uuidv4();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
};

module.exports = requestId;
