// src/application/venue/CreateVenueUseCase.ts
import { Venue } from '../../domain/entities/Venue.js';
import { IVenueRepository } from '../../domain/repositories/IVenueRepository.js';

export interface CreateVenueDTO {
  name: string;
  address: string;
  capacity: number;
  description?: string;
  equipment: string[];
  workspaceId?: string; // Add this
}

export class CreateVenueUseCase {
  constructor(private venueRepository: IVenueRepository) {}

  async execute(dto: CreateVenueDTO): Promise<Venue> {
    const newVenue = new Venue(
      '',
      dto.name,
      dto.address,
      dto.capacity,
      dto.description,
      dto.equipment,
      dto.workspaceId // Add this
    );

    return await this.venueRepository.create(newVenue);
  }
}