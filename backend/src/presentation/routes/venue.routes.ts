// src/presentation/routes/venue.routes.ts
import { Router } from 'express';
import { MongoVenueRepository } from '../../infrastructure/repositories/MongoVenueRepository.js';
import { CreateVenueUseCase } from '../../application/venue/CreateVenueUseCase.js';
import { GetVenuesUseCase } from '../../application/venue/GetVenuesUseCase.js';
import { VenueController } from '../controllers/VenueController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { Role } from '../../shared/enums/role.enum.js';

const router = Router();

// Dependency Injection
const venueRepository = new MongoVenueRepository();
const createVenueUseCase = new CreateVenueUseCase(venueRepository);
const getVenuesUseCase = new GetVenuesUseCase(venueRepository);
const venueController = new VenueController(
  createVenueUseCase,
  getVenuesUseCase,
);

// Routes
// Only ORGANIZER or SUPER_ADMIN can create venues
router.post(
  '/',
  authMiddleware,
  roleMiddleware([Role.ORGANIZER, Role.SUPER_ADMIN]),
  venueController.create,
);
// Anyone can view venues
router.get('/', venueController.getAll);

export default router;
