import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin, map, type Observable } from 'rxjs';
import { AuthService } from '../../../core/auth.service';
import { ContentService } from '../../../core/content.service';
import { ProgressService } from '../../../core/progress.service';
import { HelpDialogComponent } from '../../../layout/help-dialog/help-dialog.component';

interface KnmQuestion {
  id: string;
  topic?: string;
  question: string;
  options: string[];
  correctIndex: number;
  answer?: string;
}

type ExamState = 'setup' | 'exam' | 'results';

@Component({
  selector: 'md-knm-exam',
  standalone: true,
  imports: [RouterLink, HelpDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero" style="border-bottom:none; padding-bottom:1rem;">
      <h1>
        KNM <em>Exam</em>
        <button class="help-trigger" type="button" title="How it works" (click)="helpOpen = true">
          <span class="material-icons">help_outline</span>
        </button>
      </h1>
      <p class="hero-desc">
        Kennis van de Nederlandse Maatschappij — Practice for the Dutch civics exam.
      </p>
    </div>

    <md-help-dialog [(visible)]="helpOpen" title="KNM <em>Exam Guide</em>">
      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--orange);">menu_book</span>
          <h3 style="margin:0;">The 10 Chapters</h3>
        </div>
        <p>
          The official KNM exam covers everything from <strong>Work & Income</strong> to 
          <strong>Healthcare</strong> and <strong>History</strong>. Our pool of questions is 
          balanced across all 10 official chapters to ensure full coverage.
        </p>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--blue);">timer</span>
          <h3 style="margin:0;">Exam Simulation</h3>
        </div>
        <p>
          The real DUO exam lasts 45 minutes and has ~40 questions. Practice with our 
          <strong>50-question</strong> mode to build the stamina and speed needed for the 
          actual test day.
        </p>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--green);">verified</span>
          <h3 style="margin:0;">What is a Pass?</h3>
        </div>
        <p>
          To pass the real exam, you generally need to answer at least <strong>26-28</strong> 
          questions correctly out of 40. Aim for a consistent <strong>75%</strong> on our 
          mock exams to be safe!
        </p>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--gold);">tips_and_updates</span>
          <h3 style="margin:0;">Pro Tip</h3>
        </div>
        <p>
          Don't just memorize answers. Try to understand the <em>Dutch context</em> behind 
          the questions. Many real exam questions use images or short videos — pay close 
          attention to our descriptive scenarios!
        </p>
      </div>
    </md-help-dialog>

    <div class="exam-content">
      @if (state() === 'setup') {
        <div class="setup-card">
          <span
            class="material-icons"
            style="font-size:3rem; color:var(--orange); margin-bottom:1rem; display:block;"
            >gavel</span
          >
          <h2>KNM Mock Exam</h2>
          <p>
            Test your knowledge of Dutch society. Questions are randomly selected from all 10
            chapters.
          </p>

          <div class="option-grid">
            @for (length of lengths; track length.value) {
              <button
                class="length-btn"
                type="button"
                [class.active]="selectedLength() === length.value"
                (click)="setLength(length.value)"
              >
                <span class="material-icons">{{ length.icon }}</span>
                <h3>{{ length.value }} Questions</h3>
                <p>{{ length.label }}</p>
              </button>
            }
          </div>

          <div style="margin-top:1.5rem;">
            <button class="start-btn" type="button" [disabled]="allQuestions().length === 0" (click)="startExam()">
              Start Practice Exam
              <span class="material-icons">play_arrow</span>
            </button>
          </div>
        </div>
      } @else if (state() === 'exam') {
        <div class="exam-ui">
          <div class="q-header">
            <div class="q-meta">Question {{ index() + 1 }} / {{ questions().length }}</div>
            <div class="q-meta">Score: {{ correct() }}</div>
          </div>

          <div class="progress-container">
            <div class="progress-fill" [style.width.%]="progressPct()"></div>
          </div>

          @if (current(); as q) {
            <div class="question-card">
              <div class="topic-tag">{{ q.topic || 'KNM' }}</div>
              <div class="question-text">{{ q.question }}</div>
              <div class="ans-grid">
                @for (option of q.options; track option; let i = $index) {
                  <button
                    type="button"
                    class="ans-btn"
                    [class.correct]="picked() !== null && isCorrectOption(i)"
                    [class.incorrect]="picked() === i && !isCorrectOption(i)"
                    [class.disabled]="picked() !== null"
                    (click)="pick(i)"
                  >
                    <span>{{ option }}</span>
                    @if (picked() !== null && isCorrectOption(i)) {
                      <span class="material-icons feedback-icon">check_circle</span>
                    } @else if (picked() === i && !isCorrectOption(i)) {
                      <span class="material-icons feedback-icon">cancel</span>
                    }
                  </button>
                }
              </div>
            </div>
          }

          <div class="footer-actions">
            @if (picked() !== null) {
              <button class="fc-btn active" type="button" (click)="nextQuestion()">
                {{ index() + 1 >= questions().length ? 'Finish Exam' : 'Next Question' }}
                <span class="material-icons">{{
                  index() + 1 >= questions().length ? 'check' : 'arrow_forward'
                }}</span>
              </button>
            }
          </div>
        </div>
      } @else {
        <div class="results-ui setup-card">
          <div class="score-circle">
            <div class="score-val">{{ resultPct() }}%</div>
            <div class="score-label">Result</div>
          </div>
          <div class="result-msg">{{ resultMessage() }}</div>
          <p>You answered {{ correct() }} out of {{ questions().length }} questions correctly.</p>

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

          <div class="result-actions">
            <button class="btn-primary" type="button" (click)="restart()">
              <span class="material-icons">refresh</span> Restart Practice
            </button>
            <a routerLink="/" class="btn-secondary">Back to Hub</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .exam-content {
        max-width: 800px;
        margin: 2rem auto;
        padding: 0 1rem;
      }
      .setup-card {
        background: var(--white);
        padding: 3rem 2rem;
        border-radius: 20px;
        border: 1.5px solid var(--border);
        text-align: center;
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
      }
      .setup-card h2 {
        font-family: 'Playfair Display', serif;
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--ink);
      }
      .setup-card p {
        color: var(--muted);
        margin: 0 auto 2rem;
        max-width: 500px;
        line-height: 1.6;
        font-size: 0.95rem;
      }
      .option-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.2rem;
        margin-bottom: 2rem;
      }
      .length-btn {
        padding: 1.2rem;
        border: 1.5px solid var(--border);
        border-radius: 12px;
        background: var(--white);
        cursor: pointer;
        transition: all 0.3s;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        color: var(--ink);
        font-family: inherit;
      }
      .length-btn:hover {
        border-color: var(--orange);
        transform: translateY(-5px);
        box-shadow: var(--shadow-sm);
      }
      .length-btn.active {
        border-color: var(--orange);
        background: var(--orange-bg);
      }
      .length-btn .material-icons {
        font-size: 1.8rem;
        color: var(--orange);
      }
      .length-btn h3 {
        margin: 0;
        font-size: 1rem;
        color: var(--ink);
      }
      .length-btn p {
        font-size: 0.75rem;
        color: var(--muted);
        line-height: 1.3;
        margin: 0;
      }
      .start-btn {
        padding: 1rem 2.5rem;
        font-size: 1rem;
        font-weight: 700;
        border-radius: 16px;
        background: var(--orange);
        color: white;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 8px 16px rgba(232, 80, 10, 0.2);
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        font-family: inherit;
      }
      .start-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px rgba(232, 80, 10, 0.3);
      }
      .start-btn:disabled {
        opacity: 0.6;
        cursor: wait;
      }
      .q-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      .q-meta {
        font-family: 'DM Mono', monospace;
        font-size: 0.75rem;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .exam-ui .progress-container {
        margin-bottom: 2rem;
        align-items: stretch;
      }
      .exam-ui .progress-fill {
        min-height: 22px;
      }
      .question-card {
        background: var(--white);
        padding: 2.5rem;
        border-radius: 20px;
        border: 1.5px solid var(--border);
        margin-bottom: 2rem;
        color: var(--ink);
        position: relative;
        overflow: hidden;
      }
      .topic-tag {
        position: absolute;
        top: 0;
        right: 0;
        padding: 0.5rem 1rem;
        background: var(--stripe);
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--muted);
        border-bottom-left-radius: 12px;
      }
      .question-text {
        font-size: 1.35rem;
        font-weight: 600;
        margin-bottom: 2rem;
        line-height: 1.4;
      }
      .ans-grid {
        display: grid;
        gap: 0.8rem;
      }
      .ans-btn {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.2rem;
        border: 1.5px solid var(--border);
        border-radius: 12px;
        background: var(--white);
        color: var(--ink);
        text-align: left;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 1rem;
        font-family: inherit;
      }
      .ans-btn:hover:not(.disabled) {
        border-color: var(--orange);
        background: var(--orange-bg);
      }
      .ans-btn.correct {
        border-color: var(--green);
        background: var(--green-light);
      }
      .ans-btn.incorrect {
        border-color: var(--red);
        background: var(--red-light);
      }
      .ans-btn.disabled {
        cursor: default;
      }
      .feedback-icon {
        margin-left: auto;
        font-size: 1.2rem;
      }
      .footer-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 1.5rem;
        min-height: 50px;
      }
      .score-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        border: 8px solid var(--orange);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto 2rem;
      }
      .score-val {
        font-family: 'Playfair Display', serif;
        font-size: 2.8rem;
        font-weight: 900;
        line-height: 1;
      }
      .score-label {
        font-size: 0.75rem;
        text-transform: uppercase;
        color: var(--muted);
        margin-top: 0.3rem;
        letter-spacing: 0.05em;
      }
      .result-msg {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--ink);
      }
      .save-notice {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: center;
        font-size: 0.88rem;
        padding: 0.65rem 1rem;
        border-radius: 10px;
        margin: 0 auto 1.2rem;
        max-width: 480px;
      }
      .save-notice .material-icons { font-size: 1rem; }
      .save-notice.saved { background: #f0fff4; border: 1px solid #9ae6b4; color: #276749; }
      .save-notice.failed { background: #fff5f5; border: 1px solid #fed7d7; color: #c53030; }
      .save-notice.anon { background: var(--orange-bg); border: 1px solid var(--orange-border); color: var(--muted); }
      .save-notice.anon a { color: var(--orange); font-weight: 600; text-decoration: none; }
      .save-notice.anon a:hover { text-decoration: underline; }

      .result-actions {
        display: flex;
        gap: 1.2rem;
        justify-content: center;
        margin: 1rem auto 0;
        width: 100%;
        max-width: 600px;
      }
      .btn-primary,
      .btn-secondary {
        padding: 1.2rem 2rem;
        border-radius: 16px;
        font-size: 1.1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        border: 2px solid transparent;
        font-family: 'DM Sans', sans-serif;
        text-decoration: none;
      }
      .btn-primary {
        background: var(--orange);
        color: white;
        flex: 2;
      }
      .btn-secondary {
        background: var(--white);
        color: var(--ink);
        border-color: var(--border);
        flex: 1;
      }
      @media (max-width: 600px) {
        .option-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .result-actions {
          flex-direction: column;
        }
        .btn-primary,
        .btn-secondary {
          width: 100%;
        }
      }
    `,
  ],
})
export class KnmExamComponent {
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressService);
  private readonly auth = inject(AuthService);
  private examStartTime = 0;
  protected readonly attemptSaved = signal<'saved' | 'failed' | 'anon' | null>(null);

  protected readonly lengths = [
    { value: 15, label: 'Quick drill', icon: 'bolt' },
    { value: 25, label: 'Standard session', icon: 'school' },
    { value: 50, label: 'Full simulation', icon: 'fitness_center' },
    { value: 75, label: 'Ultimate challenge', icon: 'emoji_events' },
  ] as const;

  private readonly chapters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
  protected readonly allQuestions = toSignal(
    forkJoin(
      this.chapters.map(
        (chapter) => this.content.knm(chapter) as Observable<KnmQuestion[]>,
      ),
    ).pipe(map((chapters) => chapters.flat().map((question) => this.normalizeQuestion(question)))),
    { initialValue: [] as KnmQuestion[] },
  );

  protected readonly selectedLength = signal(15);
  protected readonly state = signal<ExamState>('setup');
  protected readonly questions = signal<KnmQuestion[]>([]);
  protected readonly index = signal(0);
  protected readonly picked = signal<number | null>(null);
  protected readonly correct = signal(0);
  protected helpOpen = false;

  protected readonly current = computed(() => this.questions()[this.index()]);
  protected readonly progressPct = computed(() => {
    const total = this.questions().length;
    return total ? Math.round((this.index() / total) * 100) : 0;
  });
  protected readonly resultPct = computed(() => {
    const total = this.questions().length;
    return total ? Math.round((this.correct() / total) * 100) : 0;
  });
  protected readonly resultMessage = computed(() => {
    const percent = this.resultPct();
    if (percent >= 80) return 'Excellent! You are ready for the KNM exam.';
    if (percent >= 60) return 'Good job! You passed, but keep practicing.';
    return 'Keep studying. You need at least 60% to pass.';
  });

  setLength(length: number): void {
    this.selectedLength.set(length);
  }

  startExam(): void {
    const pool = this.shuffle(this.allQuestions());
    const length = Math.min(this.selectedLength(), pool.length);
    this.questions.set(pool.slice(0, length));
    this.index.set(0);
    this.picked.set(null);
    this.correct.set(0);
    this.examStartTime = Date.now();
    this.state.set('exam');
  }

  pick(optionIndex: number): void {
    if (this.picked() !== null) return;
    this.picked.set(optionIndex);
    if (this.isCorrectOption(optionIndex)) this.correct.update((value) => value + 1);
  }

  nextQuestion(): void {
    if (this.index() + 1 >= this.questions().length) {
      this.state.set('results');
      const total = this.questions().length;
      if (!this.auth.isAuthenticated()) {
        this.attemptSaved.set('anon');
        return;
      }
      this.progress.saveKnmAttempt({
        chapterId: 'mock-exam',
        score: total > 0 ? this.correct() / total : 0,
        total,
        correct: this.correct(),
        durationMs: Date.now() - this.examStartTime,
      }).subscribe((ok) => this.attemptSaved.set(ok ? 'saved' : 'failed'));
      return;
    }
    this.index.update((value) => value + 1);
    this.picked.set(null);
  }

  restart(): void {
    this.state.set('setup');
    this.questions.set([]);
    this.index.set(0);
    this.picked.set(null);
    this.correct.set(0);
    this.attemptSaved.set(null);
  }

  isCorrectOption(optionIndex: number): boolean {
    return this.current()?.correctIndex === optionIndex;
  }

  private normalizeQuestion(question: KnmQuestion): KnmQuestion {
    const correctIndex =
      typeof question.correctIndex === 'number' && question.correctIndex >= 0
        ? question.correctIndex
        : question.answer
          ? question.options.indexOf(question.answer)
          : 0;

    return {
      ...question,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    };
  }

  private shuffle<T>(items: T[]): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
}
