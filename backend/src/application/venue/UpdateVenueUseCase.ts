// src/application/venue/UpdateVenueUseCase.ts
import { Venue } from '../../domain/entities/Venue.js';
import { IVenueRepository } from '../../domain/repositories/IVenueRepository.js';

export interface UpdateVenueDTO {
  name: string;
  address: string;
  capacity: number;
  description?: string;
  equipment: string[];
}

export class UpdateVenueUseCase {
  constructor(private venueRepository: IVenueRepository) {}

  async execute(id: string, dto: UpdateVenueDTO): Promise<Venue | null> {
    const venue = await this.venueRepository.findById(id);
    if (!venue) {
      throw new Error('Venue not found');
    }

    venue.name = dto.name;
    venue.address = dto.address;
    venue.capacity = dto.capacity;
    venue.description = dto.description;
    venue.equipment = dto.equipment;

    return await this.venueRepository.update(venue);
  }
}