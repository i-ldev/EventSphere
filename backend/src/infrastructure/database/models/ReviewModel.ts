// src/infrastructure/database/models/ReviewModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewDocument extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

// Prevent a user from submitting multiple reviews for the same event
reviewSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const ReviewModel = mongoose.model<IReviewDocument>(
  'Review',
  reviewSchema,
);
