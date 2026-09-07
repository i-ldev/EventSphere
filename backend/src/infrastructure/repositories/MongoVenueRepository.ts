// src/infrastructure/repositories/MongoVenueRepository.ts
import { IVenueRepository } from '../../domain/repositories/IVenueRepository.js';
import { Venue } from '../../domain/entities/Venue.js';
import { VenueModel, IVenueDocument } from '../database/models/VenueModel.js';

export class MongoVenueRepository implements IVenueRepository {
  private toDomainEntity(doc: IVenueDocument): Venue {
    return new Venue(
      String(doc._id),
      doc.name,
      doc.address,
      doc.capacity,
      doc.description,
      doc.equipment,
      doc.workspaceId ? String(doc.workspaceId) : undefined, 
      doc.createdAt,
      doc.updatedAt,
    );
  }

  async findById(id: string): Promise<Venue | null> {
    const doc = await VenueModel.findById(id);
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findAll(): Promise<Venue[]> {
    const docs = await VenueModel.find();
    return docs.map((doc) => this.toDomainEntity(doc));
  }

  async create(venue: Venue): Promise<Venue> {
    const doc = await VenueModel.create({
      name: venue.name,
      address: venue.address,
      capacity: venue.capacity,
      description: venue.description,
      equipment: venue.equipment,
      workspaceId: venue.workspaceId,
    });
    return this.toDomainEntity(doc);
  }

  async update(venue: Venue): Promise<Venue | null> {
    const doc = await VenueModel.findByIdAndUpdate(
      venue.id,
      {
        name: venue.name,
        address: venue.address,
        capacity: venue.capacity,
        description: venue.description,
        equipment: venue.equipment,
      },
      { new: true },
    );
    return doc ? this.toDomainEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await VenueModel.findByIdAndDelete(id);
    return !!result;
  }
}
