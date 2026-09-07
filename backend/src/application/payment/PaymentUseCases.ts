// src/application/payment/PaymentUseCases.ts
import { StripeService } from './StripeService.js'; // Updated path
import { ITicketTypeRepository } from '../../domain/repositories/ITicketTypeRepository.js';
import { IRegistrationRepository } from '../../domain/repositories/IRegistrationRepository.js';
import { IEventRepository } from '../../domain/repositories/IEventRepository.js';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { MailService } from '../../infrastructure/mail/MailService.js';
import { Registration } from '../../domain/entities/Registration.js';
import { RegistrationStatus } from '../../shared/enums/registrationStatus.enum.js';
import QRCode from 'qrcode';

export class CreateCheckoutSessionUseCase {
  constructor(
    private stripeService: StripeService,
    private ticketTypeRepository: ITicketTypeRepository,
    private eventRepository: IEventRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(eventId: string, ticketTypeId: string, userId: string): Promise<string> {
    const ticketType = await this.ticketTypeRepository.findById(ticketTypeId);
    if (!ticketType) throw new Error('Ticket type not found');
    if (ticketType.quantity <= 0) throw new Error('This ticket type is sold out');

    // 1. Fetch the Event to find the Organizer
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error('Event not found');

    // 2. Fetch the Organizer to get their Stripe Account ID
    const organizer = await this.userRepository.findById(event.organizerId);
    if (!organizer || !organizer.stripeAccountId) {
      throw new Error('Organizer has not connected their bank account. Please contact them.');
    }

    // 3. Calculate the 5% Platform Fee
    const priceInCents = Math.round(ticketType.price * 100);
    const applicationFeeAmount = Math.round(priceInCents * 0.05); // 5% fee for the Super Admin

    // 4. Create the Checkout Session with the split payment
    return await this.stripeService.createCheckoutSession(
      ticketType.name,
      ticketType.price,
      eventId,
      ticketTypeId,
      userId,
      organizer.stripeAccountId,
      applicationFeeAmount
    );
  }
}

export class VerifyPaymentAndIssueTicketUseCase {
  constructor(
    private stripeService: StripeService,
    private ticketTypeRepository: ITicketTypeRepository,
    private eventRepository: IEventRepository,
    private registrationRepository: IRegistrationRepository,
    private userRepository: IUserRepository,
    private mailService: MailService
  ) {}

  async execute(sessionId: string): Promise<boolean> {
    // 1. Verify with Stripe
    const session = await this.stripeService.verifyPayment(sessionId);
    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed');
    }

    // 2. Extract metadata
    const { eventId, ticketTypeId, userId } = session.metadata!;
    if (!eventId || !ticketTypeId || !userId) {
      throw new Error('Missing payment metadata');
    }

    // 3. Prevent double-issuing tickets if they refresh the page
    const existingRegistration = await this.registrationRepository.findById(sessionId);
    if (existingRegistration) {
      return true; // Ticket already issued for this session
    }

    // 4. Decrement ticket quantity
    const ticketType = await this.ticketTypeRepository.findById(ticketTypeId);
    if (!ticketType) throw new Error('Ticket type not found');
    ticketType.quantity -= 1;
    await this.ticketTypeRepository.update(ticketType);

    // 5. Create Registration record (using Stripe Session ID as our Registration ID for safety)
    const newRegistration = new Registration(
      sessionId, // Use Stripe session ID to prevent duplicates
      eventId,
      ticketTypeId,
      userId,
      RegistrationStatus.CONFIRMED
    );

    const savedRegistration = await this.registrationRepository.create(newRegistration);

    // 6. Send Confirmation Email
    try {
      const user = await this.userRepository.findById(userId);
      const event = await this.eventRepository.findById(eventId);
      if (user && event) {
        const qrCodeBase64 = await QRCode.toDataURL(savedRegistration.id);
        await this.mailService.sendTicketConfirmation(user.email, event.title, qrCodeBase64);
      }
    } catch (emailError) {
      console.error('Email sending failed, but ticket was issued:', emailError);
    }

    return true;
  }
}