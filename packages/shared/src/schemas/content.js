"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerbSchema = exports.NounSchema = exports.FlashcardDeckSchema = exports.FlashcardSchema = void 0;
const zod_1 = require("zod");
exports.FlashcardSchema = zod_1.z.object({
    id: zod_1.z.string(),
    front: zod_1.z.string(),
    back: zod_1.z.string(),
});
exports.FlashcardDeckSchema = zod_1.z.object({
    category: zod_1.z.string(),
    icon: zod_1.z.string(),
    cards: zod_1.z.array(exports.FlashcardSchema),
});
exports.NounSchema = zod_1.z.object({
    word: zod_1.z.string(),
    article: zod_1.z.enum(['de', 'het']),
    english: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
});
exports.VerbSchema = zod_1.z.object({
    infinitive: zod_1.z.string(),
    english: zod_1.z.string(),
    type: zod_1.z.string().optional(),
    ik: zod_1.z.string().optional(),
    jij: zod_1.z.string().optional(),
    hij: zod_1.z.string().optional(),
    wij: zod_1.z.string().optional(),
    past: zod_1.z.string().optional(),
    participle: zod_1.z.string().optional(),
    example: zod_1.z.string().optional(),
});
//# sourceMappingURL=content.js.map