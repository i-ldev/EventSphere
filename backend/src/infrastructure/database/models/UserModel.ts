// src/infrastructure/database/models/UserModel.ts
import mongoose, { Schema, Document } from 'mongoose';
import { Role } from '../../../shared/enums/role.enum.js';

// Interface for the raw document stored in Mongo
export interface IUserDocument extends Document {
  email: string;
  password: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), default: Role.ATTENDEE },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);
