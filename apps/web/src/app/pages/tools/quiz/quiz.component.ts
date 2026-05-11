import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ContentService } from '../../../core/content.service';
import { ProgressService } from '../../../core/progress.service';
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
  imports: [HelpDialogComponent, RouterLink],
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
          <span class="material-icons" style="color:var(--orange);">checklist</span>
          <h3 style="margin:0;">Comprehensive Testing</h3>
        </div>
        <p>
          Our grammar quiz covers everything from basic sentence structure to complex 
          prepositional phrases. It's the ultimate test of your Dutch foundations.
        </p>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--blue);">lightbulb</span>
          <h3 style="margin:0;">Learn from Mistakes</h3>
        </div>
        <p>
          Every question includes a <strong>detailed explanation</strong>. If you get an 
          answer wrong, take a moment to read <em>why</em>. This is often where the most 
          important learning happens!
        </p>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--green);">save</span>
          <h3 style="margin:0;">Track Your Growth</h3>
        </div>
        <p>
          Your quiz scores are saved to your profile and reflected in your 
          <strong>Admin Dashboard</strong>. Try to consistently score above 80% to ensure 
          you've truly mastered the grammar logic.
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

          @if (attemptSaved() === 'saved') {
            <div class="save-notice saved">
              <span class="material-icons">check_circle</span> Result saved to your profile.
            </div>
          } @else if (attemptSaved() === 'failed') {
            <div class="save-notice failed">
              <span class="material-icons">error_outline</span> Could not save result. Check your connection or try signing in again.
            </div>
          } @else if (attemptSaved() === 'anon') {
            <div class="save-notice anon">
              <span class="material-icons">lock_open</span>
              <span><a routerLink="/auth/login">Sign in</a> or <a routerLink="/auth/register">create an account</a> to save your results.</span>
            </div>
          }

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
      .save-notice {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: center;
        font-size: 0.88rem;
        padding: 0.6rem 1rem;
        border-radius: 10px;
        margin: 0.8rem auto 0;
        max-width: 400px;
      }
      .save-notice .material-icons { font-size: 1rem; }
      .save-notice.saved { background: #f0fff4; border: 1px solid #9ae6b4; color: #276749; }
      .save-notice.failed { background: #fff5f5; border: 1px solid #fed7d7; color: #c53030; }
      .save-notice.anon { background: var(--orange-bg); border: 1px solid var(--orange-border); color: var(--muted); }
      .save-notice.anon a { color: var(--orange); font-weight: 600; text-decoration: none; }
      .save-notice.anon a:hover { text-decoration: underline; }
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
  private readonly progress = inject(ProgressService);
  private readonly auth = inject(AuthService);
  private startTime = Date.now();

  protected readonly questions = toSignal(
    this.content.quiz() as unknown as import('rxjs').Observable<QuizQuestion[]>,
    { initialValue: [] as QuizQuestion[] },
  );

  protected readonly index = signal(0);
  protected readonly correct = signal(0);
  protected readonly picked = signal<number | null>(null);
  protected readonly finished = signal(false);
  protected readonly attemptSaved = signal<'saved' | 'failed' | 'anon' | null>(null);
  protected helpOpen = false;

  protected readonly current = computed(() => this.questions()[this.index()]);
  protected readonly progressPct = computed(() => {
    const total = this.questions().length;
    return total ? Math.round(((this.index() + 1) / total) * 100) : 0;
  });

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
      if (!this.auth.isAuthenticated()) {
        this.attemptSaved.set('anon');
        return;
      }
      this.progress.saveQuizAttempt({
        quizId: 'grammar',
        score: total > 0 ? this.correct() / total : 0,
        total,
        correct: this.correct(),
        durationMs: Date.now() - this.startTime,
      }).subscribe((ok) => this.attemptSaved.set(ok ? 'saved' : 'failed'));
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
    this.attemptSaved.set(null);
    this.startTime = Date.now();
  }
}
