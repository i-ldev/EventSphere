// src/presentation/routes/ai.routes.ts
import { Router } from 'express';
import { OpenAIService } from '../../infrastructure/ai/OpenAIService.js';
import { GenerateEventContentUseCase } from '../../application/ai/GenerateEventContentUseCase.js';
import { AIController } from '../controllers/AIController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Dependency Injection
const openAIService = new OpenAIService();
const generateEventContentUseCase = new GenerateEventContentUseCase(openAIService);
const aiController = new AIController(generateEventContentUseCase);

// POST /api/v1/ai/generate-event
router.post('/generate-event', authMiddleware, aiController.generateEventContent);

export default router;