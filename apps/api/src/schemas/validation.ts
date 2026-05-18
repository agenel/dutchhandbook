import { z } from 'zod';

// ── Shared helpers ────────────────────────────────────────────────────────────

const sanitize = (val?: string | null) => val?.replace(/<[^>]*>/g, '').trim() || undefined;
const sanitizeNullable = (val?: string | null) => (val ? val.replace(/<[^>]*>/g, '').trim() : val);

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one symbol');

const EmailSchema = z.string().trim().toLowerCase().email().max(254);

const SheetSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9-]+$/, 'Invalid sheet slug');

// ── Auth ──────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  displayName: z.string().max(40).optional().transform(sanitize),
});

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1).max(128),
  totp: z
    .string()
    .regex(/^\d{6}$/)
    .optional(),
});

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

// ── Progress ──────────────────────────────────────────────────────────────────

export const MasteryToggleSchema = z.object({
  sheetSlug: SheetSlugSchema,
  mastered: z.boolean(),
});

export const FlashcardProgressSchema = z.object({
  deckId: z.string().min(1).max(64),
  cardId: z.string().min(1).max(64),
  box: z.number().int().min(0).max(7),
  dueAt: z.string().datetime().nullable().optional(),
});

export const QuizAttemptSchema = z.object({
  quizId: z.string().min(1).max(64),
  score: z.number().min(0).max(1),
  total: z.number().int().min(1).max(10000),
  correct: z.number().int().min(0),
  durationMs: z.number().int().min(0).optional(),
});

export const KnmAttemptSchema = z.object({
  chapterId: z.string().min(1).max(64),
  score: z.number().min(0).max(1),
  total: z.number().int().min(1).max(10000),
  correct: z.number().int().min(0),
  durationMs: z.number().int().min(0).optional(),
});

export const PreferencesSchema = z.object({
  darkMode: z.boolean().optional(),
  flashcardMode: z.boolean().optional(),
  hideMastered: z.boolean().optional(),
});

export const PreferencesPatchSchema = PreferencesSchema.partial();

export const VerbSyncSchema = z.object({
  masteredIds: z.array(z.string().min(1).max(64)).max(500),
});

export const NounSyncSchema = z.object({
  masteredIds: z.array(z.string().min(1).max(64)).max(2000),
});

export const CommonWordSyncSchema = z.object({
  masteredIds: z.array(z.string().min(1).max(64)).max(2000),
});

export const ProgressMigrationSchema = z.object({
  preferences: PreferencesSchema.optional(),
  masteredSlugs: z.array(SheetSlugSchema).max(64),
});

// ── Admin ─────────────────────────────────────────────────────────────────────

export const AdminUserPatchSchema = z.object({
  displayName: z.string().optional().nullable().transform(sanitizeNullable),
  isBanned: z.boolean().optional(),
  bannedReason: z.string().optional().nullable().transform(sanitizeNullable),
  isAdmin: z.boolean().optional(),
});

export const UpdateSettingsSchema = z.record(
  z.string().min(1).max(128).regex(/^[a-zA-Z0-9_.-]+$/, 'Invalid key format'),
  z.string().max(2048)
);


