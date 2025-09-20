import { Router } from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/requireAuth';

export const authRouter = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
authRouter.post('/register', registerUser);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login a user and return JWT
 *     tags: [Auth]
 */
authRouter.post('/login', loginUser);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (clear cookie)
 *     tags: [Auth]
 */
authRouter.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});


/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in user
 *     tags: [Auth]
 */
authRouter.get('/me', authenticate, getCurrentUser);
