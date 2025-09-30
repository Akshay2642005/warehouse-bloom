import { Request, Response } from 'express';
import { SessionService } from '../services/session.service';
import { createResponse } from '../utils/apiResponse';

export async function getUserSessions(req: Request, res: Response): Promise<void> {
  const sessions = await SessionService.getUserSessions(req.user!.id);
  res.json(createResponse({
    data: { sessions },
    message: 'Sessions retrieved successfully'
  }));
}

export async function revokeSession(req: Request, res: Response): Promise<void> {
  const { sessionId } = req.params;
  const success = await SessionService.revokeSession(sessionId);
  
  if (success) {
    res.json(createResponse({ message: 'Session revoked successfully' }));
  } else {
    res.status(404).json(createResponse({ 
      success: false, 
      message: 'Session not found' 
    }));
  }
}

export async function revokeAllSessions(req: Request, res: Response): Promise<void> {
  const currentSessionId = req.headers['x-session-id'] as string;
  await SessionService.revokeAllUserSessions(req.user!.id, currentSessionId);
  res.json(createResponse({ message: 'All sessions revoked successfully' }));
}