import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import type { ProgressMigrationDto } from '@moredutch/shared';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

const HIDE_MASTERED_KEY = 'dgh_hide_mastered';
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

  readonly mastery = computed(() => this._mastery());
  readonly hideMastered = computed(() => this._hideMastered());
  readonly masteredCount = computed(() => Object.values(this._mastery()).filter(Boolean).length);

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      try {
        localStorage.setItem(HIDE_MASTERED_KEY, String(this._hideMastered()));
      } catch {
        /* ignore */
      }
    });
  }

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

  private loadLocalMastery(): MasteryState {
    if (!this.isBrowser) return {};
    const out: MasteryState = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('dgh_mastered_')) continue;
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
