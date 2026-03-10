'use strict';

/**
 * Creates a new object from the source object containing only the specified keys.
 * Used to filter allowed query parameters from request objects.
 *
 * @param {Object} object - Source object to pick from
 * @param {string[]} keys - Array of keys to pick
 * @returns {Object} New object with only the specified keys
 *
 * @example
 * pick({ a: 1, b: 2, c: 3 }, ['a', 'c']); // { a: 1, c: 3 }
 * pick(req.query, ['page', 'limit', 'sortBy']); // Only allowed query params
 */
const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

module.exports = pick;
