// src/application/payment/StripeService.ts
import Stripe from 'stripe';
import { env } from '../../config/env.js';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY);
  }

  async createCheckoutSession(
    ticketName: string,
    price: number,
    eventId: string,
    ticketTypeId: string,
    userId: string,
    organizerStripeAccountId: string,
    applicationFeeAmount: number
  ): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${ticketName} - Event Ticket`,
            },
            unit_amount: Math.round(price * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CLIENT_URL}/events`,
      metadata: {
        eventId,
        ticketTypeId,
        userId,
      },
      // --- STRIPE CONNECT SPLIT PAYMENT ---
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount, // The platform's cut
        transfer_data: {
          destination: organizerStripeAccountId, // The Organizer's bank account
        },
      },
    });

    return session.url!;
  }

  async verifyPayment(sessionId: string): Promise<Stripe.Checkout.Session> {
    return await this.stripe.checkout.sessions.retrieve(sessionId);
  }
}