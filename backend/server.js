require('dotenv').config();
const app = require('./src/app');
const { PrismaClient } = require('@prisma/client');
const logger = require('./src/utils/logger');

// Em produção serverless (Vercel), não chama .listen()
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const prisma = new PrismaClient();
  const PORT = process.env.PORT || 3001;

  const start = async () => {
    try {
      await prisma.$connect();
      logger.info('Database connected successfully');
      app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  start();
}
