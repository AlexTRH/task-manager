import { Router } from 'express';
import { register, login, me, refresh, logout } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(2),
    password: z.string().min(6),
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10)
  })
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', validate(refreshSchema), logout);
router.get('/me', requireAuth, me);

export default router;
