// src/infrastructure/database/models/EventModel.ts
import mongoose, { Schema, Document } from 'mongoose';
import { EventStatus } from '../../../shared/enums/eventStatus.enum.js';

export interface IEventDocument extends Document {
  title: string;
  description: string;
  date: Date;
  venue: mongoose.Types.ObjectId; // Changed to ObjectId reference
  organizerId: mongoose.Types.ObjectId;
  status: EventStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const eventSchema = new Schema<IEventDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    venue: { type: Schema.Types.ObjectId, ref: 'Venue', required: true }, // Refers to VenueModel
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.DRAFT,
    },
  },
  { timestamps: true },
);

export const EventModel = mongoose.model<IEventDocument>('Event', eventSchema);
