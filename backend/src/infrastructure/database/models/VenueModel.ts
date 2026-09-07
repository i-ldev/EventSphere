// src/infrastructure/database/models/VenueModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IVenueDocument extends Document {
  name: string;
  address: string;
  capacity: number;
  description?: string;
  equipment: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const venueSchema = new Schema<IVenueDocument>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    capacity: { type: Number, required: true, default: 100 },
    description: { type: String, trim: true },
    equipment: { type: [String], default: [] },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', default: null }, 
  },
  { timestamps: true },
);

export const VenueModel = mongoose.model<IVenueDocument>('Venue', venueSchema);
