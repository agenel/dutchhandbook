import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    data: {
      title: 'More Dutch — Interactive Dutch Grammar Hub & Cheat Sheets',
      description:
        'The ultimate interactive hub for Dutch learners. Master A1-B1 grammar with 15+ cheat sheets, verb explorers, flashcards, and drills.',
    },
  },
  {
    path: 'cheatsheets',
    loadComponent: () =>
      import('./pages/cheatsheets/cheatsheets.component').then((m) => m.CheatsheetsComponent),
    data: {
      title: 'Cheat Sheets — More Dutch',
      description: '15 interactive grammar cheat sheets covering A1 to B1 Dutch.',
    },
  },
  {
    path: 'help',
    loadComponent: () => import('./pages/help/help.component').then((m) => m.HelpComponent),
    data: {
      title: 'Learning Guide — More Dutch',
      description: 'How to get the most out of More Dutch — full learning guide.',
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
  },
  {
    path: 'tools/flashcards',
    loadComponent: () =>
      import('./pages/tools/flashcards/flashcards.component').then((m) => m.FlashcardsComponent),
  },
  {
    path: 'tools/de-het',
    loadComponent: () =>
      import('./pages/tools/de-het/de-het.component').then((m) => m.DeHetComponent),
  },
  {
    path: 'tools/quiz',
    loadComponent: () =>
      import('./pages/tools/quiz/quiz.component').then((m) => m.QuizComponent),
  },
  {
    path: 'tools/sentence-builder',
    loadComponent: () =>
      import('./pages/tools/sentence-builder/sentence-builder.component').then(
        (m) => m.SentenceBuilderComponent,
      ),
  },
  {
    path: 'tools/knm-exam',
    loadComponent: () =>
      import('./pages/tools/knm-exam/knm-exam.component').then((m) => m.KnmExamComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
    data: { title: 'Sign in — More Dutch' },
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),
    data: { title: 'Create account — More Dutch' },
  },
  {
    path: 'auth/forgot',
    loadComponent: () =>
      import('./pages/auth/forgot/forgot.component').then((m) => m.ForgotComponent),
    data: { title: 'Reset password — More Dutch' },
  },
  {
    path: 'auth/verify',
    loadComponent: () =>
      import('./pages/auth/verify/verify.component').then((m) => m.VerifyComponent),
    data: { title: 'Verify email — More Dutch' },
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
    data: { title: 'Profile — More Dutch' },
  },
  { path: '**', redirectTo: '' },
];
