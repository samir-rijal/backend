'use strict';

/**
 * Swagger definition file.
 * Re-exports the generated swagger specification for use in the app.
 * The actual spec is built from JSDoc comments in route files via swagger-jsdoc.
 */
const swaggerSpec = require('../config/swagger');

module.exports = swaggerSpec;
