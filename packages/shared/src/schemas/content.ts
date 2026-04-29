import { z } from 'zod';

export const FlashcardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
});

export const FlashcardDeckSchema = z.object({
  category: z.string(),
  icon: z.string(),
  cards: z.array(FlashcardSchema),
});
export type FlashcardDeck = z.infer<typeof FlashcardDeckSchema>;

export const NounSchema = z.object({
  word: z.string(),
  article: z.enum(['de', 'het']),
  english: z.string().optional(),
  category: z.string().optional(),
});
export type Noun = z.infer<typeof NounSchema>;

export const VerbSchema = z.object({
  id: z.number().optional(),
  rank: z.number().optional(),
  infinitive: z.string(),
  english: z.string(),
  type: z.string().optional(),
  helper: z.string().optional(),
  level: z.string().optional(),
  separable: z.boolean().optional(),
  ik: z.string().optional(),
  jij: z.string().optional(),
  hij: z.string().optional(),
  wij: z.string().optional(),
  past: z.string().optional(),
  participle: z.string().optional(),
  example: z.string().optional(),
  example_en: z.string().optional(),
  conjugations: z
    .object({
      ik: z.string().optional(),
      jij: z.string().optional(),
      hij: z.string().optional(),
      wij: z.string().optional(),
      jullie: z.string().optional(),
      zij: z.string().optional(),
      imperfectum_sg: z.string().optional(),
      imperfectum_pl: z.string().optional(),
      perfectum: z.string().optional(),
    })
    .optional(),
});
export type Verb = z.infer<typeof VerbSchema>;
