// src/presentation/routes/ticket.routes.ts
import { Router } from 'express';
import { MongoTicketTypeRepository } from '../../infrastructure/repositories/MongoTicketTypeRepository.js';
import { MongoEventRepository } from '../../infrastructure/repositories/MongoEventRepository.js';
import { CreateTicketTypeUseCase } from '../../application/ticket/CreateTicketTypeUseCase.js';
import { GetTicketsForEventUseCase } from '../../application/ticket/GetTicketsForEventUseCase.js';
import { TicketController } from '../controllers/TicketController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Dependency Injection
const ticketTypeRepository = new MongoTicketTypeRepository();
const eventRepository = new MongoEventRepository();

const createTicketTypeUseCase = new CreateTicketTypeUseCase(
  ticketTypeRepository,
  eventRepository,
);
const getTicketsForEventUseCase = new GetTicketsForEventUseCase(
  ticketTypeRepository,
);

const ticketController = new TicketController(
  createTicketTypeUseCase,
  getTicketsForEventUseCase,
);

// Routes
// POST /api/v1/events/:eventId/tickets (Protected)
router.post('/:eventId/tickets', authMiddleware, ticketController.create);

// GET /api/v1/events/:eventId/tickets (Public)
router.get('/:eventId/tickets', ticketController.getByEvent);

export default router;
