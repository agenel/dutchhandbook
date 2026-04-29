import { z } from 'zod';
export declare const FlashcardSchema: z.ZodObject<{
    id: z.ZodString;
    front: z.ZodString;
    back: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    front: string;
    back: string;
}, {
    id: string;
    front: string;
    back: string;
}>;
export declare const FlashcardDeckSchema: z.ZodObject<{
    category: z.ZodString;
    icon: z.ZodString;
    cards: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        front: z.ZodString;
        back: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        front: string;
        back: string;
    }, {
        id: string;
        front: string;
        back: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    category: string;
    icon: string;
    cards: {
        id: string;
        front: string;
        back: string;
    }[];
}, {
    category: string;
    icon: string;
    cards: {
        id: string;
        front: string;
        back: string;
    }[];
}>;
export type FlashcardDeck = z.infer<typeof FlashcardDeckSchema>;
export declare const NounSchema: z.ZodObject<{
    word: z.ZodString;
    article: z.ZodEnum<["de", "het"]>;
    english: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    word: string;
    article: "de" | "het";
    category?: string | undefined;
    english?: string | undefined;
}, {
    word: string;
    article: "de" | "het";
    category?: string | undefined;
    english?: string | undefined;
}>;
export type Noun = z.infer<typeof NounSchema>;
export declare const VerbSchema: z.ZodObject<{
    infinitive: z.ZodString;
    english: z.ZodString;
    type: z.ZodOptional<z.ZodString>;
    ik: z.ZodOptional<z.ZodString>;
    jij: z.ZodOptional<z.ZodString>;
    hij: z.ZodOptional<z.ZodString>;
    wij: z.ZodOptional<z.ZodString>;
    past: z.ZodOptional<z.ZodString>;
    participle: z.ZodOptional<z.ZodString>;
    example: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    english: string;
    infinitive: string;
    type?: string | undefined;
    ik?: string | undefined;
    jij?: string | undefined;
    hij?: string | undefined;
    wij?: string | undefined;
    past?: string | undefined;
    participle?: string | undefined;
    example?: string | undefined;
}, {
    english: string;
    infinitive: string;
    type?: string | undefined;
    ik?: string | undefined;
    jij?: string | undefined;
    hij?: string | undefined;
    wij?: string | undefined;
    past?: string | undefined;
    participle?: string | undefined;
    example?: string | undefined;
}>;
export type Verb = z.infer<typeof VerbSchema>;
