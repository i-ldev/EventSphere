// src/app.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import healthRouter from './presentation/routes/health.routes.js';
import authRouter from './presentation/routes/auth.routes.js';
import adminRouter from './presentation/routes/admin.routes.js';
import eventRouter from './presentation/routes/event.routes.js';
import venueRouter from './presentation/routes/venue.routes.js';
import ticketRouter from './presentation/routes/ticket.routes.js';
import registrationRouter from './presentation/routes/registration.routes.js';
import reviewRouter from './presentation/routes/review.routes.js';
const app = express();

// Security & Parsing Middlewares
app.use(helmet());
app.use(
  cors({
    origin: 'http://localhost:5173', // Explicitly allow our Vite frontend
    credentials: true, // Allow cookies to be sent
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/venues', venueRouter);
app.use('/api/v1/events', ticketRouter);
app.use('/api/v1/registrations', registrationRouter);
app.use('/api/v1/events', reviewRouter);
// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

export default app;
