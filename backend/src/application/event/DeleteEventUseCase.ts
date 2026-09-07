// src/application/event/DeleteEventUseCase.ts
import { IEventRepository } from '../../domain/repositories/IEventRepository.js';

export class DeleteEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(id: string): Promise<boolean> {
    return await this.eventRepository.delete(id);
  }
}