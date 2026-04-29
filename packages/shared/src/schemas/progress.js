"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressMigrationSchema = exports.PreferencesSchema = exports.KnmAttemptSchema = exports.QuizAttemptSchema = exports.FlashcardProgressSchema = exports.MasteryToggleSchema = exports.SheetSlugSchema = void 0;
const zod_1 = require("zod");
exports.SheetSlugSchema = zod_1.z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'Invalid sheet slug');
exports.MasteryToggleSchema = zod_1.z.object({
    sheetSlug: exports.SheetSlugSchema,
    mastered: zod_1.z.boolean(),
});
exports.FlashcardProgressSchema = zod_1.z.object({
    deckId: zod_1.z.string().min(1).max(64),
    cardId: zod_1.z.string().min(1).max(64),
    box: zod_1.z.number().int().min(0).max(7),
    dueAt: zod_1.z.string().datetime().nullable().optional(),
});
exports.QuizAttemptSchema = zod_1.z.object({
    quizId: zod_1.z.string().min(1).max(64),
    score: zod_1.z.number().min(0).max(1),
    total: zod_1.z.number().int().min(1).max(10000),
    correct: zod_1.z.number().int().min(0),
    durationMs: zod_1.z.number().int().min(0).optional(),
});
exports.KnmAttemptSchema = zod_1.z.object({
    chapterId: zod_1.z.string().min(1).max(64),
    score: zod_1.z.number().min(0).max(1),
    total: zod_1.z.number().int().min(1).max(10000),
    correct: zod_1.z.number().int().min(0),
    durationMs: zod_1.z.number().int().min(0).optional(),
});
exports.PreferencesSchema = zod_1.z.object({
    darkMode: zod_1.z.boolean().optional(),
    flashcardMode: zod_1.z.boolean().optional(),
    hideMastered: zod_1.z.boolean().optional(),
});
exports.ProgressMigrationSchema = zod_1.z.object({
    preferences: exports.PreferencesSchema.optional(),
    masteredSlugs: zod_1.z.array(exports.SheetSlugSchema).max(64),
});
//# sourceMappingURL=progress.js.map