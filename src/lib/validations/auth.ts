import { z } from "zod";

/**
 * Username validation schema
 * - 3-20 characters
 * - Only letters, numbers, and underscores
 * - Must start with a letter or number
 */
const usernameSchema = z
  .string("Username must be a string")
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  )
  .refine(
    (val) => /^[a-zA-Z0-9]/.test(val),
    "Username must start with a letter or number"
  );

/**
 * Email validation schema
 */
const emailSchema = z
  .string("Email must be a string")
  .email("Invalid email format")
  .toLowerCase()
  .trim();

/**
 * Password validation schema
 * - Minimum 6 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const passwordSchema = z
  .string("Password must be a string")
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/**
 * Register schema - validates user registration input
 */
export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Login schema - validates user login input
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string("Password must be a string")
    .min(1, "Password is required"),
});

/**
 * TypeScript types inferred from schemas
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
