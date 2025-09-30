import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema } from "../validation/auth.schema";
import { hashPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { createResponse } from "../utils/apiResponse";

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
