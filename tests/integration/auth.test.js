'use strict';

/**
 * Integration tests for Auth endpoints.
 * Tests the complete HTTP request/response cycle using supertest.
 *
 * NOTE: These tests require a running database and Redis instance.
 * In CI/CD, use docker-compose to spin up the required services.
 * Set DATABASE_URL and REDIS_URL environment variables accordingly.
 *
 * For offline testing without real services, the database/redis calls
 * are mocked in the test environment.
 */

// Set environment variables before any module imports
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/backend_test_db?schema=public';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-for-integration';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-integration';
process.env.JWT_ACCESS_EXPIRATION = '15m';
process.env.JWT_REFRESH_EXPIRATION = '7d';
process.env.CORS_ORIGIN = '*';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX = '1000';

// Mock external services for integration tests
jest.mock('../../src/config/database', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    token: {
      create: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $transaction: jest.fn((args) => Promise.all(args)),
    $on: jest.fn(),
    $disconnect: jest.fn(),
  };
  return mockPrisma;
});

jest.mock('../../src/config/redis', () => ({
  setCache: jest.fn().mockResolvedValue(undefined),
  getCache: jest.fn().mockResolvedValue(null),
  deleteCache: jest.fn().mockResolvedValue(undefined),
  isConnected: jest.fn().mockReturnValue(false),
  connectRedis: jest.fn().mockResolvedValue(undefined),
  disconnectRedis: jest.fn().mockResolvedValue(undefined),
  client: null,
}));

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const prisma = require('../../src/config/database');

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── POST /api/v1/auth/register ────────────────────────────────────────────

  describe('POST /api/v1/auth/register', () => {
    const validRegistration = {
      email: 'newuser@example.com',
      password: 'SecurePass1',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register a new user and return 201 with tokens', async () => {
      // Arrange
      const mockUser = {
        id: 'user-uuid-123',
        email: validRegistration.email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.user.findUnique.mockResolvedValue(null); // Email not taken
      prisma.user.create.mockResolvedValue(mockUser);
      prisma.token.create.mockResolvedValue({ id: 'token-id', token: 'mock-refresh' });

      // Act
      const res = await request(app).post('/api/v1/auth/register').send(validRegistration);

      // Assert
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('tokens');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should return 409 if email is already registered', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue({ id: 'existing', email: validRegistration.email });

      // Act
      const res = await request(app).post('/api/v1/auth/register').send(validRegistration);

      // Assert
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Email already registered');
    });

    it('should return 400 for invalid registration data', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'not-an-email',
        password: '123', // Too short
        firstName: '',   // Empty
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── POST /api/v1/auth/login ───────────────────────────────────────────────

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully and return 200 with tokens', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('SecurePass1', 10);
      const mockUser = {
        id: 'user-uuid-123',
        email: 'user@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.token.create.mockResolvedValue({ id: 'token-id' });

      // Act
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@example.com', password: 'SecurePass1' });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should return 401 for wrong password', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('CorrectPass1', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        password: hashedPassword,
        isActive: true,
      });

      // Act
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@example.com', password: 'WrongPass1' });

      // Assert
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'AnyPass1' });

      expect(res.status).toBe(401);
    });
  });

  // ─── POST /api/v1/auth/refresh-token ──────────────────────────────────────

  describe('POST /api/v1/auth/refresh-token', () => {
    it('should return new tokens for a valid refresh token', async () => {
      // Arrange — generate a real refresh token to use in the test
      const jwt = require('jsonwebtoken');
      const refreshToken = jwt.sign(
        { sub: 'user-uuid-123', role: 'USER', type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' },
      );

      const mockUser = {
        id: 'user-uuid-123',
        email: 'user@example.com',
        role: 'USER',
        isActive: true,
      };

      // Token exists in DB and is not blacklisted
      prisma.token.findFirst.mockResolvedValue({
        id: 'token-id',
        token: refreshToken,
        type: 'refresh',
        blacklisted: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        user: mockUser,
      });
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.token.updateMany.mockResolvedValue({ count: 1 }); // blacklist old token
      prisma.token.create.mockResolvedValue({ id: 'new-token-id' });

      // Act
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens).toHaveProperty('accessToken');
    });
  });

  // ─── Protected routes ──────────────────────────────────────────────────────

  describe('Protected routes (authentication required)', () => {
    it('should return 401 when accessing protected route without token', async () => {
      const res = await request(app).get('/api/v1/users');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for an invalid Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(401);
    });

    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/v1/nonexistent-route');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
