// src/infrastructure/repositories/MongoReviewRepository.ts
import {
  IReviewRepository,
  PopulatedReview,
} from '../../domain/repositories/IReviewRepository.js';
import { Review } from '../../domain/entities/Review.js';
import {
  ReviewModel,
  IReviewDocument,
} from '../database/models/ReviewModel.js';

export class MongoReviewRepository implements IReviewRepository {
  private toDomainEntity(doc: IReviewDocument): Review {
    return new Review(
      String(doc._id),
      String(doc.eventId),
      String(doc.userId),
      doc.rating,
      doc.comment,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  async findById(id: string): Promise<Review | null> {
    const doc = await ReviewModel.findById(id);
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findByEventId(eventId: string): Promise<PopulatedReview[]> {
    const docs = await ReviewModel.find({ eventId }).populate(
      'userId',
      'firstName lastName',
    );

    return docs.map((doc) => ({
      id: String(doc._id),
      eventId: String(doc.eventId),
      userId: doc.userId as unknown as PopulatedReview['userId'],
      rating: doc.rating,
      comment: doc.comment,
      createdAt: doc.createdAt as Date,
    }));
  }

  async findByUserAndEvent(
    userId: string,
    eventId: string,
  ): Promise<Review | null> {
    const doc = await ReviewModel.findOne({ userId, eventId });
    return doc ? this.toDomainEntity(doc) : null;
  }

  async create(review: Review): Promise<Review> {
    const doc = await ReviewModel.create({
      eventId: review.eventId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
    });
    return this.toDomainEntity(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await ReviewModel.findByIdAndDelete(id);
    return !!result;
  }
}
