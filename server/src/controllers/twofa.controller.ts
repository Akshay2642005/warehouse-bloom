import { Request, Response } from 'express';
import { TwoFAService } from '../services/twofa.service';
import { createResponse } from '../utils/apiResponse';
import { z } from 'zod';

/**
 * Generate 2FA setup
 */
export async function setup2FA(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json(createResponse({ success: false, message: 'Not authenticated' }));
      return;
    }

    const secret = TwoFAService.generateSecret(req.user.email);

    res.status(200).json(
      createResponse({
        data: secret,
        message: '2FA setup generated successfully'
      })
    );

  } catch (error) {
    res.status(500).json(
      createResponse({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to setup 2FA' 
      })
    );
  }
}

/**
 * Enable 2FA
 */
export async function enable2FA(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json(createResponse({ success: false, message: 'Not authenticated' }));
      return;
    }

    const { secret, token } = z.object({
      secret: z.string(),
      token: z.string().length(6)
    }).parse(req.body);

    const user = await TwoFAService.enable2FA(req.user.id, secret, token);

    res.status(200).json(
      createResponse({
        data: user,
        message: '2FA enabled successfully'
      })
    );

  } catch (error) {
    res.status(400).json(
      createResponse({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to enable 2FA' 
      })
    );
  }
}

/**
 * Disable 2FA
 */
export async function disable2FA(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json(createResponse({ success: false, message: 'Not authenticated' }));
      return;
    }

    const { token } = z.object({
      token: z.string().length(6)
    }).parse(req.body);

    const user = await TwoFAService.disable2FA(req.user.id, token);

    res.status(200).json(
      createResponse({
        data: user,
        message: '2FA disabled successfully'
      })
    );

  } catch (error) {
    res.status(400).json(
      createResponse({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to disable 2FA' 
      })
    );
  }
}

/**
 * Verify 2FA token
 */
export async function verify2FA(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json(createResponse({ success: false, message: 'Not authenticated' }));
      return;
    }

    const { token } = z.object({
      token: z.string().length(6)
    }).parse(req.body);

    const verified = await TwoFAService.verifyToken(req.user.id, token);

    res.status(200).json(
      createResponse({
        data: { verified },
        message: verified ? 'Token verified successfully' : 'Invalid token'
      })
    );

  } catch (error) {
    res.status(400).json(
      createResponse({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to verify token' 
      })
    );
  }
}

/**
 * Get 2FA status
 */
export async function get2FAStatus(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json(createResponse({ success: false, message: 'Not authenticated' }));
      return;
    }

    const status = await TwoFAService.get2FAStatus(req.user.id);

    res.status(200).json(
      createResponse({
        data: status,
        message: '2FA status retrieved successfully'
      })
    );

  } catch (error) {
    res.status(500).json(
      createResponse({ 
        success: false, 
        message: 'Failed to get 2FA status' 
      })
    );
  }
}