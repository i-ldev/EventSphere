// src/presentation/routes/payment.routes.ts
import { Router } from 'express';
import { StripeService } from '../../application/payment/StripeService.js'; // Updated path
import { StripeConnectService } from '../../application/payment/StripeConnectService.js'; // Updated path
import { MongoTicketTypeRepository } from '../../infrastructure/repositories/MongoTicketTypeRepository.js';
import { MongoRegistrationRepository } from '../../infrastructure/repositories/MongoRegistrationRepository.js';
import { MongoEventRepository } from '../../infrastructure/repositories/MongoEventRepository.js';
import { MongoUserRepository } from '../../infrastructure/repositories/MongoUserRepository.js';
import { MailService } from '../../infrastructure/mail/MailService.js';
import { CreateCheckoutSessionUseCase, VerifyPaymentAndIssueTicketUseCase } from '../../application/payment/PaymentUseCases.js';
import { ConnectStripeUseCase } from '../../application/payment/ConnectStripeUseCase.js';
import { PaymentController } from '../controllers/PaymentController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Dependency Injection
const stripeService = new StripeService();
const stripeConnectService = new StripeConnectService();
const ticketTypeRepository = new MongoTicketTypeRepository();
const registrationRepository = new MongoRegistrationRepository();
const eventRepository = new MongoEventRepository();
const userRepository = new MongoUserRepository();
const mailService = new MailService();

const createCheckoutSessionUseCase = new CreateCheckoutSessionUseCase(
  stripeService, 
  ticketTypeRepository,
  eventRepository,
  userRepository
);

const verifyPaymentAndIssueTicketUseCase = new VerifyPaymentAndIssueTicketUseCase(
  stripeService,
  ticketTypeRepository,
  eventRepository,
  registrationRepository,
  userRepository,
  mailService
);

const connectStripeUseCase = new ConnectStripeUseCase(
  userRepository, 
  stripeConnectService
);

const paymentController = new PaymentController(
  createCheckoutSessionUseCase, 
  verifyPaymentAndIssueTicketUseCase,
  connectStripeUseCase
);

// Routes
router.post('/connect', authMiddleware, paymentController.connectStripe);
router.post('/create-checkout-session', authMiddleware, paymentController.createCheckoutSession);
router.post('/verify', authMiddleware, paymentController.verifyPayment);

export default router;