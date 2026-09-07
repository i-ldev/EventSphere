// src/domain/repositories/IVenueRepository.ts
import { Venue } from '../entities/Venue.js';

export interface IVenueRepository {
  findById(id: string): Promise<Venue | null>;
  findAll(workspaceId?: string): Promise<Venue[]>; 
  findAll(): Promise<Venue[]>;
  create(venue: Venue): Promise<Venue>;
  update(venue: Venue): Promise<Venue | null>;
  delete(id: string): Promise<boolean>;
}
