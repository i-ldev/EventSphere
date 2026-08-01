// src/application/ticket/CreateTicketTypeUseCase.ts
import { TicketType } from '../../domain/entities/TicketType.js';
import { ITicketTypeRepository } from '../../domain/repositories/ITicketTypeRepository.js';
import { IEventRepository } from '../../domain/repositories/IEventRepository.js';

export interface CreateTicketTypeDTO {
  eventId: string;
  name: string;
  price: number;
  quantity: number;
}

export class CreateTicketTypeUseCase {
  constructor(
    private ticketTypeRepository: ITicketTypeRepository,
    private eventRepository: IEventRepository,
  ) {}

  async execute(
    dto: CreateTicketTypeDTO,
    organizerId: string,
  ): Promise<TicketType> {
    // 1. Verify the event exists
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // 2. Security check: Verify the user is the organizer of this event
    if (event.organizerId !== organizerId) {
      throw new Error('Unauthorized: Only the event organizer can add tickets');
    }

    // 3. Create the ticket type
    const newTicket = new TicketType(
      '',
      dto.eventId,
      dto.name,
      dto.price,
      dto.quantity,
    );

    return await this.ticketTypeRepository.create(newTicket);
  }
}
