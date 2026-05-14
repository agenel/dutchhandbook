export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardDeck {
  category: string;
  icon: string;
  cards: Flashcard[];
}

export interface Noun {
  id?: number;
  word: string;
  article: 'de' | 'het';
  english?: string;
  category?: string;
}

interface VerbConjugations {
  ik?: string;
  jij?: string;
  hij?: string;
  wij?: string;
  jullie?: string;
  zij?: string;
  imperfectum_sg?: string;
  imperfectum_pl?: string;
  perfectum?: string;
}

export interface Verb {
  id?: number;
  rank?: number;
  infinitive: string;
  english: string;
  type?: string;
  helper?: string;
  level?: string;
  separable?: boolean;
  ik?: string;
  jij?: string;
  hij?: string;
  wij?: string;
  past?: string;
  participle?: string;
  example?: string;
  example_en?: string;
  conjugations?: VerbConjugations;
}
