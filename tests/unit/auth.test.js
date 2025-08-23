import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockUser, setupMockDatabase, mockDate, restoreDate } from '../utils/test-helpers.js';

// Import the auth service
import '../../js/auth.js';

describe('AuthService', () => {
  let authService;
  let mockDb;

  beforeEach(async () => {
    mockDb = setupMockDatabase();
    authService = new (global.window.authService.constructor)();
    await authService.init();
  });

  afterEach(() => {
    restoreDate();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        gender: 'male'
      };

      const mockUser = createMockUser(userData);
      mockDb.createUser.mockResolvedValue(mockUser);
      
      // Mock that user doesn't exist
      authService.findUserByEmail = vi.fn().mockResolvedValue(null);

      const result = await authService.register(userData);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.name).toBe(userData.name);
      expect(result.user.email).toBe(userData.email);
      expect(mockDb.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: userData.name,
          email: userData.email.toLowerCase(),
          age: userData.age,
          gender: userData.gender
        })
      );
    });

    it('should reject registration with invalid data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid: bad email format
        age: 10, // Invalid: too young
        gender: 'invalid' // Invalid: not in allowed values
      };

      const result = await authService.register(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockDb.createUser).not.toHaveBeenCalled();
    });

    it('should reject registration for existing email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'existing@example.com',
        age: 30,
        gender: 'male'
      };

      // Mock existing user
      authService.findUserByEmail = vi.fn().mockResolvedValue(createMockUser());

      const result = await authService.register(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
      expect(mockDb.createUser).not.toHaveBeenCalled();
    });

    it('should validate name requirements', async () => {
      const testCases = [
        { name: 'A', valid: false }, // Too short
        { name: 'A'.repeat(51), valid: false }, // Too long
        { name: 'John123', valid: false }, // Contains numbers
        { name: 'John Doe', valid: true }, // Valid
        { name: "O'Connor", valid: true }, // Valid with apostrophe
        { name: 'Mary-Jane', valid: true } // Valid with hyphen
      ];

      for (const testCase of testCases) {
        const userData = {
          name: testCase.name,
          email: 'test@example.com',
          age: 30,
          gender: 'male'
        };

        authService.findUserByEmail = vi.fn().mockResolvedValue(null);
        
        if (testCase.valid) {
          mockDb.createUser.mockResolvedValue(createMockUser(userData));
        }

        const result = await authService.register(userData);

        expect(result.success).toBe(testCase.valid);
        if (!testCase.valid) {
          expect(result.error).toBeDefined();
        }
      }
    });

    it('should validate email format', async () => {
      const testCases = [
        { email: 'valid@example.com', valid: true },
        { email: 'user.name@domain.co.uk', valid: true },
        { email: 'invalid-email', valid: false },
        { email: '@domain.com', valid: false },
        { email: 'user@', valid: false },
        { email: 'user..name@domain.com', valid: false }
      ];

      for (const testCase of testCases) {
        const userData = {
          name: 'Test User',
          email: testCase.email,
          age: 30,
          gender: 'male'
        };

        authService.findUserByEmail = vi.fn().mockResolvedValue(null);
        
        if (testCase.valid) {
          mockDb.createUser.mockResolvedValue(createMockUser(userData));
        }

        const result = await authService.register(userData);

        expect(result.success).toBe(testCase.valid);
      }
    });
  });

  describe('User Login', () => {
    it('should login existing user successfully', async () => {
      const credentials = { email: 'test@example.com' };
      const mockUser = createMockUser({ email: credentials.email });
      
      authService.findUserByEmail = vi.fn().mockResolvedValue(mockUser);
      authService.createSession = vi.fn().mockResolvedValue(true);

      const result = await authService.login(credentials);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(authService.createSession).toHaveBeenCalledWith(mockUser);
    });

    it('should reject login for non-existent user', async () => {
      const credentials = { email: 'nonexistent@example.com' };
      
      authService.findUserByEmail = vi.fn().mockResolvedValue(null);

      const result = await authService.login(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should require email for login', async () => {
      const result = await authService.login({});

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('Session Management', () => {
    it('should create session with encrypted data', async () => {
      const mockUser = createMockUser();
      mockDate('2024-01-01T00:00:00.000Z');

      const result = await authService.createSession(mockUser);

      expect(result).toBe(true);
      expect(authService.currentUser).toBe(mockUser);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        authService.sessionKey,
        expect.any(String)
      );
    });

    it('should load valid session on init', async () => {
      const mockUser = createMockUser();
      const sessionData = {
        userId: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        sessionToken: 'valid-token',
        loginTime: '2024-01-01T00:00:00.000Z',
        lastActivity: '2024-01-01T00:00:00.000Z',
        expiresAt: '2024-01-08T00:00:00.000Z'
      };

      const encryptedSession = authService.encrypt(sessionData);
      localStorage.getItem.mockReturnValue(encryptedSession);
      mockDb.getUser.mockResolvedValue(mockUser);

      await authService.loadSession();

      expect(authService.currentUser).toEqual(mockUser);
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should clear expired session', async () => {
      const expiredSessionData = {
        userId: 1,
        email: 'test@example.com',
        sessionToken: 'expired-token',
        expiresAt: '2023-01-01T00:00:00.000Z' // Expired
      };

      const encryptedSession = authService.encrypt(expiredSessionData);
      localStorage.getItem.mockReturnValue(encryptedSession);

      await authService.loadSession();

      expect(authService.isAuthenticated()).toBe(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith(authService.sessionKey);
    });

    it('should refresh session activity', async () => {
      const mockUser = createMockUser();
      authService.currentUser = mockUser;
      
      const sessionData = {
        userId: mockUser.id,
        lastActivity: '2024-01-01T00:00:00.000Z',
        expiresAt: '2024-01-08T00:00:00.000Z'
      };

      const encryptedSession = authService.encrypt(sessionData);
      localStorage.getItem.mockReturnValue(encryptedSession);

      await authService.refreshSession();

      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should generate secure session token', () => {
      const token1 = authService.generateSessionToken();
      const token2 = authService.generateSessionToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64); // 32 bytes * 2 hex chars
    });
  });

  describe('Profile Management', () => {
    beforeEach(() => {
      authService.currentUser = createMockUser();
    });

    it('should update user profile successfully', async () => {
      const updates = {
        name: 'Updated Name',
        age: 35
      };

      const updatedUser = { ...authService.currentUser, ...updates };
      mockDb.updateUser.mockResolvedValue(updatedUser);

      const result = await authService.updateProfile(updates);

      expect(result.success).toBe(true);
      expect(result.user.name).toBe(updates.name);
      expect(result.user.age).toBe(updates.age);
      expect(mockDb.updateUser).toHaveBeenCalledWith(
        authService.currentUser.id,
        expect.objectContaining(updates)
      );
    });

    it('should reject profile update for unauthenticated user', async () => {
      authService.currentUser = null;

      const result = await authService.updateProfile({ name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not authenticated');
    });

    it('should validate profile updates', async () => {
      const invalidUpdates = {
        name: 'A', // Too short
        email: 'invalid-email',
        age: 200 // Too old
      };

      const result = await authService.updateProfile(invalidUpdates);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should prevent email conflicts during update', async () => {
      const updates = { email: 'existing@example.com' };
      
      // Mock existing user with different ID
      authService.findUserByEmail = vi.fn().mockResolvedValue(
        createMockUser({ id: 999, email: updates.email })
      );

      const result = await authService.updateProfile(updates);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already in use');
    });

    it('should sanitize profile updates', async () => {
      const maliciousUpdates = {
        name: '<script>alert("xss")</script>'.repeat(10), // Long malicious name
        email: 'TEST@EXAMPLE.COM', // Should be lowercased
        age: '25.5', // Should be parsed to integer
        gender: 'invalid-gender' // Should be filtered out
      };

      const sanitized = authService.sanitizeProfileUpdates(maliciousUpdates);

      expect(sanitized.name.length).toBeLessThanOrEqual(50);
      expect(sanitized.email).toBe('test@example.com');
      expect(sanitized.age).toBe(25);
      expect(sanitized.gender).toBeUndefined();
    });
  });

  describe('Data Encryption', () => {
    it('should encrypt and decrypt data correctly', () => {
      const testData = { sensitive: 'information', userId: 123 };

      const encrypted = authService.encrypt(testData);
      const decrypted = authService.decrypt(encrypted);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toEqual(JSON.stringify(testData));
      expect(decrypted).toEqual(testData);
    });

    it('should handle encryption errors gracefully', () => {
      // Mock JSON.stringify to throw error
      const originalStringify = JSON.stringify;
      JSON.stringify = vi.fn(() => {
        throw new Error('Stringify error');
      });

      const result = authService.encrypt({ test: 'data' });

      expect(result).toBeNull();

      // Restore original function
      JSON.stringify = originalStringify;
    });

    it('should handle decryption errors gracefully', () => {
      const result = authService.decrypt('invalid-encrypted-data');

      expect(result).toBeNull();
    });
  });

  describe('Security Features', () => {
    it('should generate unique encryption keys', () => {
      const key1 = authService.generateRandomString(32);
      const key2 = authService.generateRandomString(32);

      expect(key1).toBeDefined();
      expect(key2).toBeDefined();
      expect(key1).not.toBe(key2);
      expect(key1.length).toBe(32);
    });

    it('should generate browser fingerprint', async () => {
      const fingerprint = await authService.generateIPFingerprint();

      expect(fingerprint).toBeDefined();
      expect(typeof fingerprint).toBe('string');
      expect(fingerprint.length).toBeLessThanOrEqual(20);
    });

    it('should sanitize user data for output', () => {
      const userWithSensitiveData = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        internalField: 'should not be exposed'
      };

      const sanitized = authService.sanitizeUserData(userWithSensitiveData);

      expect(sanitized).toEqual(userWithSensitiveData);
    });
  });

  describe('Logout and Cleanup', () => {
    beforeEach(() => {
      authService.currentUser = createMockUser();
      authService.sessionRefreshTimer = setInterval(() => {}, 1000);
    });

    it('should logout user and clear session', async () => {
      const result = await authService.logout();

      expect(result.success).toBe(true);
      expect(authService.currentUser).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith(authService.sessionKey);
    });

    it('should clear session refresh timer on logout', async () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      await authService.logout();

      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(authService.sessionRefreshTimer).toBeNull();
    });
  });

  describe('Data Export and Privacy', () => {
    beforeEach(() => {
      authService.currentUser = createMockUser();
    });

    it('should export user data for GDPR compliance', async () => {
      const mockHealthReport = {
        assessments: [],
        moods: [],
        progress: []
      };
      mockDb.generateHealthReport.mockResolvedValue(mockHealthReport);

      const result = await authService.exportUserData();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.user).toBeDefined();
      expect(result.data.healthData).toBeDefined();
      expect(result.data.exportDate).toBeDefined();
    });

    it('should clear all user data', async () => {
      const result = await authService.clearAllUserData();

      expect(result.success).toBe(true);
      expect(authService.currentUser).toBeNull();
    });

    it('should reject data operations for unauthenticated users', async () => {
      authService.currentUser = null;

      const exportResult = await authService.exportUserData();
      const clearResult = await authService.clearAllUserData();

      expect(exportResult.success).toBe(false);
      expect(clearResult.success).toBe(false);
    });
  });
});