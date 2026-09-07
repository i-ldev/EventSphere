// src/presentation/routes/event.routes.ts
import { Router } from 'express';
import { MongoEventRepository } from '../../infrastructure/repositories/MongoEventRepository.js';
import { MongoRegistrationRepository } from '../../infrastructure/repositories/MongoRegistrationRepository.js'; // <-- Added import
import { CreateEventUseCase } from '../../application/event/CreateEventUseCase.js';
import { UpdateEventUseCase } from '../../application/event/UpdateEventUseCase.js';
import { DeleteEventUseCase } from '../../application/event/DeleteEventUseCase.js';
import { GetEventsUseCase } from '../../application/event/GetEventsUseCase.js';
import { PublishEventUseCase } from '../../application/event/PublishEventUseCase.js';
import { GetEventStatsUseCase } from '../../application/event/GetEventStatsUseCase.js';
import { EventController } from '../controllers/EventController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

const eventRepository = new MongoEventRepository();
const registrationRepository = new MongoRegistrationRepository(); // <-- Added instantiation

const createEventUseCase = new CreateEventUseCase(eventRepository);
const updateEventUseCase = new UpdateEventUseCase(eventRepository);
const deleteEventUseCase = new DeleteEventUseCase(eventRepository);
const getEventsUseCase = new GetEventsUseCase(eventRepository);
const publishEventUseCase = new PublishEventUseCase(eventRepository);
const getEventStatsUseCase = new GetEventStatsUseCase(registrationRepository); // <-- Now defined!

const eventController = new EventController(
  createEventUseCase, 
  updateEventUseCase, 
  deleteEventUseCase, 
  getEventsUseCase, 
  publishEventUseCase,
  getEventStatsUseCase
);

// Routes
router.post('/', authMiddleware, eventController.create);
router.put('/:id', authMiddleware, eventController.update);
router.delete('/:id', authMiddleware, eventController.delete);

// Apply optionalAuthMiddleware here so the backend knows IF an organizer is logged in
router.get('/', optionalAuthMiddleware, eventController.getAll); 

router.put('/:id/publish', authMiddleware, eventController.publish);
router.get('/:id/stats', authMiddleware, eventController.getStats);

export default router;