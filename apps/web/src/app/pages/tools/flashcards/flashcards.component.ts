import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { FlashcardDeck } from '@moredutch/shared';
import { ContentService } from '../../../core/content.service';
import { MetaService } from '../../../core/meta.service';
import { HelpDialogComponent } from '../../../layout/help-dialog/help-dialog.component';

@Component({
  selector: 'md-flashcards',
  standalone: true,
  imports: [HelpDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!selectedDeck()) {
      <div class="hero" style="border-bottom:none; padding-bottom: 1rem;">
        <h1>
          Vocab<br /><em>Flashcards</em>
          <button class="help-trigger" type="button" title="How it works" (click)="helpOpen = true">
            <span class="material-icons">help_outline</span>
          </button>
        </h1>
        <p class="hero-desc">
          Choose a deck and start practicing. Spaced repetition made simple.
        </p>
      </div>
    }

    <md-help-dialog [(visible)]="helpOpen" title="Flashcards <em>Guide</em>">
      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--orange);">style</span>
          <h3 style="margin:0;">Digital Flashcards</h3>
        </div>
        <p>
          Classic active recall. See the Dutch word, think of the English translation, then reveal.
          Mark cards as known to shrink your deck.
        </p>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--blue);">trending_up</span>
          <h3 style="margin:0;">Build Muscle Memory</h3>
        </div>
        <p>
          This tool is designed for high-speed repetition. The goal is to reach a point where your
          choices are automatic.
        </p>
      </div>
    </md-help-dialog>

    @if (selectedDeck()) {
      <div class="study">
        <div class="study-header">
          <button class="btn-back" type="button" (click)="exit()">
            <span class="material-icons">arrow_back</span> Back to Decks
          </button>
          <h2 class="deck-name">{{ selectedDeck()!.category }}</h2>
        </div>

        <div class="flashcard-scene" (click)="flip()">
          <div class="flashcard" [class.is-flipped]="flipped()">
            <div class="flashcard-face front">
              <span class="face-label">Dutch</span>
              <div>{{ current().front }}</div>
            </div>
            <div class="flashcard-face back">
              <span class="face-label">English</span>
              <div>{{ current().back }}</div>
            </div>
          </div>
        </div>

        <p class="flip-hint" [style.opacity]="flipped() ? '0' : '1'">Click card to flip</p>

        <div class="study-controls" [class.active]="flipped()">
          <button class="btn-action btn-hard" type="button" (click)="rate(false)">
            <span class="material-icons">close</span> Hard (Study Again)
          </button>
          <button class="btn-action btn-easy" type="button" (click)="rate(true)">
            <span class="material-icons">done</span> Easy (Got it!)
          </button>
        </div>

        <div class="study-footer">
          <span class="card-counter">{{ index() + 1 }} / {{ selectedDeck()!.cards.length }}</span>
          <div class="progress-container">
            <div class="progress-fill" [style.width.%]="progressPct()"></div>
          </div>
        </div>
      </div>
    } @else {
      <div class="deck-grid">
        @for (deck of decks(); track deck.category) {
          <button type="button" class="deck-card" (click)="select(deck)">
            <div class="deck-icon"><span class="material-icons">{{ deck.icon }}</span></div>
            <h3>{{ deck.category }}</h3>
            <div class="deck-count">{{ deck.cards.length }} cards</div>
          </button>
        }
      </div>
    }
  `,
  styles: [
    `
      .deck-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1.2rem;
        margin-top: 1.5rem;
      }
      .deck-card {
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 16px;
        padding: 1.5rem;
        cursor: pointer;
        text-align: center;
        font-family: inherit;
        color: inherit;
        transition: all 0.2s;
      }
      .deck-card:hover {
        border-color: var(--orange);
        transform: translateY(-3px);
      }
      .deck-icon {
        font-size: 2.4rem;
        color: var(--orange);
        margin-bottom: 0.6rem;
      }
      .deck-count {
        font-size: 0.8rem;
        color: var(--muted);
        font-family: 'DM Mono', monospace;
      }
      .study {
        max-width: 800px;
        margin: 2rem auto;
        text-align: center;
      }
      .study-header {
        text-align: left;
      }
      .deck-name {
        font-family: 'DM Sans', sans-serif;
        font-size: 1.6rem;
        font-weight: 700;
        margin: 1rem 0 0.5rem;
        text-align: center;
      }
      .btn-back {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background: none;
        border: none;
        color: var(--muted);
        cursor: pointer;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
        padding: 0;
      }
      .btn-back:hover { color: var(--ink); }
      .card-counter {
        color: var(--muted);
        font-family: 'DM Mono', monospace;
        font-size: 0.8rem;
        white-space: nowrap;
      }
      .flashcard-scene {
        width: 100%;
        max-width: 450px;
        height: 300px;
        margin: 2rem auto;
        perspective: 1000px;
        cursor: pointer;
      }
      .flashcard {
        position: relative;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .flashcard.is-flipped {
        transform: rotateY(180deg);
      }
      .flashcard-face {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 24px;
        border: 2px solid var(--border);
        padding: 2rem;
        background: var(--white);
        box-shadow: var(--shadow-sm);
        font-family: 'Playfair Display', serif;
        font-size: 2.4rem;
        font-weight: 900;
      }
      .flashcard-face.back {
        transform: rotateY(180deg);
        background: #fafafa;
        font-family: 'DM Sans', sans-serif;
        font-size: 1.8rem;
        color: var(--ink);
      }
      [data-theme="dark"] .flashcard-face.back { background: #1e1e1e; }
      .face-label {
        position: absolute;
        top: 1.5rem;
        font-family: 'DM Mono', monospace;
        font-size: 0.6rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--muted);
      }
      .flip-hint {
        color: var(--muted);
        font-size: 0.9rem;
        transition: opacity 0.3s;
        margin: 0 0 0.5rem;
      }
      .study-controls {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
      }
      .study-controls.active {
        opacity: 1;
        pointer-events: all;
      }
      .btn-action {
        padding: 0.8rem 1.5rem;
        border-radius: 12px;
        border: none;
        cursor: pointer;
        font-family: 'DM Sans', sans-serif;
        font-weight: 600;
        font-size: 0.9rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
      }
      .btn-hard { background: #fee2e2; color: #991b1b; }
      .btn-easy { background: #dcfce7; color: #166534; }
      .btn-hard:hover { transform: translateY(-2px); background: #fecaca; }
      .btn-easy:hover { transform: translateY(-2px); background: #bbf7d0; }
      .study-footer {
        margin-top: 3rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .study-footer .progress-container {
        flex: 1;
        margin: 0 2rem;
        height: 8px;
      }
      @media (max-width: 640px) {
        .study-controls { flex-direction: column; }
        .btn-action { justify-content: center; width: 100%; }
        .study-footer { flex-direction: column; gap: 0.75rem; }
        .study-footer .progress-container { width: 100%; margin: 0; }
      }
    `,
  ],
})
export class FlashcardsComponent {
  private readonly content = inject(ContentService);

  protected readonly decks = toSignal(this.content.flashcards(), {
    initialValue: [] as FlashcardDeck[],
  });

  protected readonly selectedDeck = signal<FlashcardDeck | null>(null);
  protected readonly index = signal(0);
  protected readonly flipped = signal(false);
  protected helpOpen = false;

  protected readonly current = computed(() => {
    const d = this.selectedDeck();
    return d ? d.cards[this.index()] : { front: '', back: '' };
  });
  protected readonly progressPct = computed(() => {
    const deck = this.selectedDeck();
    return deck ? Math.round(((this.index() + 1) / deck.cards.length) * 100) : 0;
  });

  constructor() {
    inject(MetaService).set({
      title: 'Dutch Vocabulary Flashcards — Learn Fast | More Dutch',
      description:
        'Master essential Dutch vocabulary with interactive flashcards. Categories include numbers, colors, clothing, and house items.',
      canonicalPath: '/tools/flashcards',
    });
  }

  select(deck: FlashcardDeck): void {
    this.selectedDeck.set(deck);
    this.index.set(0);
    this.flipped.set(false);
  }

  exit(): void {
    this.selectedDeck.set(null);
    this.index.set(0);
  }

  flip(): void {
    this.flipped.update((v) => !v);
  }

  rate(_easy: boolean): void {
    const deck = this.selectedDeck();
    if (!deck) return;
    const current = this.index();
    if (current < deck.cards.length - 1) {
      this.index.set(current + 1);
      this.flipped.set(false);
    } else {
      alert('Deck completed! Well done.');
      this.exit();
    }
  }
}
