import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { PaymentService } from "../services/payment.service";
import { TenantService } from "../services/tenant.service";
import { registerSchema, loginSchema } from "../validation/auth.schema";
import { hashPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { createResponse } from "../utils/apiResponse";
import { prisma } from "../utils/prisma";
import * as speakeasy from "speakeasy";
import { z } from "zod";

/**
 * Registers a new user with payment-gated signup.
 */
export async function registerUser(req: Request, res: Response): Promise<void> {
  const { email, password } = z
    .object({
      email: z.string().email(),
      password: z.string().min(8)
    })
    .parse(req.body);
  
  const plan = "BASIC"; // Single $29/month plan

  // Check if user exists and is active
  const existingUser = await AuthService.findUserByEmail(email);

  if (existingUser && existingUser.isActive) {
    res.status(400).json(
      createResponse({
        success: false,
        message:
          "An active account with this email already exists. Please login instead.",
      }),
    );
    return;
  }

  // If user exists but is inactive (unpaid), don't allow re-registration
  if (existingUser && !existingUser.isActive) {
    res.status(400).json(
      createResponse({
        success: false,
        message:
          "An inactive account with this email exists. Please complete your previous payment or contact support.",
      }),
    );
    return;
  }

  try {
    const passwordHash = await hashPassword(password);

    // Create user (inactive until payment)
    const user = await AuthService.createUser(email, passwordHash);

    // Create tenant workspace
    const subdomain =
      email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") + "-" + Date.now();
    await TenantService.createTenant({
      userId: user.id,
      name: `${email}'s Workspace`,
      subdomain,
      plan: "BASIC",
    });

    // Try to create payment checkout, but allow registration even if it fails
    try {
      const payment = await PaymentService.createSignupPayment(user.id, plan);
      res.status(201).json(
        createResponse({
          data: {
            user: { id: user.id, email: user.email, role: user.role },
            payment: {
              checkoutId: payment.checkoutId,
              checkoutUrl: payment.checkoutUrl,
              amount: payment.amount,
            },
          },
          message: "User registered. Complete payment to activate account.",
        }),
      );
    } catch (paymentError) {
      // If payment fails, activate account anyway for development
      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: true }
      });
      await prisma.tenant.update({
        where: { userId: user.id },
        data: { isActive: true }
      });
      
      res.status(201).json(
        createResponse({
          data: {
            user: { id: user.id, email: user.email, role: user.role },
            warning: "Payment system unavailable. Account activated for development."
          },
          message: "User registered successfully.",
        }),
      );
    }
  } catch (error) {
    res.status(500).json(
      createResponse({
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
      }),
    );
  }
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
      .json(
        createResponse({ success: false, message: "User profile not found" }),
      );
    return;
  }

  // Check if user account is active (payment completed)
  if (!fullUser.isActive) {
    res.status(403).json(
      createResponse({
        success: false,
        message:
          "Account not activated. Please complete payment to access your account.",
        data: { requiresPayment: true },
      }),
    );
    return;
  }

  // Create user session
  await prisma.userSession.create({
    data: {
      userId: user.id,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.cookie("token", token, {
    httpOnly: true,
    // In local dev (http://localhost) use 'lax' to avoid Chrome rejecting insecure SameSite=None cookies
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json(
    createResponse({
      data: {
        user: {
          id: fullUser.id,
          email: fullUser.email,
          role: fullUser.role,
          name: fullUser.name,
          avatarUrl: fullUser.avatarUrl,
          twoFactorEnabled: fullUser.twoFactorEnabled,
        },
        token,
      },
      message: "Login successful",
    }),
  );
}

/**
 * Verify MFA token during login
 */
export async function verifyMFALogin(
  req: Request,
  res: Response,
): Promise<void> {
  const { email, token } = z
    .object({
      email: z.string().email(),
      token: z.string().length(6),
    })
    .parse(req.body);

  const user = await AuthService.findUserByEmailWithMFA(email);
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    res
      .status(400)
      .json(createResponse({ success: false, message: "Invalid request" }));
    return;
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
    window: 2,
  });

  if (!verified) {
    res.status(400).json(
      createResponse({
        success: false,
        message: "Invalid verification code",
      }),
    );
    return;
  }

  const jwtToken = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.cookie("token", jwtToken, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json(
    createResponse({
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          avatarUrl: user.avatarUrl,
          twoFactorEnabled: user.twoFactorEnabled,
        },
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
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          avatarUrl: user.avatarUrl,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      },
      message: "User retrieved successfully",
    }),
  );
}
