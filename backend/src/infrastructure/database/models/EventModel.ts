// src/infrastructure/database/models/EventModel.ts
import mongoose, { Schema, Document } from 'mongoose';
import { EventStatus } from '../../../shared/enums/eventStatus.enum.js';

export interface IEventDocument extends Document {
  title: string;
  description: string;
  date: Date;
  venue: mongoose.Types.ObjectId | null;
  organizerId: mongoose.Types.ObjectId;
  status: EventStatus;
  category?: string;
  imageUrl?: string;
  maxCapacity: number;
  workspaceId?: string;
  isVirtual: boolean;
  meetingUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const eventSchema = new Schema<IEventDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    venue: { type: Schema.Types.ObjectId, ref: 'Venue', required: false, default: null },
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(EventStatus), default: EventStatus.DRAFT },
    category: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    maxCapacity: { type: Number, required: true, default: 50 },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', default: null },
    isVirtual: { type: Boolean, default: false },
    meetingUrl: { type: String, default: null },
  },
  { timestamps: true }
);

export const EventModel = mongoose.model<IEventDocument>('Event', eventSchema);