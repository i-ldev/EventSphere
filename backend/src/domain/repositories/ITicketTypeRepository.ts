// src/domain/repositories/ITicketTypeRepository.ts
import { TicketType } from '../entities/TicketType.js';

export interface ITicketTypeRepository {
  findById(id: string): Promise<TicketType | null>;
  findByEventId(eventId: string): Promise<TicketType[]>;
  create(ticket: TicketType): Promise<TicketType>;
  update(ticket: TicketType): Promise<TicketType | null>;
  delete(id: string): Promise<boolean>;
}
