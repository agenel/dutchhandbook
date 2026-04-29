import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContentService } from '../../../core/content.service';
import { MetaService } from '../../../core/meta.service';
import { HelpDialogComponent } from '../../../layout/help-dialog/help-dialog.component';

interface SentenceChallenge {
  id: string;
  /** English meaning shown to learner. */
  english: string;
  /** Dutch words in the correct order. */
  words: string[];
  /** Optional rule label, e.g. "V2", "Inversion". */
  rule?: string;
}

@Component({
  selector: 'md-sentence-builder',
  standalone: true,
  imports: [HelpDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero" style="border-bottom:none; padding-bottom: 1rem;">
      <h1>
        Sentence<br /><em>Builder</em>
        <button class="help-trigger" type="button" title="How it works" (click)="helpOpen = true">
          <span class="material-icons">help_outline</span>
        </button>
      </h1>
      <p class="hero-desc">Master Dutch word order by assembling sentences block by block.</p>
    </div>

    <md-help-dialog [(visible)]="helpOpen" title="Sentence Builder <em>Guide</em>">
      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--orange);">bolt</span>
          <h3 style="margin:0;">Practice Mode</h3>
        </div>
        <p>
          Use this tool to convert your theoretical knowledge into rapid intuition. Practice until
          you don't have to think anymore!
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

    @if (current(); as c) {
      <div class="prompt">
        <div class="english">{{ c.english }}</div>
        @if (c.rule) {
          <div class="rule-tag">{{ c.rule }}</div>
        }
      </div>

      <div class="answer">
        @for (w of placed(); track w.idx) {
          <button type="button" class="word placed" (click)="unplace(w.idx)">{{ w.text }}</button>
        }
      </div>

      <div class="bank">
        @for (w of bank(); track w.idx) {
          <button type="button" class="word" (click)="place(w.idx)">{{ w.text }}</button>
        }
      </div>

      <div class="controls">
        <button type="button" class="fc-btn" (click)="reset()">Reset</button>
        <button
          type="button"
          class="fc-btn"
          (click)="check()"
          [disabled]="placed().length !== c.words.length"
        >Check</button>
      </div>

      @if (verdict() === 'right') {
        <p class="ok">Perfect — that's the V2-correct order.</p>
        <button type="button" class="fc-btn" (click)="nextChallenge()">
          Next sentence <span class="material-icons" style="vertical-align:middle; font-size:1.2rem;">arrow_forward</span>
        </button>
      } @else if (verdict() === 'wrong') {
        <p class="bad">Not quite. Re-read the rule and try again.</p>
      }
    } @else {
      <p style="text-align:center; color:var(--muted);">Loading challenges…</p>
    }
  `,
  styles: [
    `
      .prompt {
        text-align: center;
        margin: 1.5rem 0;
      }
      .english {
        font-family: 'Playfair Display', serif;
        font-size: 1.6rem;
      }
      .rule-tag {
        display: inline-block;
        background: var(--orange-bg);
        color: var(--orange);
        padding: 0.2rem 0.7rem;
        border-radius: 12px;
        font-size: 0.75rem;
        margin-top: 0.4rem;
      }
      .answer,
      .bank {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        justify-content: center;
        min-height: 70px;
        padding: 1rem;
        border-radius: 16px;
        margin-bottom: 1rem;
      }
      .answer {
        background: var(--orange-bg);
        border: 2px dashed var(--orange-border);
      }
      .bank {
        background: var(--white);
        border: 1.5px solid var(--border);
      }
      .word {
        background: var(--cream);
        border: 1.5px solid var(--border);
        border-radius: 10px;
        padding: 0.6rem 1rem;
        font-family: 'DM Sans', sans-serif;
        font-size: 1.05rem;
        cursor: pointer;
        color: inherit;
      }
      .word.placed {
        background: var(--orange);
        color: #fff;
        border-color: var(--orange);
      }
      .controls {
        display: flex;
        gap: 0.6rem;
        justify-content: center;
        margin-bottom: 1rem;
      }
      .ok {
        color: var(--green);
        text-align: center;
        font-weight: 600;
      }
      .bad {
        color: var(--red);
        text-align: center;
        font-weight: 600;
      }
    `,
  ],
})
export class SentenceBuilderComponent {
  private readonly content = inject(ContentService);

  protected readonly challenges = toSignal(
    this.content.sentences() as unknown as import('rxjs').Observable<SentenceChallenge[]>,
    { initialValue: [] as SentenceChallenge[] },
  );

  protected readonly index = signal(0);
  protected readonly placedIndices = signal<number[]>([]);
  protected readonly verdict = signal<null | 'right' | 'wrong'>(null);
  protected helpOpen = false;

  protected readonly current = computed<SentenceChallenge | undefined>(
    () => this.challenges()[this.index()],
  );

  protected readonly bank = computed(() => {
    const c = this.current();
    if (!c) return [];
    const placed = this.placedIndices();
    return this.shuffledWords(c).filter((w) => !placed.includes(w.idx));
  });

  protected readonly placed = computed(() => {
    const c = this.current();
    if (!c) return [];
    return this.placedIndices().map((idx) => ({ idx, text: c.words[idx] }));
  });

  constructor() {
    inject(MetaService).set({
      title: 'Sentence Builder — Master Dutch Word Order | More Dutch',
      description:
        'Master Dutch word order by assembling sentences block by block. V2, Inversion, and more.',
      canonicalPath: '/tools/sentence-builder',
    });
  }

  place(wordIndex: number): void {
    this.placedIndices.update((arr) => [...arr, wordIndex]);
  }

  unplace(wordIndex: number): void {
    this.placedIndices.update((arr) => arr.filter((i) => i !== wordIndex));
    this.verdict.set(null);
  }

  reset(): void {
    this.placedIndices.set([]);
    this.verdict.set(null);
  }

  check(): void {
    const c = this.current();
    if (!c) return;
    const ok =
      this.placedIndices().length === c.words.length &&
      this.placedIndices().every((idx, i) => idx === i);
    this.verdict.set(ok ? 'right' : 'wrong');
  }

  nextChallenge(): void {
    this.index.update((i) => (i + 1) % Math.max(this.challenges().length, 1));
    this.reset();
  }

  private shuffledWords(challenge: SentenceChallenge): { idx: number; text: string }[] {
    const words = challenge.words.map((text, idx) => ({ idx, text }));
    let seed = [...challenge.id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) || 1;
    return words
      .map((word) => {
        seed = (seed * 9301 + 49297) % 233280;
        return { word, sort: seed / 233280 };
      })
      .sort((a, b) => a.sort - b.sort)
      .map(({ word }) => word);
  }
}
