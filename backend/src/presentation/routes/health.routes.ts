// src/presentation/routes/health.routes.ts
import { Router, Request, Response } from 'express';
import logger from '../../config/logger.js';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  logger.info('Health check route hit');
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
