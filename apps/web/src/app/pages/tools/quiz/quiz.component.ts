import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContentService } from '../../../core/content.service';
import { MetaService } from '../../../core/meta.service';
import { HelpDialogComponent } from '../../../layout/help-dialog/help-dialog.component';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

@Component({
  selector: 'md-quiz',
  standalone: true,
  imports: [HelpDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero" style="border-bottom:none; padding-bottom: 1rem;">
      <h1>
        Grammar<br /><em>Quiz</em>
        <button class="help-trigger" type="button" title="How it works" (click)="helpOpen = true">
          <span class="material-icons">help_outline</span>
        </button>
      </h1>
      <p class="hero-desc">
        Put your Dutch knowledge to the test. Instant feedback and explanations included.
      </p>
    </div>

    <md-help-dialog [(visible)]="helpOpen" title="Quiz <em>Guide</em>">
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

    @if (questions().length > 0) {
      <div class="progress-container" style="margin-bottom:0.5rem;">
        <div class="progress-fill" [style.width.%]="progressPct()"></div>
      </div>
      <div class="counter">{{ index() + 1 }} / {{ questions().length }}</div>

      @if (!finished() && current(); as q) {
        <h2 class="qtext">{{ q.question }}</h2>
        <div class="options">
          @for (opt of q.options; track opt; let i = $index) {
            <button
              type="button"
              class="option"
              [class.right]="picked() !== null && i === q.correctIndex"
              [class.wrong]="picked() === i && i !== q.correctIndex"
              [disabled]="picked() !== null"
              (click)="pick(i)"
            >
              {{ opt }}
            </button>
          }
        </div>
        @if (picked() !== null && q.explanation) {
          <p class="explain">{{ q.explanation }}</p>
        }
        @if (picked() !== null) {
          <div class="next-container">
            <button type="button" class="fc-btn" (click)="next()">
              {{ index() + 1 >= questions().length ? 'Finish' : 'Next Question' }}
              <span class="material-icons" style="vertical-align:middle; font-size:1.2rem;">arrow_forward</span>
            </button>
          </div>
        }
      }

      @if (finished()) {
        <div class="result">
          <h2>Quiz finished</h2>
          <p>You scored {{ correct() }} / {{ questions().length }}.</p>
          <div class="nav-btns">
            <button type="button" class="fc-btn" (click)="restart()">Try Again</button>
          </div>
        </div>
      }
    } @else {
      <p style="text-align:center; color:var(--muted);">Loading questions…</p>
    }
  `,
  styles: [
    `
      .counter {
        text-align: center;
        font-family: 'DM Mono', monospace;
        color: var(--muted);
        margin: 0.5rem 0 1rem;
      }
      .qtext {
        font-family: 'Playfair Display', serif;
        font-size: 1.6rem;
        margin-bottom: 1rem;
        text-align: center;
      }
      .options {
        display: grid;
        gap: 0.6rem;
        margin-bottom: 1rem;
      }
      .option {
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 12px;
        padding: 1rem 1.2rem;
        text-align: left;
        font-family: inherit;
        color: inherit;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s;
      }
      .option:hover:not(:disabled) {
        border-color: var(--orange);
      }
      .option.right {
        border-color: var(--green);
        background: var(--green-light);
        color: var(--green);
      }
      .option.wrong {
        border-color: var(--red);
        background: var(--red-light);
        color: var(--red);
      }
      .explain {
        background: var(--stripe);
        border: 1px dashed var(--border);
        padding: 1rem;
        border-radius: 12px;
        margin-bottom: 1rem;
      }
      .next-container {
        display: flex;
        justify-content: flex-end;
        margin-top: 1.5rem;
      }
      .result {
        text-align: center;
        padding: 2rem;
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 16px;
      }
      .nav-btns {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1.5rem;
      }
    `,
  ],
})
export class QuizComponent {
  private readonly content = inject(ContentService);

  protected readonly questions = toSignal(
    this.content.quiz() as unknown as import('rxjs').Observable<QuizQuestion[]>,
    { initialValue: [] as QuizQuestion[] },
  );

  protected readonly index = signal(0);
  protected readonly correct = signal(0);
  protected readonly picked = signal<number | null>(null);
  protected readonly finished = signal(false);
  protected helpOpen = false;

  protected readonly current = computed(() => this.questions()[this.index()]);
  protected readonly progressPct = computed(() => {
    const total = this.questions().length;
    return total ? Math.round(((this.index() + 1) / total) * 100) : 0;
  });

  constructor() {
    inject(MetaService).set({
      title: 'Dutch Grammar Quiz — More Dutch',
      description:
        'Test your knowledge of Dutch grammar with interactive quizzes linked to our cheat sheets.',
      canonicalPath: '/tools/quiz',
    });
  }

  pick(i: number): void {
    const q = this.current();
    if (!q || this.picked() !== null) return;
    this.picked.set(i);
    if (i === q.correctIndex) this.correct.update((v) => v + 1);
  }

  next(): void {
    const total = this.questions().length;
    if (this.index() + 1 >= total) {
      this.finished.set(true);
      return;
    }
    this.index.update((i) => i + 1);
    this.picked.set(null);
  }

  restart(): void {
    this.index.set(0);
    this.correct.set(0);
    this.picked.set(null);
    this.finished.set(false);
  }
}
