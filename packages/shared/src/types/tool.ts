export interface ToolMeta {
  slug: string;
  title: string;
  description: string;
  icon: string;
  tag: string;
}

/**
 * Tool cards on the homepage. Keep every number here true to the data files in
 * apps/web/public/assets/data/ — update the copy whenever content is added.
 * Tags use one taxonomy, by skill: Exam prep · Verbs · Grammar · Vocabulary · Word order.
 */
export const TOOL_REGISTRY: ToolMeta[] = [
  {
    slug: 'knm-exam',
    title: 'KNM Practice Exam',
    description:
      'Mock exams for Kennis van de Nederlandse Maatschappij: 450 questions across all 10 topics, with your score at the end.',
    icon: 'gavel',
    tag: 'Exam prep',
  },
  {
    slug: 'verb-explorer',
    title: 'Verb Explorer',
    description:
      'Search and filter the 200 most common Dutch verbs, with full conjugations and an example for every verb.',
    icon: 'travel_explore',
    tag: 'Verbs',
  },
  {
    slug: 'verb-wheel',
    title: 'Conjugation Wheel',
    description:
      'See present, past and perfect side by side for each of the 200 verbs, then test yourself in drill mode.',
    icon: 'donut_large',
    tag: 'Verbs',
  },
  {
    slug: 'common-words',
    title: 'Common Words',
    description:
      '594 high-frequency words in 30 topic lessons. Work through each list, then practise and mark words as mastered.',
    icon: 'menu_book',
    tag: 'Vocabulary',
  },
  {
    slug: 'flashcards',
    title: 'Flashcards',
    description:
      '230 cards in 18 themed decks. Cards you mark as hard come back until you know them.',
    icon: 'style',
    tag: 'Vocabulary',
  },
  {
    slug: 'de-het',
    title: 'de/het Trainer',
    description:
      'Learn noun genders with a rapid-fire drill of 300 common nouns, filterable by level.',
    icon: 'category',
    tag: 'Grammar',
  },
  {
    slug: 'quiz',
    title: 'Grammar Quiz',
    description:
      '285 questions across 24 grammar topics, with a short explanation after every answer.',
    icon: 'quiz',
    tag: 'Grammar',
  },
  {
    slug: 'sentence-builder',
    title: 'Sentence Builder',
    description:
      'Put the words in the right order: 107 sentences covering 10 word-order rules, from V2 to subordinate clauses.',
    icon: 'account_tree',
    tag: 'Word order',
  },
];

export function getTool(slug: string): ToolMeta | undefined {
  return TOOL_REGISTRY.find((t) => t.slug === slug);
}
