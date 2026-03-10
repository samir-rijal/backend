'use strict';

/**
 * Standardized API response helper.
 * Ensures all responses follow a consistent structure throughout the application.
 */
class ApiResponse {
  /**
   * Send a successful response.
   * @param {import('express').Response} res
   * @param {*} data - Response data payload
   * @param {string} [message='Success'] - Success message
   * @param {number} [statusCode=200] - HTTP status code
   */
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send a 201 Created response.
   * @param {import('express').Response} res
   * @param {*} data - Created resource data
   * @param {string} [message='Created'] - Success message
   */
  static created(res, data, message = 'Created') {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send a paginated response with pagination metadata.
   * @param {import('express').Response} res
   * @param {Array} data - Page of results
   * @param {number} page - Current page number (1-indexed)
   * @param {number} limit - Items per page
   * @param {number} total - Total number of items across all pages
   * @param {string} [message='Success'] - Success message
   */
  static paginated(res, data, page, limit, total, message = 'Success') {
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }
}

module.exports = ApiResponse;
