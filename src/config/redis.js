'use strict';

const Redis = require('ioredis');
const config = require('./index');
const logger = require('./logger');

let redisClient = null;
let isRedisConnected = false;

/**
 * Creates and configures the Redis client with connection error handling.
 * The application continues to function without Redis (graceful degradation).
 */
const createRedisClient = () => {
  const client = new Redis(config.redis.url, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      // Retry up to 3 times with exponential backoff
      if (times > 3) {
        logger.warn('[Redis] Max retries reached, disabling Redis cache');
        return null; // Stop retrying
      }
      return Math.min(times * 200, 2000);
    },
  });

  client.on('connect', () => {
    isRedisConnected = true;
    logger.info('[Redis] Connected successfully');
  });

  client.on('ready', () => {
    isRedisConnected = true;
    logger.info('[Redis] Ready to accept commands');
  });

  client.on('error', (err) => {
    isRedisConnected = false;
    logger.warn(`[Redis] Connection error: ${err.message}`);
  });

  client.on('close', () => {
    isRedisConnected = false;
    logger.info('[Redis] Connection closed');
  });

  client.on('reconnecting', () => {
    logger.info('[Redis] Reconnecting...');
  });

  client.on('end', () => {
    isRedisConnected = false;
    logger.info('[Redis] Connection ended');
  });

  return client;
};

redisClient = createRedisClient();

/**
 * Connect to Redis. Errors are caught and logged — app continues without cache.
 */
const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.warn(`[Redis] Failed to connect: ${err.message}. Continuing without cache.`);
  }
};

/**
 * Set a key in Redis with optional TTL.
 * @param {string} key - Cache key
 * @param {*} value - Value to cache (will be JSON serialized)
 * @param {number} [ttl=300] - TTL in seconds (default: 5 minutes)
 */
const setCache = async (key, value, ttl = 300) => {
  if (!isRedisConnected) return;
  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (err) {
    logger.warn(`[Redis] setCache error for key "${key}": ${err.message}`);
  }
};

/**
 * Get a key from Redis.
 * @param {string} key - Cache key
 * @returns {*|null} Parsed value or null if not found
 */
const getCache = async (key) => {
  if (!isRedisConnected) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.warn(`[Redis] getCache error for key "${key}": ${err.message}`);
    return null;
  }
};

/**
 * Delete a key from Redis.
 * @param {string} key - Cache key
 */
const deleteCache = async (key) => {
  if (!isRedisConnected) return;
  try {
    await redisClient.del(key);
  } catch (err) {
    logger.warn(`[Redis] deleteCache error for key "${key}": ${err.message}`);
  }
};

/**
 * Check if Redis is connected.
 * @returns {boolean}
 */
const isConnected = () => isRedisConnected;

/**
 * Disconnect from Redis gracefully.
 */
const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('[Redis] Disconnected gracefully');
  }
};

module.exports = {
  client: redisClient,
  connectRedis,
  disconnectRedis,
  setCache,
  getCache,
  deleteCache,
  isConnected,
};
