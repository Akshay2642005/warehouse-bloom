import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validation/auth.schema';
import { hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { createResponse } from '../utils/apiResponse';

/**
 * Registers a new user.
 */
export async function registerUser(req: Request, res: Response): Promise<void> {
  const { email, password } = registerSchema.parse(req.body);

  const existingUser = await AuthService.findUserByEmail(email);
  if (existingUser) {
    res.status(400).json(createResponse({ success: false, message: 'User already exists' }));
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await AuthService.createUser(email, passwordHash);

  res.status(201).json(createResponse({
    data: { user: { id: user.id, email: user.email, role: user.role } },
    message: 'User registered successfully'
  }));
}

/**
 * Logs in an existing user and returns a JWT.
 */
export async function loginUser(req: Request, res: Response): Promise<void> {
  const { email, password } = loginSchema.parse(req.body);

  const user = await AuthService.validateCredentials(email, password);
  if (!user) {
    res.status(401).json(createResponse({ success: false, message: 'Invalid credentials' }));
    return;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  res.status(200).json(createResponse({
    data: { user: { id: user.id, email: user.email, role: user.role }, token },
    message: 'Login successful'
  }));
}


/**
 * Returns the currently logged-in user based on the JWT cookie.
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  const user = req.user; // set by authenticate middleware
  if (!user) {
    res.status(401).json(createResponse({ success: false, message: 'Not authenticated' }));
    return;
  }

  res.status(200).json(createResponse({ data: { user }, message: 'User retrieved successfully' }));
}
