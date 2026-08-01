// src/application/venue/GetVenuesUseCase.ts
import { Venue } from '../../domain/entities/Venue.js';
import { IVenueRepository } from '../../domain/repositories/IVenueRepository.js';

export class GetVenuesUseCase {
  constructor(private venueRepository: IVenueRepository) {}

  async execute(): Promise<Venue[]> {
    return await this.venueRepository.findAll();
  }
}
