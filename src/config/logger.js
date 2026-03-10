'use strict';

const winston = require('winston');
const config = require('./index');

/**
 * Custom log levels with associated colors for console output.
 * Follows standard syslog severity levels.
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

/**
 * Determines the appropriate log level based on the environment.
 * In production, only log warnings and above. In development, log everything.
 */
const level = () => {
  const env = config.env || 'development';
  return env === 'production' ? 'warn' : 'debug';
};

/**
 * Base format for all log entries.
 * Includes timestamp, error stack traces, and JSON serialization.
 */
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
);

/**
 * Console transport with colorization for development environments.
 */
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    baseFormat,
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level: lvl, message, requestId, ...meta }) => {
      const reqId = requestId ? `[${requestId}] ` : '';
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return `${timestamp} ${lvl}: ${reqId}${message}${metaStr}`;
    }),
  ),
});

/**
 * File transports for production environments.
 * Writes all logs to combined.log and errors to error.log.
 */
const fileTransports = [
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(baseFormat, winston.format.json()),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(baseFormat, winston.format.json()),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

/**
 * Winston logger instance.
 * Configures transports based on the current environment.
 */
const logger = winston.createLogger({
  level: level(),
  levels,
  transports: [
    consoleTransport,
    // Only write to files in production to avoid cluttering dev environment
    ...(config.env === 'production' ? fileTransports : []),
  ],
});

module.exports = logger;
