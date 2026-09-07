// src/application/registration/BuyTicketUseCase.ts
import QRCode from 'qrcode';
import { Registration } from '../../domain/entities/Registration.js';
import { IRegistrationRepository } from '../../domain/repositories/IRegistrationRepository.js';
import { ITicketTypeRepository } from '../../domain/repositories/ITicketTypeRepository.js';
import { IEventRepository } from '../../domain/repositories/IEventRepository.js';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { MailService } from '../../infrastructure/mail/MailService.js';
import { EventStatus } from '../../shared/enums/eventStatus.enum.js';
import { RegistrationStatus } from '../../shared/enums/registrationStatus.enum.js';

export interface BuyTicketDTO {
  eventId: string;
  ticketTypeId: string;
}

export class BuyTicketUseCase {
  constructor(
    private registrationRepository: IRegistrationRepository,
    private ticketTypeRepository: ITicketTypeRepository,
    private eventRepository: IEventRepository,
    private userRepository: IUserRepository, // Added to get user email
    private mailService: MailService // Added to send email
  ) {}

  async execute(dto: BuyTicketDTO, userId: string): Promise<Registration> {
    // 1. Check if event exists and is PUBLISHED
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) throw new Error('Event not found');
    if (event.status !== EventStatus.PUBLISHED) {
      throw new Error('Cannot buy tickets for an unpublished event');
    }

    // 2. Check if ticket type exists and belongs to this event
    const ticketType = await this.ticketTypeRepository.findById(dto.ticketTypeId);
    if (!ticketType) throw new Error('Ticket type not found');
    if (ticketType.eventId !== dto.eventId) {
      throw new Error('Ticket does not belong to this event');
    }

    // 3. Check capacity
    if (ticketType.quantity <= 0) {
      throw new Error('This ticket type is sold out');
    }

    // 4. Decrement ticket quantity
    ticketType.quantity -= 1;
    await this.ticketTypeRepository.update(ticketType);

    // 5. Create Registration record
    const newRegistration = new Registration(
      '',
      dto.eventId,
      dto.ticketTypeId,
      userId,
      RegistrationStatus.CONFIRMED
    );

    const savedRegistration = await this.registrationRepository.create(newRegistration);

    // 6. Send Confirmation Email (Non-blocking)
    try {
      const user = await this.userRepository.findById(userId);
      if (user) {
        // Generate QR code as base64 string
        const qrCodeBase64 = await QRCode.toDataURL(savedRegistration.id);
        
        // Send email
        await this.mailService.sendTicketConfirmation(
          user.email,
          event.title,
          qrCodeBase64
        );
      }
    } catch (emailError) {
      console.error('Email sending failed, but ticket was purchased successfully:', emailError);
    }

    return savedRegistration;
  }
}