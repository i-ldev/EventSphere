// backend/src/server.ts
console.log('1. Server file started executing...');

import app from './app.js';
import { env } from './config/env.js';
import logger from './config/logger.js';
import { connectDatabase } from './bootstrap/database.js';

const startServer = async () => {
  // 1. Connect to Database
  await connectDatabase();

  // 2. Start Express Server
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 EventSphere Backend running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  // 3. Handle unhandled rejections
  process.on('unhandledRejection', (err: Error) => {
    logger.fatal(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();