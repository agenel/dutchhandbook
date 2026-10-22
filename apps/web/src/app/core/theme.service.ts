import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { ProgressService } from './progress.service';

const DARK_KEY = 'dgh_dark_mode';
const FLASHCARD_KEY = 'dgh_flashcard_mode';

/**
 * App-wide theme controller.
 * Mirrors the original `js/main.js` behavior so the visual contract
 * (dark mode + flashcard blur) is byte-identical with the static site.
 *
 * SSR-safe: all storage / DOM access is gated behind `isPlatformBrowser`.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly progress = inject(ProgressService);

  /** True once the visitor (or their saved server preference) picked a theme.
   *  Until then we follow the device's light/dark setting and save nothing. */
  private explicitTheme = this.readStored(DARK_KEY) !== null;
  private readonly _dark = signal<boolean>(this.initialDark());
  private readonly _flashcard = signal<boolean>(false);

  readonly dark = computed(() => this._dark());
  readonly flashcard = computed(() => this._flashcard());

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      const html = this.document.documentElement;
      if (this._dark()) {
        html.setAttribute('data-theme', 'dark');
      } else {
        html.removeAttribute('data-theme');
      }
      if (!this.explicitTheme) return;
      try {
        localStorage.setItem(DARK_KEY, String(this._dark()));
      } catch {
        /* private mode — ignore */
      }
    });

    // Track OS theme changes until the visitor chooses one themselves.
    if (this.isBrowser && typeof matchMedia === 'function') {
      matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', (e) => {
        if (!this.explicitTheme) this._dark.set(e.matches);
      });
    }

    effect(() => {
      if (!this.isBrowser) return;
      const body = this.document.body;
      body.classList.toggle('flashcard-mode', this._flashcard());
      try {
        localStorage.setItem(FLASHCARD_KEY, String(this._flashcard()));
      } catch {
        /* ignore */
      }
    });
  }

  toggleDark(): void {
    this.explicitTheme = true;
    this._dark.update((v) => !v);
    if (this.isBrowser) {
      this.progress.patchPreferences({ darkMode: this._dark() }).subscribe();
    }
  }

  /** Replace dark mode (e.g. after loading server preferences). */
  setDark(value: boolean): void {
    this.explicitTheme = true;
    this._dark.set(value);
  }

  toggleFlashcard(): void {
    this._flashcard.update((v) => !v);
    if (this.isBrowser) {
      this.progress.patchPreferences({ flashcardMode: this._flashcard() }).subscribe();
    }
  }

  /** Replace flashcard blur mode (server preferences). */
  setFlashcard(value: boolean): void {
    this._flashcard.set(value);
  }

  /** Saved choice if there is one, otherwise the device's color-scheme setting. */
  private initialDark(): boolean {
    const stored = this.readStored(DARK_KEY);
    if (stored !== null) return stored === 'true';
    return this.isBrowser && typeof matchMedia === 'function'
      ? matchMedia('(prefers-color-scheme: dark)').matches
      : false;
  }

  private readStored(key: string): string | null {
    if (!this.isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
}
