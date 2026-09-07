// src/presentation/controllers/AIController.ts
import { Response } from 'express';
import { GenerateEventContentUseCase, GenerateContentDTO } from '../../application/ai/GenerateEventContentUseCase.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class AIController {
  constructor(private generateEventContentUseCase: GenerateEventContentUseCase) {}

  generateEventContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const dto: GenerateContentDTO = req.body;
      const content = await this.generateEventContentUseCase.execute(dto);

      res.status(200).json({
        success: true,
        data: content,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      res.status(500).json({ success: false, message });
    }
  };
}