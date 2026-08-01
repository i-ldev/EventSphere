// src/infrastructure/database/models/RegistrationModel.ts
import mongoose, { Schema, Document } from 'mongoose';
import { RegistrationStatus } from '../../../shared/enums/registrationStatus.enum.js';

export interface IRegistrationDocument extends Document {
  eventId: mongoose.Types.ObjectId;
  ticketTypeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: RegistrationStatus;
  checkedIn: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const registrationSchema = new Schema<IRegistrationDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    ticketTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'TicketType',
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(RegistrationStatus),
      default: RegistrationStatus.CONFIRMED,
    },
    checkedIn: { type: Boolean, default: false }, // <-- This must be here!
  },
  { timestamps: true },
);

export const RegistrationModel = mongoose.model<IRegistrationDocument>(
  'Registration',
  registrationSchema,
);
