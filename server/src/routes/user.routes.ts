import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
  getUserStats,
  setupTwoFactor,
  verifyTwoFactor,
  disableTwoFactor
} from '../controllers/user.controller';
import { requireAuth } from '../middlewares/requireAuth';
import { requireAdmin } from '../middlewares/requireAdmin';

export const userRouter = Router();

/**
 * Current authenticated user convenience routes (no id in path)
 */
userRouter.get('/profile', requireAuth, (req, res) => {
  // Reuse getUserById logic by injecting current user id
  req.params.id = req.user!.id;
  getUserById(req, res);
});

userRouter.put('/profile', requireAuth, (req, res) => {
  req.params.id = req.user!.id;
  updateUser(req, res);
});
userRouter.patch('/profile', requireAuth, (req, res) => {
  req.params.id = req.user!.id;
  updateUser(req, res);
});

userRouter.put('/password', requireAuth, (req, res) => {
  req.params.id = req.user!.id;
  updatePassword(req, res);
});

/**
 * Get all users (admin only)
 */
userRouter.get('/', requireAuth, requireAdmin, getUsers);

/**
 * Get user statistics (admin only)
 */
userRouter.get('/stats', requireAuth, requireAdmin, getUserStats);

/**
 * Get user by ID
 */
userRouter.get('/:id', requireAuth, getUserById);

/**
 * Update user profile
 */
userRouter.put('/:id', requireAuth, updateUser);
userRouter.patch('/:id', requireAuth, updateUser);

/**
 * Update user password
 */
userRouter.put('/:id/password', requireAuth, updatePassword);

/**
 * Two-factor authentication routes
 */
userRouter.post('/2fa/setup', requireAuth, (req, res) => {
  req.params.id = req.user!.id;
  setupTwoFactor(req, res);
});
userRouter.post('/2fa/verify', requireAuth, (req, res) => {
  req.params.id = req.user!.id;
  verifyTwoFactor(req, res);
});
userRouter.post('/:id/2fa/setup', requireAuth, setupTwoFactor);
userRouter.post('/:id/2fa/verify', requireAuth, verifyTwoFactor);
userRouter.delete('/:id/2fa', requireAuth, disableTwoFactor);
userRouter.delete('/2fa/disable', requireAuth, (req, res) => {
  req.params.id = req.user!.id;
  disableTwoFactor(req, res);
});

/**
 * Delete user (admin only)
 */
userRouter.delete('/:id', requireAuth, requireAdmin, deleteUser);
