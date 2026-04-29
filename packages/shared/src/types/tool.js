"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_REGISTRY = void 0;
exports.getTool = getTool;
exports.TOOL_REGISTRY = [
    {
        slug: 'knm-exam',
        title: 'KNM Practice Exam',
        description: 'Prepare for the Knowledge of Dutch Society exam with realistic mock tests and analytics.',
        icon: 'gavel',
        tag: 'Exam Prep',
    },
    {
        slug: 'verb-explorer',
        title: 'Verb Explorer',
        description: 'Search and filter the 200 most common Dutch verbs. Full conjugations and examples for every verb.',
        icon: 'travel_explore',
        tag: 'Priority Tool',
    },
    {
        slug: 'flashcards',
        title: 'Flashcards',
        description: 'Master essential Dutch vocabulary with spaced-repetition flashcards across 6 categories.',
        icon: 'style',
        tag: 'Vocabulary',
    },
    {
        slug: 'de-het',
        title: 'de/het Trainer',
        description: 'The fastest way to learn noun genders. Practice 500+ common nouns in a rapid-fire drill.',
        icon: 'category',
        tag: 'Practice',
    },
    {
        slug: 'quiz',
        title: 'Grammar Quiz',
        description: 'Test your knowledge of the grammar rules with interactive quizzes linked to our cheat sheets.',
        icon: 'quiz',
        tag: 'Tests',
    },
    {
        slug: 'sentence-builder',
        title: 'Sentence Builder',
        description: 'Master Dutch word order by assembling sentences block by block. V2, Inversion, and more.',
        icon: 'account_tree',
        tag: 'Advanced',
    },
];
function getTool(slug) {
    return exports.TOOL_REGISTRY.find((t) => t.slug === slug);
}
//# sourceMappingURL=tool.js.map