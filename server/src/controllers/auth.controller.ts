import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema } from "../validation/auth.schema";
import { hashPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { createResponse } from "../utils/apiResponse";
import * as speakeasy from "speakeasy";
import { z } from "zod";

/**
 * Registers a new user.
 */
export async function registerUser(req: Request, res: Response): Promise<void> {
  const { email, password } = registerSchema.parse(req.body);

  const existingUser = await AuthService.findUserByEmail(email);
  if (existingUser) {
    res
      .status(400)
      .json(createResponse({ success: false, message: "User already exists" }));
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await AuthService.createUser(email, passwordHash);

  res.status(201).json(
    createResponse({
      data: { user: { id: user.id, email: user.email, role: user.role } },
      message: "User registered successfully",
    }),
  );
}

/**
 * Logs in an existing user and returns a JWT.
 */
export async function loginUser(req: Request, res: Response): Promise<void> {
  const { email, password } = loginSchema.parse(req.body);

  const user = await AuthService.validateCredentials(email, password);
  if (!user) {
    res
      .status(401)
      .json(createResponse({ success: false, message: "Invalid credentials" }));
    return;
  }

  // Get complete user profile
  const fullUser = await AuthService.findUserById(user.id);
  if (!fullUser) {
    res
      .status(500)
      .json(createResponse({ success: false, message: "User profile not found" }));
    return;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  res.status(200).json(
    createResponse({
      data: {
        user: { id: fullUser.id, email: fullUser.email, role: fullUser.role, name: fullUser.name, avatarUrl: fullUser.avatarUrl, twoFactorEnabled: fullUser.twoFactorEnabled },
        token,
      },
      message: "Login successful",
    }),
  );
}

/**
 * Verify MFA token during login
 */
export async function verifyMFALogin(req: Request, res: Response): Promise<void> {
  const { email, token } = z.object({
    email: z.string().email(),
    token: z.string().length(6)
  }).parse(req.body);

  const user = await AuthService.findUserByEmailWithMFA(email);
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    res.status(400).json(createResponse({ success: false, message: "Invalid request" }));
    return;
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 2
  });

  if (!verified) {
    res.status(400).json(createResponse({ success: false, message: "Invalid verification code" }));
    return;
  }

  const jwtToken = signToken({ id: user.id, email: user.email, role: user.role });

  res.cookie("token", jwtToken, {
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json(
    createResponse({
      data: {
        user: { id: user.id, email: user.email, role: user.role, name: user.name, avatarUrl: user.avatarUrl, twoFactorEnabled: user.twoFactorEnabled },
        token: jwtToken,
      },
      message: "MFA verification successful",
    }),
  );
}

/**
 * Returns the currently logged-in user based on the JWT cookie.
 */
export async function getCurrentUser(
  req: Request,
  res: Response,
): Promise<void> {
  const userPayload = req.user; // set by authenticate middleware
  if (!userPayload) {
    res
      .status(401)
      .json(createResponse({ success: false, message: "Not authenticated" }));
    return;
  }

  // Fetch complete user profile from database
  const user = await AuthService.findUserById(userPayload.id);
  if (!user) {
    res
      .status(404)
      .json(createResponse({ success: false, message: "User not found" }));
    return;
  }

  res.status(200).json(
    createResponse({
      data: { user: { id: user.id, email: user.email, role: user.role, name: user.name, avatarUrl: user.avatarUrl, twoFactorEnabled: user.twoFactorEnabled } },
      message: "User retrieved successfully",
    }),
  );
}
