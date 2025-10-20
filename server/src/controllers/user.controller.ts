import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { createResponse } from "../utils/apiResponse";
import { z } from "zod";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import crypto from 'crypto';

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(["admin", "user"]).optional(),
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  phoneNumber: z.string().min(6).max(32).optional(),
  twoFactorEnabled: z.boolean().optional(),
  confirmEmail: z.string().email().optional()
}).refine(data => {
  if (data.confirmEmail && data.email) {
    return data.confirmEmail === data.email;
  }
  return true;
}, { path: ['confirmEmail'], message: 'Emails do not match' });

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, 'Password must include upper, lower, and number'),
  confirmPassword: z.string().min(8).optional()
}).refine(data => {
  if (data.confirmPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, { path: ['confirmPassword'], message: 'Passwords do not match' });

const twoFactorSchema = z.object({ enabled: z.boolean() });
const verifyTwoFactorSchema = z.object({ token: z.string().length(6) });

/**
 * Get all users (admin only)
 */
export async function getUsers(_req: Request, res: Response): Promise<void> {
  const users = await UserService.getAllUsers();
  res.status(200).json(
    createResponse({
      data: { users },
      message: "Users retrieved successfully",
    }),
  );
}

/**
 * Get user by ID
 */
export async function getUserById(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  const user = await UserService.getUserById(id);
  if (!user) {
    res
      .status(404)
      .json(createResponse({ success: false, message: "User not found" }));
    return;
  }
  res.status(200).json(
    createResponse({
      data: { user },
      message: "User retrieved successfully",
    }),
  );
}

/**
 * Update user profile
 */
export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const validatedData = updateUserSchema.parse(req.body);
    if (req.user!.id !== id && req.user!.role !== "admin") {
      res.status(403).json(createResponse({ success: false, message: "Forbidden" }));
      return;
    }
    
    // Remove confirmEmail from update data as it's only for validation
    const { confirmEmail, ...updateData } = validatedData;
    
    let user;
    try {
      user = await UserService.updateUser(id, updateData);
    } catch (err: any) {
      if (err?.code === 'EMAIL_EXISTS') {
        res.status(409).json(createResponse({ success: false, message: 'Email already in use' }));
        return;
      }
      throw err;
    }
    if (!user) {
      res.status(404).json(createResponse({ success: false, message: "User not found" }));
      return;
    }
    res.status(200).json(createResponse({ data: { user }, message: "User updated successfully" }));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const [k, v] of Object.entries(error.flatten().fieldErrors)) {
        if (v && v.length) fieldErrors[k] = v[0];
      }
      res.status(400).json(createResponse({ success: false, message: 'Validation error', errors: fieldErrors }));
      return;
    }
    res.status(500).json(createResponse({ success: false, message: 'Failed to update user' }));
  }
}

/**
 * Update user password
 */
export async function updatePassword(req: Request, res: Response): Promise<void> {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const { currentPassword, newPassword } = updatePasswordSchema.parse(req.body);
    if (req.user!.id !== id) {
      res.status(403).json(createResponse({ success: false, message: 'Forbidden' }));
      return;
    }
    const success = await UserService.updatePassword(id, currentPassword, newPassword);
    if (!success) {
      res.status(400).json(createResponse({ success: false, message: 'Invalid current password' }));
      return;
    }
    res.status(200).json(createResponse({ message: 'Password updated successfully' }));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const [k, v] of Object.entries(error.flatten().fieldErrors)) {
        if (v && v.length) fieldErrors[k] = v[0];
      }
      res.status(400).json(createResponse({ success: false, message: 'Validation error', errors: fieldErrors }));
      return;
    }
    res.status(500).json(createResponse({ success: false, message: 'Failed to update password' }));
  }
}

/**
 * Setup two-factor authentication
 */
function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }).map(() => crypto.randomBytes(4).toString('hex'));
}

export async function setupTwoFactor(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  if (req.user!.id !== id) {
    res.status(403).json(createResponse({ success: false, message: "Forbidden" }));
    return;
  }

  const secret = speakeasy.generateSecret({
    name: `Warehouse Bloom (${req.user!.email})`,
    issuer: "Warehouse Bloom"
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
  const backupCodes = generateBackupCodes();
  await UserService.updateTwoFactorSecret(id, secret.base32);
  // NOTE: Backup codes are generated and returned but not persisted (schema not added). Persist later if needed.

  res.status(200).json(createResponse({
    data: { secret: secret.base32, qrCode: qrCodeUrl, backupCodes },
    message: "2FA setup initiated"
  }));
}

/**
 * Verify and enable two-factor authentication
 */
export async function verifyTwoFactor(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  const { token } = verifyTwoFactorSchema.parse(req.body);
  
  if (req.user!.id !== id) {
    res.status(403).json(createResponse({ success: false, message: "Forbidden" }));
    return;
  }

  const user = await UserService.getUserById(id);
  if (!user?.twoFactorSecret) {
    res.status(400).json(createResponse({ success: false, message: "2FA not setup" }));
    return;
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 2
  });

  if (!verified) {
    res.status(400).json(createResponse({ success: false, message: "Invalid token" }));
    return;
  }

  await UserService.setTwoFactor(id, true);
  res.status(200).json(createResponse({ message: "2FA enabled successfully" }));
}

/**
 * Disable two-factor authentication
 */
export async function disableTwoFactor(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  if (req.user!.id !== id) {
    res.status(403).json(createResponse({ success: false, message: "Forbidden" }));
    return;
  }

  await UserService.setTwoFactor(id, false);
  await UserService.updateTwoFactorSecret(id, null);
  // Backup codes clearing skipped (not persisted)
  
  res.status(200).json(createResponse({ message: "2FA disabled successfully" }));
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(req: Request, res: Response): Promise<void> {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  // Prevent deleting another admin unless self-deleting (not allowed here) or add super-admin concept later
  const target = await UserService.getUserById(id);
  if (!target) {
    res.status(404).json(createResponse({ success: false, message: "User not found" }));
    return;
  }
  if (target.role === 'admin') {
    res.status(403).json(createResponse({ success: false, message: 'Cannot delete admin user' }));
    return;
  }
  const deleted = await UserService.deleteUser(id);
  if (!deleted) {
    res
      .status(404)
      .json(createResponse({ success: false, message: "User not found" }));
    return;
  }

  res.status(204).send();
}

/**
 * Get user statistics
 */
export async function getUserStats(
  _req: Request,
  res: Response,
): Promise<void> {
  const stats = await UserService.getUserStats();

  res.status(200).json(
    createResponse({
      data: stats,
      message: "User statistics retrieved successfully",
    }),
  );
}
