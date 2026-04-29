import { z } from 'zod';

export const SheetSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9-]+$/, 'Invalid sheet slug');

export const MasteryToggleSchema = z.object({
  sheetSlug: SheetSlugSchema,
  mastered: z.boolean(),
});
export type MasteryToggleDto = z.infer<typeof MasteryToggleSchema>;

export const FlashcardProgressSchema = z.object({
  deckId: z.string().min(1).max(64),
  cardId: z.string().min(1).max(64),
  box: z.number().int().min(0).max(7),
  dueAt: z.string().datetime().nullable().optional(),
});
export type FlashcardProgressDto = z.infer<typeof FlashcardProgressSchema>;

export const QuizAttemptSchema = z.object({
  quizId: z.string().min(1).max(64),
  score: z.number().min(0).max(1),
  total: z.number().int().min(1).max(10000),
  correct: z.number().int().min(0),
  durationMs: z.number().int().min(0).optional(),
});
export type QuizAttemptDto = z.infer<typeof QuizAttemptSchema>;

export const KnmAttemptSchema = z.object({
  chapterId: z.string().min(1).max(64),
  score: z.number().min(0).max(1),
  total: z.number().int().min(1).max(10000),
  correct: z.number().int().min(0),
  durationMs: z.number().int().min(0).optional(),
});
export type KnmAttemptDto = z.infer<typeof KnmAttemptSchema>;

export const PreferencesSchema = z.object({
  darkMode: z.boolean().optional(),
  flashcardMode: z.boolean().optional(),
  hideMastered: z.boolean().optional(),
});
export type PreferencesDto = z.infer<typeof PreferencesSchema>;

/**
 * One-shot bulk migration payload pushed when a previously-anonymous user
 * logs in for the first time and we want to merge their localStorage state
 * into the server.
 */
export const ProgressMigrationSchema = z.object({
  preferences: PreferencesSchema.optional(),
  masteredSlugs: z.array(SheetSlugSchema).max(64),
});
export type ProgressMigrationDto = z.infer<typeof ProgressMigrationSchema>;
