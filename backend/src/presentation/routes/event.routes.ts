// src/presentation/routes/event.routes.ts
import { Router } from 'express';
import { MongoEventRepository } from '../../infrastructure/repositories/MongoEventRepository.js';
import { CreateEventUseCase } from '../../application/event/CreateEventUseCase.js';
import { GetEventsUseCase } from '../../application/event/GetEventsUseCase.js';
import { PublishEventUseCase } from '../../application/event/PublishEventUseCase.js';
import { EventController } from '../controllers/EventController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Dependency Injection
const eventRepository = new MongoEventRepository();
const createEventUseCase = new CreateEventUseCase(eventRepository);
const getEventsUseCase = new GetEventsUseCase(eventRepository);
const publishEventUseCase = new PublishEventUseCase(eventRepository);
const eventController = new EventController(
  createEventUseCase,
  getEventsUseCase,
  publishEventUseCase,
);

// Routes
router.post('/', authMiddleware, eventController.create);
router.get('/', eventController.getAll);
router.put('/:id/publish', authMiddleware, eventController.publish); // New route!

export default router;
