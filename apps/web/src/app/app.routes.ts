import { Routes } from '@angular/router';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    data: {
      title: 'More Dutch — Interactive Dutch Grammar Hub & Cheat Sheets',
      description:
        'The ultimate interactive hub for Dutch learners. Master A1-B1 grammar with 15+ cheat sheets, verb explorers, flashcards, and drills. Start learning for free at More Dutch.',
      canonicalPath: '/',
      seoJsonLd: 'home' as const,
      keywords:
        'Dutch grammar, learn Dutch, Dutch cheat sheets, Dutch verbs, A1 Dutch, B1 Dutch, Dutch flashcards',
    },
  },
  {
    path: 'cheatsheets',
    loadComponent: () =>
      import('./pages/cheatsheets/cheatsheets.component').then((m) => m.CheatsheetsComponent),
    data: {
      title: '15 Essential Dutch Grammar Cheat Sheets — More Dutch',
      description:
        'Browse 15 interactive Dutch grammar cheat sheets covering A1 to B1 levels. Master Dutch word order, verbs, negation, and more with our free library.',
      canonicalPath: '/cheatsheets',
      seoJsonLd: 'cheatsheets' as const,
      keywords: 'Dutch grammar sheets, Dutch A1, Dutch A2, Dutch B1, grammar modules',
    },
  },
  {
    path: 'help',
    loadComponent: () => import('./pages/help/help.component').then((m) => m.HelpComponent),
    data: {
      title: 'Learning Guide — More Dutch',
      description:
        'How to get the most out of More Dutch — full learning guide for the interactive Dutch grammar hub.',
      canonicalPath: '/help',
    },
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
    data: {
      title: 'About Us — More Dutch',
      description:
        'Learn about the mission of More Dutch and how it was built to help expats pass the KNM and DUO integration exams.',
      canonicalPath: '/about',
    },
  },
  {
    path: 'sheets/:slug',
    loadComponent: () =>
      import('./pages/sheet-page/sheet-page.component').then((m) => m.SheetPageComponent),
  },
  {
    path: 'tools/verb-explorer',
    loadComponent: () =>
      import('./pages/tools/verb-explorer/verb-explorer.component').then(
        (m) => m.VerbExplorerComponent,
      ),
    data: {
      title: 'Dutch Verb Explorer — Conjugations & Search | More Dutch',
      description:
        'Search and filter the most common Dutch verbs. Conjugations and example sentences for every verb.',
      canonicalPath: '/tools/verb-explorer',
      keywords: 'Dutch verbs, Dutch conjugation, irregular Dutch verbs, modal verbs Dutch',
    },
  },
  {
    path: 'tools/flashcards',
    loadComponent: () =>
      import('./pages/tools/flashcards/flashcards.component').then((m) => m.FlashcardsComponent),
    data: {
      title: 'Dutch Vocabulary Flashcards — Learn Fast | More Dutch',
      description:
        'Master essential Dutch vocabulary with interactive flashcards. Categories include numbers, colors, clothing, and house items.',
      canonicalPath: '/tools/flashcards',
      keywords: 'Dutch vocabulary, Dutch flashcards, spaced repetition Dutch',
    },
  },
  {
    path: 'tools/de-het',
    loadComponent: () =>
      import('./pages/tools/de-het/de-het.component').then((m) => m.DeHetComponent),
    data: {
      title: 'de / het Trainer — Master Dutch Noun Gender | More Dutch',
      description:
        'The fastest way to learn de/het. Practice 500+ common nouns in a rapid-fire drill.',
      canonicalPath: '/tools/de-het',
      keywords: 'de het Dutch, Dutch noun gender, common nouns Dutch',
    },
  },
  {
    path: 'tools/quiz',
    loadComponent: () =>
      import('./pages/tools/quiz/quiz.component').then((m) => m.QuizComponent),
    data: {
      title: 'Dutch Grammar Quiz — More Dutch',
      description:
        'Test your knowledge of Dutch grammar with interactive quizzes linked to our cheat sheets.',
      canonicalPath: '/tools/quiz',
      keywords: 'Dutch grammar quiz, Dutch practice test',
    },
  },
  {
    path: 'tools/sentence-builder',
    loadComponent: () =>
      import('./pages/tools/sentence-builder/sentence-builder.component').then(
        (m) => m.SentenceBuilderComponent,
      ),
    data: {
      title: 'Sentence Builder — Master Dutch Word Order | More Dutch',
      description:
        'Master Dutch word order by assembling sentences block by block. V2, Inversion, and more.',
      canonicalPath: '/tools/sentence-builder',
      keywords: 'Dutch word order, V2 Dutch, Dutch sentence structure',
    },
  },
  {
    path: 'tools/verb-wheel',
    loadComponent: () =>
      import('./pages/tools/verb-wheel/verb-wheel.component').then(
        (m) => m.VerbWheelComponent,
      ),
    data: {
      title: 'Verb Conjugation Wheel — Visualize Dutch Tenses | More Dutch',
      description:
        'Browse all 200 Dutch verbs in an interactive tense wheel. Practice present, past, and perfect tenses with drill mode.',
      canonicalPath: '/tools/verb-wheel',
      keywords: 'Dutch verb conjugation, Dutch tenses, Dutch grammar drill, verb wheel',
    },
  },
  {
    path: 'tools/knm-exam',
    loadComponent: () =>
      import('./pages/tools/knm-exam/knm-exam.component').then((m) => m.KnmExamComponent),
    data: {
      title: 'KNM Practice Exam — Dutch Society Test | More Dutch',
      description:
        'Practice for the KNM exam with randomized mock tests from all 10 Dutch society chapters.',
      canonicalPath: '/tools/knm-exam',
      keywords: 'KNM exam, Dutch society exam, Inburgering KNM practice',
    },
  },
  {
    path: 'tools/common-words',
    loadComponent: () =>
      import('./pages/tools/common-words/common-words.component').then((m) => m.CommonWordsComponent),
    data: {
      title: '1000 Most Common Dutch Words — Master Vocabulary | More Dutch',
      description:
        'Master the 1000 most frequently used Dutch words grouped by lesson. Interactive flashcards and list views for efficient learning.',
      canonicalPath: '/tools/common-words',
      keywords: 'Dutch vocabulary, 1000 common Dutch words, learn Dutch words, basic Dutch',
    },
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
    data: {
      title: 'Sign in — More Dutch',
      description: 'Sign in to More Dutch to sync your Dutch learning progress across devices.',
      canonicalPath: '/auth/login',
      robots: 'noindex, follow',
    },
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),
    data: {
      title: 'Create account — More Dutch',
      description: 'Create a free More Dutch account to save mastery, quiz scores, and preferences.',
      canonicalPath: '/auth/register',
      robots: 'noindex, follow',
    },
  },
  {
    path: 'auth/forgot',
    loadComponent: () =>
      import('./pages/auth/forgot/forgot.component').then((m) => m.ForgotComponent),
    data: {
      title: 'Reset password — More Dutch',
      description: 'Request a secure link to reset your More Dutch account password.',
      canonicalPath: '/auth/forgot',
      robots: 'noindex, follow',
    },
  },
  {
    path: 'auth/reset',
    loadComponent: () =>
      import('./pages/auth/reset/reset.component').then((m) => m.ResetComponent),
    data: {
      title: 'Choose new password — More Dutch',
      description: 'Set a new password for your More Dutch account.',
      canonicalPath: '/auth/reset',
      robots: 'noindex, follow',
    },
  },
  {
    path: 'auth/verify',
    loadComponent: () =>
      import('./pages/auth/verify/verify.component').then((m) => m.VerifyComponent),
    data: {
      title: 'Verify email — More Dutch',
      description: 'Confirm your email address to finish setting up your More Dutch account.',
      canonicalPath: '/auth/verify',
      robots: 'noindex, follow',
    },
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
    data: {
      title: 'My Profile — More Dutch',
      description: 'View your Dutch learning progress, quiz history, and mastery stats.',
      canonicalPath: '/profile',
      robots: 'noindex, follow',
    },
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
