import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { createResponse } from "../utils/apiResponse";

/**
 * Requires a valid authentication token to access the route.
 * Verifies JWT and attaches user payload to req.user.
 * Supports both Authorization header (Bearer token) and HTTP-only cookies.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    // Extract token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : req.cookies?.token;

    if (!token) {
      res.status(401).json(
        createResponse({
          success: false,
          message: "Access token required",
        }),
      );
      return;
    }

    // Verify JWT
    const payload = verifyToken(token);

    // Attach payload to req.user
    req.user = payload;

    next();
  } catch (error) {
    // Log error for debugging (avoid leaking details to client)
    if (process.env.NODE_ENV !== "production") {
      console.error("Auth error:", (error as Error).message);
    }
    res.status(401).json(
      createResponse({
        success: false,
        message: "Invalid or expired token",
      }),
    );
  }
}

/**
 * Middleware to authenticate user via JWT in HTTP-only cookie or Bearer token.
 * Sets req.user = { id, email, role } if token is valid.
 * Alias for requireAuth for backward compatibility.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Use the same logic as requireAuth
  requireAuth(req, res, next);
}
