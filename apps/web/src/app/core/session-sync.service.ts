import { Injectable, inject } from '@angular/core';
import { Observable, defaultIfEmpty, forkJoin, of, switchMap, tap } from 'rxjs';
import { ProgressService } from './progress.service';
import { ThemeService } from './theme.service';

/**
 * Single source of truth for the work that must happen right after a session is
 * established — whether via first-load bootstrap, an interactive login, or a
 * registration. Previously the shell did the full sync (progress + preferences)
 * while login/register only did a partial one, so a user who signed in without
 * reloading kept stale dark-mode / hideMastered / mastery counts until the next
 * full page load.
 */
@Injectable({ providedIn: 'root' })
export class SessionSyncService {
  private readonly progress = inject(ProgressService);
  private readonly theme = inject(ThemeService);

  /**
   * Push anonymous localStorage progress up, then pull the authoritative server
   * state (progress, mastery counts, and preferences) back down and apply it.
   */
  syncAfterAuth(): Observable<void> {
    return this.progress.migrateAnonymousProgress().pipe(
      switchMap(() =>
        forkJoin([
          this.progress.refreshFromServer(),
          this.progress.refreshVerbsFromServer(),
          this.progress.refreshNounsFromServer(),
          this.progress.refreshCommonWordsFromServer(),
          this.progress.refreshPreferencesFromServer().pipe(
            tap((prefs) => this.applyPreferences(prefs)),
          ),
        ]),
      ),
      defaultIfEmpty([] as unknown[]),
      switchMap(() => of(void 0)),
    );
  }

  private applyPreferences(prefs: unknown): void {
    if (!prefs || typeof prefs !== 'object') return;
    const p = prefs as { darkMode?: boolean; flashcardMode?: boolean; hideMastered?: boolean };
    if (p.darkMode !== undefined) this.theme.setDark(!!p.darkMode);
    if (p.flashcardMode !== undefined) this.theme.setFlashcard(!!p.flashcardMode);
    if (p.hideMastered !== undefined) this.progress.applyHideMasteredFromServer(!!p.hideMastered);
  }
}
