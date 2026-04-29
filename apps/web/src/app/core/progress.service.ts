import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import type {
  ProgressMigrationDto,
  QuizAttemptDto,
  KnmAttemptDto,
  AttemptItem,
} from '@moredutch/shared';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

const HIDE_MASTERED_KEY = 'dgh_hide_mastered';
const VERBS_KEY = 'dgh_mastered_verbs';
const NOUNS_KEY = 'dgh_mastered_nouns';
const masteredKey = (slug: string) => `dgh_mastered_${slug}`;

interface MasteryState {
  [slug: string]: boolean;
}

/**
 * Mastery / preference progress.
 *
 * - Anonymous users: persist in localStorage exactly like the original site.
 * - Authenticated users: source of truth is `/api/progress/mastery`.
 * - On first authenticated bootstrap we one-shot push localStorage state up
 *   to the server (`migrateAnonymousProgress`) and then forget the local copy.
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly base = `${environment.apiBaseUrl}/progress`;

  private readonly _mastery = signal<MasteryState>(this.loadLocalMastery());
  private readonly _hideMastered = signal<boolean>(this.loadHideMastered());
  private readonly _masteredVerbs = signal<Set<string>>(new Set<string>());
  private readonly _masteredNouns = signal<Set<string>>(new Set<string>());

  readonly mastery = computed(() => this._mastery());
  readonly hideMastered = computed(() => this._hideMastered());
  readonly masteredCount = computed(() => Object.values(this._mastery()).filter(Boolean).length);
  readonly masteredVerbsCount = computed(() => this._masteredVerbs().size);
  readonly masteredNounsCount = computed(() => this._masteredNouns().size);

  constructor() {
    // Seed verb/noun signals from localStorage on startup
    this._masteredVerbs.set(this.readMasteredVerbs());
    this._masteredNouns.set(this.readMasteredNouns());

    effect(() => {
      if (!this.isBrowser) return;
      try {
        localStorage.setItem(HIDE_MASTERED_KEY, String(this._hideMastered()));
      } catch {
        /* ignore */
      }
    });
  }

  // ── Sheet mastery ─────────────────────────────────────────────────────────

  isMastered(slug: string): boolean {
    return !!this._mastery()[slug];
  }

  setMastered(slug: string, mastered: boolean): void {
    this._mastery.update((state) => ({ ...state, [slug]: mastered }));
    if (this.isBrowser) {
      try {
        if (mastered) {
          localStorage.setItem(masteredKey(slug), 'true');
        } else {
          localStorage.removeItem(masteredKey(slug));
        }
      } catch {
        /* ignore */
      }
    }
    if (this.auth.isAuthenticated()) {
      this.http
        .post(`${this.base}/mastery`, { sheetSlug: slug, mastered })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
  }

  toggleHideMastered(): void {
    this._hideMastered.update((v) => !v);
  }

  /** Pull server-side mastery for the just-logged-in user. */
  refreshFromServer(): Observable<MasteryState> {
    return this.http.get<MasteryState>(`${this.base}/mastery`).pipe(
      tap((state) => this._mastery.set(state ?? {})),
      catchError(() => of(this._mastery())),
    );
  }

  /** Push the localStorage cache up once after sign-in. */
  migrateAnonymousProgress(): Observable<void> {
    if (!this.isBrowser) return of(void 0);
    const masteredSlugs = Object.entries(this._mastery())
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (masteredSlugs.length === 0) return of(void 0);
    const dto: ProgressMigrationDto = { masteredSlugs };
    return this.http.post<void>(`${this.base}/migrate`, dto).pipe(
      tap(() => {
        try {
          for (const slug of masteredSlugs) localStorage.removeItem(masteredKey(slug));
        } catch {
          /* ignore */
        }
      }),
      catchError(() => of(void 0)),
    );
  }

  // ── Verb mastery ──────────────────────────────────────────────────────────

  readMasteredVerbs(): Set<string> {
    if (!this.isBrowser) return new Set();
    try {
      const raw = localStorage.getItem(VERBS_KEY);
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set();
    }
  }

  writeMasteredVerbs(ids: Set<string>): void {
    this._masteredVerbs.set(new Set(ids));
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(VERBS_KEY, JSON.stringify([...ids]));
    } catch {
      /* ignore */
    }
  }

  syncVerbs(ids: string[]): void {
    if (!this.auth.isAuthenticated()) return;
    this.http
      .post(`${this.base}/verbs/sync`, { masteredIds: ids })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  refreshVerbsFromServer(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/verbs`).pipe(
      tap((ids) => this.writeMasteredVerbs(new Set(ids ?? []))),
      catchError(() => of([] as string[])),
    );
  }

  // ── Noun mastery ──────────────────────────────────────────────────────────

  readMasteredNouns(): Set<string> {
    if (!this.isBrowser) return new Set();
    try {
      const raw = localStorage.getItem(NOUNS_KEY);
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set();
    }
  }

  writeMasteredNouns(ids: Set<string>): void {
    this._masteredNouns.set(new Set(ids));
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(NOUNS_KEY, JSON.stringify([...ids]));
    } catch {
      /* ignore */
    }
  }

  syncNouns(ids: string[]): void {
    if (!this.auth.isAuthenticated()) return;
    this.http
      .post(`${this.base}/nouns/sync`, { masteredIds: ids })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  refreshNounsFromServer(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/nouns`).pipe(
      tap((ids) => this.writeMasteredNouns(new Set(ids ?? []))),
      catchError(() => of([] as string[])),
    );
  }

  // ── Quiz / KNM attempts ───────────────────────────────────────────────────

  saveQuizAttempt(dto: QuizAttemptDto): Observable<boolean> {
    if (!this.auth.isAuthenticated()) return of(false);
    return this.http
      .post(`${this.base}/quiz-attempt`, dto)
      .pipe(
        map(() => true),
        catchError((err) => {
          console.error('[ProgressService] saveQuizAttempt failed', err);
          return of(false);
        }),
      );
  }

  saveKnmAttempt(dto: KnmAttemptDto): Observable<boolean> {
    if (!this.auth.isAuthenticated()) return of(false);
    return this.http
      .post(`${this.base}/knm-attempt`, dto)
      .pipe(
        map(() => true),
        catchError((err) => {
          console.error('[ProgressService] saveKnmAttempt failed', err);
          return of(false);
        }),
      );
  }

  getAttempts(): Observable<AttemptItem[]> {
    return this.http
      .get<AttemptItem[]>(`${this.base}/attempts`)
      .pipe(catchError(() => of([] as AttemptItem[])));
  }

  getStats(): Observable<{
    masteredSheets: number;
    masteredVerbs: number;
    masteredNouns: number;
    totalQuizAttempts: number;
    totalKnmAttempts: number;
  }> {
    return this.http
      .get<{
        masteredSheets: number;
        masteredVerbs: number;
        masteredNouns: number;
        totalQuizAttempts: number;
        totalKnmAttempts: number;
      }>(`${this.base}/stats`)
      .pipe(
        catchError(() =>
          of({
            masteredSheets: 0,
            masteredVerbs: 0,
            masteredNouns: 0,
            totalQuizAttempts: 0,
            totalKnmAttempts: 0,
          }),
        ),
      );
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private loadLocalMastery(): MasteryState {
    if (!this.isBrowser) return {};
    const out: MasteryState = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('dgh_mastered_')) continue;
        // Skip non-sheet keys (verbs/nouns stored separately)
        if (key === VERBS_KEY || key === NOUNS_KEY) continue;
        const slug = key.replace('dgh_mastered_', '');
        out[slug] = localStorage.getItem(key) === 'true';
      }
    } catch {
      /* ignore */
    }
    return out;
  }

  private loadHideMastered(): boolean {
    if (!this.isBrowser) return false;
    try {
      return localStorage.getItem(HIDE_MASTERED_KEY) === 'true';
    } catch {
      return false;
    }
  }
}
