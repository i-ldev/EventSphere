// src/application/review/GetReviewsForEventUseCase.ts
import {
  IReviewRepository,
  PopulatedReview,
} from '../../domain/repositories/IReviewRepository.js';

export class GetReviewsForEventUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(eventId: string): Promise<PopulatedReview[]> {
    return await this.reviewRepository.findByEventId(eventId);
  }
}
