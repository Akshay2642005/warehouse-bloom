// types/global.d.ts
import 'express-async-errors';

declare global {
  namespace Express {
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

