// src/infrastructure/database/models/CategoryModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryDocument extends Document {
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export const CategoryModel = mongoose.model<ICategoryDocument>('Category', categorySchema);