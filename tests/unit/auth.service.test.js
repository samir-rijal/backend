'use strict';

/**
 * Unit tests for auth.service.js
 * Tests the authentication business logic in isolation by mocking dependencies.
 */

// Set up environment before importing modules
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_ACCESS_EXPIRATION = '15m';
process.env.JWT_REFRESH_EXPIRATION = '7d';
process.env.CORS_ORIGIN = '*';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX = '100';

// Mock dependencies before requiring the module under test
jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/repositories/token.repository');
jest.mock('../../src/services/token.service');
jest.mock('../../src/config/redis', () => ({
  setCache: jest.fn(),
  getCache: jest.fn().mockResolvedValue(null),
  deleteCache: jest.fn(),
  isConnected: jest.fn().mockReturnValue(false),
  connectRedis: jest.fn(),
  disconnectRedis: jest.fn(),
}));

const bcrypt = require('bcrypt');
const authService = require('../../src/services/auth.service');
const userRepository = require('../../src/repositories/user.repository');
const tokenService = require('../../src/services/token.service');
const tokenRepository = require('../../src/repositories/token.repository');
const ApiError = require('../../src/utils/ApiError');

describe('AuthService', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── register ──────────────────────────────────────────────────────────────

  describe('register()', () => {
    const registrationData = {
      email: 'test@example.com',
      password: 'SecurePass1',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should create a user with hashed password and return tokens', async () => {
      // Arrange
      const mockUser = {
        id: 'user-uuid-123',
        email: registrationData.email,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        role: 'USER',
        isActive: true,
      };
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      userRepository.findByEmail.mockResolvedValue(null); // Email doesn't exist
      userRepository.create.mockResolvedValue(mockUser);
      tokenService.generateAuthTokens.mockResolvedValue(mockTokens);

      // Act
      const result = await authService.register(registrationData);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(registrationData.email);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registrationData.email,
          firstName: registrationData.firstName,
          lastName: registrationData.lastName,
          // Password should be hashed (not the plain text)
          password: expect.not.stringContaining(registrationData.password),
        }),
      );
      expect(tokenService.generateAuthTokens).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ user: mockUser, tokens: mockTokens });
    });

    it('should throw 409 if email is already registered', async () => {
      // Arrange
      const existingUser = { id: 'existing-user', email: registrationData.email };
      userRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.register(registrationData)).rejects.toThrow(ApiError);
      await expect(authService.register(registrationData)).rejects.toMatchObject({
        statusCode: 409,
        message: 'Email already registered',
      });
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should hash the password with bcrypt before storing', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({ id: 'user-123', email: registrationData.email });
      tokenService.generateAuthTokens.mockResolvedValue({});

      // Act
      await authService.register(registrationData);

      // Assert
      const createCall = userRepository.create.mock.calls[0][0];
      // Verify the stored password is a bcrypt hash
      const isHashed = await bcrypt.compare(registrationData.password, createCall.password);
      expect(isHashed).toBe(true);
    });
  });

  // ─── login ─────────────────────────────────────────────────────────────────

  describe('login()', () => {
    const hashedPassword = bcrypt.hashSync('SecurePass1', 10);
    const mockUser = {
      id: 'user-uuid-123',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'USER',
      isActive: true,
    };

    it('should return user and tokens for valid credentials', async () => {
      // Arrange
      const mockTokens = { accessToken: 'access', refreshToken: 'refresh' };
      userRepository.findByEmail.mockResolvedValue(mockUser);
      tokenService.generateAuthTokens.mockResolvedValue(mockTokens);

      // Act
      const result = await authService.login('test@example.com', 'SecurePass1');

      // Assert
      expect(result.user).not.toHaveProperty('password'); // Password excluded
      expect(result.tokens).toEqual(mockTokens);
    });

    it('should throw 401 if user does not exist', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login('notfound@example.com', 'anypassword')).rejects.toMatchObject(
        { statusCode: 401, message: 'Invalid email or password' },
      );
    });

    it('should throw 401 for incorrect password', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.login('test@example.com', 'WrongPassword1')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    });

    it('should throw 401 if account is deactivated', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue({ ...mockUser, isActive: false });

      // Act & Assert
      await expect(authService.login('test@example.com', 'SecurePass1')).rejects.toMatchObject({
        statusCode: 401,
        message: expect.stringContaining('deactivated'),
      });
    });
  });

  // ─── logout ────────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('should blacklist the refresh token', async () => {
      // Arrange
      const mockToken = 'mock-refresh-token';
      const mockTokenRecord = { id: 'token-id', token: mockToken, blacklisted: false };
      tokenRepository.findOne.mockResolvedValue(mockTokenRecord);
      tokenService.blacklistToken.mockResolvedValue();

      // Act
      await authService.logout(mockToken);

      // Assert
      expect(tokenRepository.findOne).toHaveBeenCalledWith(mockToken, 'refresh');
      expect(tokenService.blacklistToken).toHaveBeenCalledWith(mockToken);
    });

    it('should throw 404 if token not found', async () => {
      // Arrange
      tokenRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.logout('nonexistent-token')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Token not found',
      });
    });
  });
});
