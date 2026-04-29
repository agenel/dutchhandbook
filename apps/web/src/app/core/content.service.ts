import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { FlashcardDeck, Noun, Verb } from '@moredutch/shared';
import { Observable, shareReplay } from 'rxjs';

/**
 * Wraps fetches of the static JSON data assets that are bundled with the SPA.
 * Each call is `shareReplay(1)` cached so a deck/grid is downloaded once per
 * page lifetime and reused across components.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);

  private readonly cache = new Map<string, Observable<unknown>>();

  flashcards(): Observable<FlashcardDeck[]> {
    return this.cached<FlashcardDeck[]>('assets/data/flashcards.json');
  }

  verbs(): Observable<Verb[]> {
    return this.cached<Verb[]>('assets/data/verbs.json');
  }

  nouns(): Observable<Noun[]> {
    return this.cached<Noun[]>('assets/data/nouns.json');
  }

  quiz(): Observable<unknown> {
    return this.cached<unknown>('assets/data/quiz.json');
  }

  sentences(): Observable<unknown> {
    return this.cached<unknown>('assets/data/sentences.json');
  }

  knm(chapter: number): Observable<unknown> {
    return this.cached<unknown>(`assets/data/knm/ch${chapter}.json`);
  }

  knmIndex(): Observable<{ id: string; title: string }[]> {
    return this.cached<{ id: string; title: string }[]>('assets/data/knm/index.json');
  }

  private cached<T>(url: string): Observable<T> {
    let stream = this.cache.get(url) as Observable<T> | undefined;
    if (!stream) {
      stream = this.http.get<T>(url).pipe(shareReplay(1));
      this.cache.set(url, stream);
    }
    return stream;
  }
}
