import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
  getUserStats,
  toggleTwoFactor
} from '../controllers/user.controller';
import { requireAuth } from '../middlewares/requireAuth';
import { requireAdmin } from '../middlewares/requireAdmin';

export const userRouter = Router();

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

/**
 * Update user password
 */
userRouter.put('/:id/password', requireAuth, updatePassword);

/** Enable/disable two-factor */
userRouter.put('/:id/twofactor', requireAuth, toggleTwoFactor);

/**
 * Delete user (admin only)
 */
userRouter.delete('/:id', requireAuth, requireAdmin, deleteUser);
