// src/application/payment/ConnectStripeUseCase.ts
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { StripeConnectService } from './StripeConnectService.js'; // Updated path

export class ConnectStripeUseCase {
  constructor(
    private userRepository: IUserRepository,
    private stripeConnectService: StripeConnectService
  ) {}

  async execute(userId: string, email: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    // If organizer doesn't have a Stripe account, create one
    if (!user.stripeAccountId) {
      const accountId = await this.stripeConnectService.createExpressAccount(userId, email);
      user.stripeAccountId = accountId;
      await this.userRepository.update(user);
    }

    // Generate the onboarding link
    const accountLinkUrl = await this.stripeConnectService.createAccountLink(user.stripeAccountId);
    return accountLinkUrl;
  }
}