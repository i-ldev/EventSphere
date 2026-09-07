// src/infrastructure/database/models/WorkspaceModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceDocument extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const workspaceSchema = new Schema<IWorkspaceDocument>(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  },
  { timestamps: true }
);

export const WorkspaceModel = mongoose.model<IWorkspaceDocument>('Workspace', workspaceSchema);