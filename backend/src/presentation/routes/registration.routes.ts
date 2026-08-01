// src/presentation/routes/registration.routes.ts
import { Router } from 'express';
import { MongoRegistrationRepository } from '../../infrastructure/repositories/MongoRegistrationRepository.js';
import { MongoTicketTypeRepository } from '../../infrastructure/repositories/MongoTicketTypeRepository.js';
import { MongoEventRepository } from '../../infrastructure/repositories/MongoEventRepository.js';
import { BuyTicketUseCase } from '../../application/registration/BuyTicketUseCase.js';
import { GetMyRegistrationsUseCase } from '../../application/registration/GetMyRegistrationsUseCase.js';
import { GetOrganizerStatsUseCase } from '../../application/registration/GetOrganizerStatsUseCase.js';
import { CheckInAttendeeUseCase } from '../../application/registration/CheckInAttendeeUseCase.js';
import { RegistrationController } from '../controllers/RegistrationController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { Role } from '../../shared/enums/role.enum.js';

const router = Router();

// Dependency Injection
const registrationRepository = new MongoRegistrationRepository();
const ticketTypeRepository = new MongoTicketTypeRepository();
const eventRepository = new MongoEventRepository();

const buyTicketUseCase = new BuyTicketUseCase(
  registrationRepository,
  ticketTypeRepository,
  eventRepository,
);
const getMyRegistrationsUseCase = new GetMyRegistrationsUseCase(
  registrationRepository,
);
const getOrganizerStatsUseCase = new GetOrganizerStatsUseCase(
  registrationRepository,
);
const checkInAttendeeUseCase = new CheckInAttendeeUseCase(
  registrationRepository,
  eventRepository,
);

const registrationController = new RegistrationController(
  buyTicketUseCase,
  getMyRegistrationsUseCase,
  getOrganizerStatsUseCase,
  checkInAttendeeUseCase,
);

// Routes
router.post('/', authMiddleware, registrationController.buyTicket);
router.get('/my-tickets', authMiddleware, registrationController.getMyTickets);
router.get(
  '/stats',
  authMiddleware,
  roleMiddleware([Role.ORGANIZER, Role.SUPER_ADMIN]),
  registrationController.getOrganizerStats,
);

// Check-in route (Organizers and Staff only)
router.put(
  '/:id/check-in',
  authMiddleware,
  roleMiddleware([Role.ORGANIZER, Role.STAFF, Role.SUPER_ADMIN]),
  registrationController.checkInAttendee,
);

export default router;
