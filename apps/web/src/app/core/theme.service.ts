import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';

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

  private readonly _dark = signal<boolean>(this.readBool(DARK_KEY, false));
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
      try {
        localStorage.setItem(DARK_KEY, String(this._dark()));
      } catch {
        /* private mode — ignore */
      }
    });

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
    this._dark.update((v) => !v);
  }

  toggleFlashcard(): void {
    this._flashcard.update((v) => !v);
  }

  private readBool(key: string, fallback: boolean): boolean {
    if (!this.isBrowser) return fallback;
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : v === 'true';
    } catch {
      return fallback;
    }
  }
}
