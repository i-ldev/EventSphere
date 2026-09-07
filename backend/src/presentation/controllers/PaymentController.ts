// src/presentation/controllers/PaymentController.ts
import { Response } from 'express';
import { CreateCheckoutSessionUseCase, VerifyPaymentAndIssueTicketUseCase } from '../../application/payment/PaymentUseCases.js';
import { ConnectStripeUseCase } from '../../application/payment/ConnectStripeUseCase.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class PaymentController {
  constructor(
    private createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
    private verifyPaymentAndIssueTicketUseCase: VerifyPaymentAndIssueTicketUseCase,
    private connectStripeUseCase: ConnectStripeUseCase
  ) {}

  // Endpoint for Organizers to connect their bank
  connectStripe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const url = await this.connectStripeUseCase.execute(req.user!.id, req.user!.email!);
      res.status(200).json({ success: true, url });
    } catch (error) {
      console.error('Stripe Connect Error:', error); // <-- Added this!
      const message = error instanceof Error ? error.message : 'Failed to connect Stripe';
      res.status(400).json({ success: false, message });
    }
  };

  // Endpoint to create a Stripe Checkout session
  createCheckoutSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { eventId, ticketTypeId } = req.body;
      const url = await this.createCheckoutSessionUseCase.execute(eventId, ticketTypeId, req.user!.id);
      res.status(200).json({ success: true, url });
    } catch (error) {
      console.error('Stripe Checkout Session Error:', error); // <-- Added this!
      const message = error instanceof Error ? error.message : 'Failed to create checkout session';
      res.status(400).json({ success: false, message });
    }
  };

  // Endpoint to verify payment and issue the ticket
  verifyPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.body;
      await this.verifyPaymentAndIssueTicketUseCase.execute(sessionId);
      res.status(200).json({ success: true, message: 'Payment verified and ticket issued' });
    } catch (error) {
      console.error('Stripe Verify Payment Error:', error); // <-- Added this!
      const message = error instanceof Error ? error.message : 'Failed to verify payment';
      res.status(400).json({ success: false, message });
    }
  };
}