import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { registerValidator, loginValidator } from '../validators/auth.validator';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Public routes
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);

// Protected routes
router.get('/profile', authenticate, getProfile);

export default router;
