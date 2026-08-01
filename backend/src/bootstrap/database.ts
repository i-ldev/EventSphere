// src/bootstrap/database.ts
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import logger from '../config/logger.js';

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.fatal(`❌ MongoDB Connection Error: ${error.message}`);
    }
    process.exit(1); // Stop the app if we can't connect to the database
  }
};
