import { z } from 'zod';

/**
 * Strong password policy: min 12 chars, mixed case, digit, symbol.
 * Matches the OWASP ASVS L1 password requirements.
 */
export const PasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a digit')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain a symbol');

export const EmailSchema = z.string().trim().toLowerCase().email().max(254);

export const RegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  displayName: z.string().trim().min(2).max(40).optional(),
});
export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1).max(128),
  totp: z
    .string()
    .regex(/^\d{6}$/)
    .optional(),
});
export type LoginDto = z.infer<typeof LoginSchema>;

export const PasswordResetRequestSchema = z.object({
  email: EmailSchema,
});

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(20).max(256),
  password: PasswordSchema,
});

export const VerifyEmailSchema = z.object({
  token: z.string().min(20).max(256),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: PasswordSchema,
});
