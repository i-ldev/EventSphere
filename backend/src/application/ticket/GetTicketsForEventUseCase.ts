// src/application/ticket/GetTicketsForEventUseCase.ts
import { TicketType } from '../../domain/entities/TicketType.js';
import { ITicketTypeRepository } from '../../domain/repositories/ITicketTypeRepository.js';

export class GetTicketsForEventUseCase {
  constructor(private ticketTypeRepository: ITicketTypeRepository) {}

  async execute(eventId: string): Promise<TicketType[]> {
    return await this.ticketTypeRepository.findByEventId(eventId);
  }
}
