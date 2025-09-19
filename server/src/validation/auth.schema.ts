import { z } from 'zod';

/** Schema for registering a new user */
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

/** Schema for logging in */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>; 