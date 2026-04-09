require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-dev-only',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-dev-only',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || '12345678901234567890123456789012',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    authMax: 10,
  },
};
