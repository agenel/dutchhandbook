export interface MasteryToggleDto {
  sheetSlug: string;
  mastered: boolean;
}

export interface FlashcardProgressDto {
  deckId: string;
  cardId: string;
  box: number;
  dueAt?: string | null;
}

export interface QuizAttemptDto {
  quizId: string;
  score: number;
  total: number;
  correct: number;
  durationMs?: number;
}

export interface KnmAttemptDto {
  chapterId: string;
  score: number;
  total: number;
  correct: number;
  durationMs?: number;
}

export interface PreferencesDto {
  darkMode?: boolean;
  flashcardMode?: boolean;
  hideMastered?: boolean;
}

export type PreferencesPatchDto = Partial<PreferencesDto>;

export interface VerbSyncDto {
  masteredIds: string[];
}

export interface NounSyncDto {
  masteredIds: string[];
}

export interface AttemptItem {
  id: string;
  tool: 'quiz' | 'knm';
  score: number;
  total: number;
  correct: number;
  durationMs: number | null;
  createdAt: string;
}

export interface ProgressMigrationDto {
  preferences?: PreferencesDto;
  masteredSlugs: string[];
}

export interface CommonWordSyncDto {
  masteredIds: string[];
}
