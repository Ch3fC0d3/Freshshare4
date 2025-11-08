/**
 * Application Constants
 * Centralized configuration values to avoid magic numbers
 */

module.exports = {
  // JWT Configuration
  JWT: {
    EXPIRATION_DAYS: 7,
    EXPIRATION_SECONDS: 7 * 24 * 60 * 60, // 7 days in seconds
    RENEWAL_THRESHOLD_HOURS: 24,
    RENEWAL_THRESHOLD_SECONDS: 24 * 60 * 60 // 24 hours in seconds
  },

  // Password Configuration
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    BCRYPT_ROUNDS: 10
  },

  // Cookie Configuration
  COOKIE: {
    MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    HTTP_ONLY: true,
    SAME_SITE: 'lax'
  },

  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 100
  },

  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    UPLOAD_DIR: 'public/uploads'
  },

  // Email Verification
  EMAIL: {
    VERIFICATION_TOKEN_EXPIRY_HOURS: 24,
    VERIFICATION_TOKEN_EXPIRY_MS: 24 * 60 * 60 * 1000
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },

  // Database
  DATABASE: {
    CONNECTION_TIMEOUT_MS: 30000,
    SOCKET_TIMEOUT_MS: 45000,
    MAX_POOL_SIZE: 10
  },

  // Server
  SERVER: {
    DEFAULT_PORT: 3002,
    SHUTDOWN_TIMEOUT_MS: 10000
  }
};
