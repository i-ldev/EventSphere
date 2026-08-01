// src/presentation/routes/review.routes.ts
import { Router } from 'express';
import { MongoReviewRepository } from '../../infrastructure/repositories/MongoReviewRepository.js';
import { MongoRegistrationRepository } from '../../infrastructure/repositories/MongoRegistrationRepository.js';
import { CreateReviewUseCase } from '../../application/review/CreateReviewUseCase.js';
import { GetReviewsForEventUseCase } from '../../application/review/GetReviewsForEventUseCase.js';
import { ReviewController } from '../controllers/ReviewController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Dependency Injection
const reviewRepository = new MongoReviewRepository();
const registrationRepository = new MongoRegistrationRepository();

const createReviewUseCase = new CreateReviewUseCase(
  reviewRepository,
  registrationRepository,
);
const getReviewsForEventUseCase = new GetReviewsForEventUseCase(
  reviewRepository,
);

const reviewController = new ReviewController(
  createReviewUseCase,
  getReviewsForEventUseCase,
);

// Routes
// POST /api/v1/events/:eventId/reviews (Protected - must have ticket)
router.post('/:eventId/reviews', authMiddleware, reviewController.create);

// GET /api/v1/events/:eventId/reviews (Public)
router.get('/:eventId/reviews', reviewController.getByEvent);

export default router;
