import { z } from 'zod';
export declare const SheetSlugSchema: z.ZodString;
export declare const MasteryToggleSchema: z.ZodObject<{
    sheetSlug: z.ZodString;
    mastered: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    sheetSlug: string;
    mastered: boolean;
}, {
    sheetSlug: string;
    mastered: boolean;
}>;
export type MasteryToggleDto = z.infer<typeof MasteryToggleSchema>;
export declare const FlashcardProgressSchema: z.ZodObject<{
    deckId: z.ZodString;
    cardId: z.ZodString;
    box: z.ZodNumber;
    dueAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    deckId: string;
    cardId: string;
    box: number;
    dueAt?: string | null | undefined;
}, {
    deckId: string;
    cardId: string;
    box: number;
    dueAt?: string | null | undefined;
}>;
export type FlashcardProgressDto = z.infer<typeof FlashcardProgressSchema>;
export declare const QuizAttemptSchema: z.ZodObject<{
    quizId: z.ZodString;
    score: z.ZodNumber;
    total: z.ZodNumber;
    correct: z.ZodNumber;
    durationMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    quizId: string;
    score: number;
    total: number;
    correct: number;
    durationMs?: number | undefined;
}, {
    quizId: string;
    score: number;
    total: number;
    correct: number;
    durationMs?: number | undefined;
}>;
export type QuizAttemptDto = z.infer<typeof QuizAttemptSchema>;
export declare const KnmAttemptSchema: z.ZodObject<{
    chapterId: z.ZodString;
    score: z.ZodNumber;
    total: z.ZodNumber;
    correct: z.ZodNumber;
    durationMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    score: number;
    total: number;
    correct: number;
    chapterId: string;
    durationMs?: number | undefined;
}, {
    score: number;
    total: number;
    correct: number;
    chapterId: string;
    durationMs?: number | undefined;
}>;
export type KnmAttemptDto = z.infer<typeof KnmAttemptSchema>;
export declare const PreferencesSchema: z.ZodObject<{
    darkMode: z.ZodOptional<z.ZodBoolean>;
    flashcardMode: z.ZodOptional<z.ZodBoolean>;
    hideMastered: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    darkMode?: boolean | undefined;
    flashcardMode?: boolean | undefined;
    hideMastered?: boolean | undefined;
}, {
    darkMode?: boolean | undefined;
    flashcardMode?: boolean | undefined;
    hideMastered?: boolean | undefined;
}>;
export type PreferencesDto = z.infer<typeof PreferencesSchema>;
export declare const ProgressMigrationSchema: z.ZodObject<{
    preferences: z.ZodOptional<z.ZodObject<{
        darkMode: z.ZodOptional<z.ZodBoolean>;
        flashcardMode: z.ZodOptional<z.ZodBoolean>;
        hideMastered: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        darkMode?: boolean | undefined;
        flashcardMode?: boolean | undefined;
        hideMastered?: boolean | undefined;
    }, {
        darkMode?: boolean | undefined;
        flashcardMode?: boolean | undefined;
        hideMastered?: boolean | undefined;
    }>>;
    masteredSlugs: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    masteredSlugs: string[];
    preferences?: {
        darkMode?: boolean | undefined;
        flashcardMode?: boolean | undefined;
        hideMastered?: boolean | undefined;
    } | undefined;
}, {
    masteredSlugs: string[];
    preferences?: {
        darkMode?: boolean | undefined;
        flashcardMode?: boolean | undefined;
        hideMastered?: boolean | undefined;
    } | undefined;
}>;
export type ProgressMigrationDto = z.infer<typeof ProgressMigrationSchema>;
