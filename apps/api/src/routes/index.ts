import { Router } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import parksRouter from './parks';
import coastersRouter from './coasters';
import creditsRouter from './credits';
import reviewsRouter from './reviews';

const router = Router();

router.use('/auth',  authRouter);
router.use('/users', usersRouter);

// Phase 1 routes — uncomment as each module is implemented
router.use('/parks',    parksRouter);
router.use('/coasters', coastersRouter);
router.use('/credits',  creditsRouter);
router.use('/reviews',  reviewsRouter);

export = router;
