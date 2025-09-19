import 'express-async-errors';

declare global {
  namespace Express {
    // Extend Request with user for authenticated routes
    interface UserPayload {
      id: string;
      email: string;
      role?: string;
    }
    interface Request {
      user?: UserPayload;
    }
  }
}

export { }; 