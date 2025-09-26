import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { createResponse } from '../utils/apiResponse';
import { z } from 'zod';

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(['admin', 'user']).optional(),
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  twoFactorEnabled: z.boolean().optional()
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8)
});

const twoFactorSchema = z.object({ enabled: z.boolean() });

/**
 * Get all users (admin only)
 */
export async function getUsers(req: Request, res: Response): Promise<void> {
  const users = await UserService.getAllUsers();
  res.status(200).json(createResponse({ data: { users }, message: 'Users retrieved successfully' }));
}

/**
 * Get user by ID
 */
export async function getUserById(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  const user = await UserService.getUserById(id);
  if (!user) { res.status(404).json(createResponse({ success: false, message: 'User not found' })); return; }
  res.status(200).json(createResponse({ data: { user }, message: 'User retrieved successfully' }));
}

/**
 * Update user profile
 */
export async function updateUser(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  const updateData = updateUserSchema.parse(req.body);
  if (req.user!.id !== id && req.user!.role !== 'admin') { res.status(403).json(createResponse({ success: false, message: 'Forbidden' })); return; }
  const user = await UserService.updateUser(id, updateData);
  if (!user) { res.status(404).json(createResponse({ success: false, message: 'User not found' })); return; }
  res.status(200).json(createResponse({ data: { user }, message: 'User updated successfully' }));
}

/**
 * Update user password
 */
export async function updatePassword(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  const { currentPassword, newPassword } = updatePasswordSchema.parse(req.body);
  if (req.user!.id !== id) { res.status(403).json(createResponse({ success: false, message: 'Forbidden' })); return; }
  const success = await UserService.updatePassword(id, currentPassword, newPassword);
  if (!success) { res.status(400).json(createResponse({ success: false, message: 'Invalid current password' })); return; }
  res.status(200).json(createResponse({ message: 'Password updated successfully' }));
}

/**
 * Toggle two-factor authentication
 */
export async function toggleTwoFactor(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  if (req.user!.id !== id) { res.status(403).json(createResponse({ success: false, message: 'Forbidden' })); return; }
  const { enabled } = twoFactorSchema.parse(req.body);
  const updated = await UserService.setTwoFactor(id, enabled);
  res.status(200).json(createResponse({ data: updated, message: 'Two-factor updated' }));
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);

  const deleted = await UserService.deleteUser(id);
  if (!deleted) {
    res.status(404).json(createResponse({ success: false, message: 'User not found' }));
    return;
  }

  res.status(204).send();
}

/**
 * Get user statistics
 */
export async function getUserStats(req: Request, res: Response): Promise<void> {
  const stats = await UserService.getUserStats();

  res.status(200).json(createResponse({
    data: stats,
    message: 'User statistics retrieved successfully'
  }));
}
