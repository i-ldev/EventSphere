// src/application/review/CreateReviewUseCase.ts
import { Review } from '../../domain/entities/Review.js';
import { IReviewRepository } from '../../domain/repositories/IReviewRepository.js';
import { IRegistrationRepository } from '../../domain/repositories/IRegistrationRepository.js';

export interface CreateReviewDTO {
  eventId: string;
  rating: number;
  comment: string;
}

export class CreateReviewUseCase {
  constructor(
    private reviewRepository: IReviewRepository,
    private registrationRepository: IRegistrationRepository,
  ) {}

  async execute(dto: CreateReviewDTO, userId: string): Promise<Review> {
    // 1. Verify the user actually bought a ticket for this event
    const userRegistrations =
      await this.registrationRepository.findByUserId(userId);
    const hasTicket = userRegistrations.some(
      (reg) => String(reg.eventId._id) === dto.eventId,
    );
    if (!hasTicket) {
      throw new Error('You must purchase a ticket to leave a review');
    }

    // 2. Check if user already reviewed this event
    const existingReview = await this.reviewRepository.findByUserAndEvent(
      userId,
      dto.eventId,
    );
    if (existingReview) {
      throw new Error('You have already reviewed this event');
    }

    // 3. Validate rating
    if (dto.rating < 1 || dto.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // 4. Create review
    const newReview = new Review(
      '',
      dto.eventId,
      userId,
      dto.rating,
      dto.comment,
    );

    return await this.reviewRepository.create(newReview);
  }
}
