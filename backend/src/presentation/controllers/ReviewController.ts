// src/presentation/controllers/ReviewController.ts
import { Response } from 'express';
import {
  CreateReviewUseCase,
  CreateReviewDTO,
} from '../../application/review/CreateReviewUseCase.js';
import { GetReviewsForEventUseCase } from '../../application/review/GetReviewsForEventUseCase.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class ReviewController {
  constructor(
    private createReviewUseCase: CreateReviewUseCase,
    private getReviewsForEventUseCase: GetReviewsForEventUseCase,
  ) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const dto: CreateReviewDTO = {
        eventId: req.params.eventId,
        rating: req.body.rating,
        comment: req.body.comment,
      };

      const review = await this.createReviewUseCase.execute(dto, req.user!.id);

      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: review,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      res.status(400).json({ success: false, message });
    }
  };

  getByEvent = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const eventId = req.params.eventId;
      const reviews = await this.getReviewsForEventUseCase.execute(eventId);

      res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';
      res.status(500).json({ success: false, message });
    }
  };
}
