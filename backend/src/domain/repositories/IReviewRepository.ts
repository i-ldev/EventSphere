// src/domain/repositories/IReviewRepository.ts
import { Review } from '../entities/Review.js';

export interface PopulatedReview {
  id: string;
  eventId: string;
  userId: {
    firstName: string;
    lastName: string;
  };
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IReviewRepository {
  findById(id: string): Promise<Review | null>;
  findByEventId(eventId: string): Promise<PopulatedReview[]>;
  findByUserAndEvent(userId: string, eventId: string): Promise<Review | null>;
  create(review: Review): Promise<Review>;
  delete(id: string): Promise<boolean>;
}
