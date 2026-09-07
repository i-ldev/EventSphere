// src/infrastructure/repositories/MongoWorkspaceRepository.ts
import { Workspace } from '../../domain/entities/Workspace.js';
import { WorkspaceModel, IWorkspaceDocument } from '../database/models/WorkspaceModel.js';

export class MongoWorkspaceRepository {
  private toDomainEntity(doc: IWorkspaceDocument): Workspace {
    return new Workspace(
      String(doc._id),
      doc.name,
      String(doc.ownerId),
      doc.createdAt,
      doc.updatedAt
    );
  }

  async findByOwnerId(ownerId: string): Promise<Workspace | null> {
    const doc = await WorkspaceModel.findOne({ ownerId });
    return doc ? this.toDomainEntity(doc) : null;
  }

  async create(name: string, ownerId: string): Promise<Workspace> {
    const doc = await WorkspaceModel.create({ name, ownerId });
    return this.toDomainEntity(doc);
  }
}