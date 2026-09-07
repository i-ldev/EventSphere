// src/application/venue/DeleteVenueUseCase.ts
import { IVenueRepository } from '../../domain/repositories/IVenueRepository.js';

export class DeleteVenueUseCase {
  constructor(private venueRepository: IVenueRepository) {}

  async execute(id: string): Promise<boolean> {
    return await this.venueRepository.delete(id);
  }
}