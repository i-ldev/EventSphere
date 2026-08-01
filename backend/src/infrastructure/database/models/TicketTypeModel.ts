// src/infrastructure/database/models/TicketTypeModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketTypeDocument extends Document {
  eventId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ticketTypeSchema = new Schema<ITicketTypeDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, default: 0 },
    quantity: { type: Number, required: true, default: 100 },
  },
  { timestamps: true },
);

export const TicketTypeModel = mongoose.model<ITicketTypeDocument>(
  'TicketType',
  ticketTypeSchema,
);
