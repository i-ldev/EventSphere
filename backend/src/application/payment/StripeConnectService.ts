// src/application/payment/StripeConnectService.ts
import Stripe from 'stripe';
import { env } from '../../config/env.js';

export class StripeConnectService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY);
  }

  // 1. Create a Stripe Express account for the Organizer
  async createExpressAccount(userId: string, email: string): Promise<string> {
    const account = await this.stripe.accounts.create({
      type: 'express',
      email: email,
      metadata: {
        userId: userId,
      },
    });
    return account.id;
  }

  // 2. Generate the Onboarding Link (Stripe's secure form for bank details)
  async createAccountLink(accountId: string): Promise<string> {
    const accountLink = await this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${env.CLIENT_URL}/dashboard`,
      return_url: `${env.CLIENT_URL}/dashboard`,
      type: 'account_onboarding',
    });
    return accountLink.url;
  }
}