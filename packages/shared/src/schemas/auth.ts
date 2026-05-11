import { z } from 'zod';

/**
 * Password policy: min 8 chars.
 */
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one symbol');

export const EmailSchema = z.string().trim().toLowerCase().email().max(254);

const sanitize = (val?: string | null) => val?.replace(/<[^>]*>/g, '').trim() || undefined;

export const RegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  displayName: z.string().max(40).optional().transform(sanitize),
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
export type PasswordResetRequestDto = z.infer<typeof PasswordResetRequestSchema>;

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(20).max(256),
  password: PasswordSchema,
});
export type PasswordResetConfirmDto = z.infer<typeof PasswordResetConfirmSchema>;

export const VerifyEmailSchema = z.object({
  token: z.string().min(20).max(256),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: PasswordSchema,
});
