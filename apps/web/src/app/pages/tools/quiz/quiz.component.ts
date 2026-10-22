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
  category?: string;
}

interface Topic {
  name: string;
  slug: string;
  count: number;
}

/** Topics with fewer questions than this only appear inside "Mixed". */
const MIN_TOPIC_SIZE = 4;
const MIXED = 'mixed';

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || MIXED;

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

@Component({
  selector: 'md-quiz',
  standalone: true,
  imports: [HelpDialogComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero">
      <h1>
        Grammar <em>Quiz</em>
        <button class="help-trigger" type="button" title="How it works" (click)="helpOpen = true">
          <span class="material-icons">help_outline</span>
        </button>
      </h1>
      <p class="hero-desc">
        Pick a topic and a set size. Instant feedback, explanations, and a review of what you missed.
      </p>
    </div>

    <md-help-dialog [(visible)]="helpOpen" title="Quiz <em>Guide</em>">
      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--orange);">checklist</span>
          <h3 style="margin:0;">Short, focused sets</h3>
        </div>
        <p>
          Choose one grammar topic, or <strong>Mixed</strong> for everything, and a set of 10, 20 or
          all questions. Each finished set counts as one attempt.
        </p>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--blue);">lightbulb</span>
          <h3 style="margin:0;">Learn from Mistakes</h3>
        </div>
        <p>
          Every question includes an explanation, and the results screen lists every question you
          missed with the right answer. Read <em>why</em> — that's where most of the learning happens.
        </p>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--green);">save</span>
          <h3 style="margin:0;">Track Your Growth</h3>
        </div>
        <p>
          When you're signed in, every finished set is saved to your profile. Aim to score above 80%
          on a topic before moving on.
        </p>
      </div>
    </md-help-dialog>

    @if (bank().length === 0) {
      <p style="text-align:center; color:var(--muted);">Loading questions…</p>
    } @else if (phase() === 'setup') {
      <section class="setup" aria-labelledby="quiz-topic-heading">
        <h2 id="quiz-topic-heading" class="setup-title">Choose a topic</h2>
        <div class="topic-grid" role="radiogroup" aria-labelledby="quiz-topic-heading">
          <button type="button" class="topic" role="radio"
            [attr.aria-checked]="topic() === 'mixed'" [class.active]="topic() === 'mixed'"
            (click)="topic.set('mixed')">
            <span class="topic-name">Mixed</span><span class="topic-count">{{ bank().length }}</span>
          </button>
          @for (t of topics(); track t.slug) {
            <button type="button" class="topic" role="radio"
              [attr.aria-checked]="topic() === t.slug" [class.active]="topic() === t.slug"
              (click)="topic.set(t.slug)">
              <span class="topic-name">{{ t.name }}</span><span class="topic-count">{{ t.count }}</span>
            </button>
          }
        </div>

        <h2 id="quiz-length-heading" class="setup-title">How many questions?</h2>
        <div class="length-row" role="radiogroup" aria-labelledby="quiz-length-heading">
          @for (n of lengthOptions(); track n.value) {
            <button type="button" class="length" role="radio"
              [attr.aria-checked]="length() === n.value" [class.active]="length() === n.value"
              (click)="length.set(n.value)">{{ n.label }}</button>
          }
        </div>

        <button type="button" class="start-btn" (click)="start()">
          Start {{ setSizeFor(topic(), length()) }} questions
          <span class="material-icons">play_arrow</span>
        </button>
      </section>
    } @else {
      <div class="set-meta">
        <span class="set-topic">{{ topicName() }}</span>
        <span class="counter">{{ index() + 1 }} / {{ set().length }}</span>
      </div>
      <div class="progress-container" style="margin-bottom:1rem;">
        <div class="progress-fill" [style.width.%]="progressPct()"></div>
      </div>

      @if (phase() === 'running' && current(); as q) {
        <h2 class="qtext">{{ q.question }}</h2>
        <div class="options">
          @for (opt of q.options; track $index; let i = $index) {
            <button
              type="button"
              class="option"
              [class.right]="picked() !== null && i === q.correctIndex"
              [class.wrong]="picked() === i && i !== q.correctIndex"
              [class.dim]="picked() !== null && i !== q.correctIndex && picked() !== i"
              [disabled]="picked() !== null"
              (click)="pick(i)"
            >
              <span class="opt-text">{{ opt }}</span>
              @if (picked() !== null && i === q.correctIndex) {
                <span class="material-icons opt-icon" aria-label="Correct answer">check_circle</span>
              } @else if (picked() === i) {
                <span class="material-icons opt-icon" aria-label="Your answer, incorrect">cancel</span>
              }
            </button>
          }
        </div>
        @if (picked() !== null && q.explanation) {
          <p class="explain">{{ q.explanation }}</p>
        }
        @if (picked() !== null) {
          <div class="next-container">
            <button type="button" class="fc-btn" (click)="next()">
              {{ index() + 1 >= set().length ? 'See results' : 'Next Question' }}
              <span class="material-icons" style="vertical-align:middle; font-size:1.2rem;">arrow_forward</span>
            </button>
          </div>
        }
      }

      @if (phase() === 'finished') {
        <div class="result">
          <h2>{{ topicName() }}: {{ correct() }} / {{ set().length }}</h2>
          <p class="result-pct" [class.good]="scorePct() >= 80">{{ scorePct() }}%</p>
          <p class="result-msg">
            @if (scorePct() >= 80) { Solid. You're ready to move on from this topic. }
            @else { Below the 80% target. Review the questions below, then try another set. }
          </p>

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
            <button type="button" class="fc-btn" (click)="retry()">Another {{ topicName() }} set</button>
            <button type="button" class="fc-btn ghost" (click)="backToSetup()">Change topic</button>
          </div>
        </div>

        @if (missed().length > 0) {
          <section class="review" aria-labelledby="quiz-review-heading">
            <h3 id="quiz-review-heading">Review: {{ missed().length }} missed</h3>
            <ol class="review-list">
              @for (m of missed(); track m.q.id) {
                <li class="review-item">
                  <p class="review-q">{{ m.q.question }}</p>
                  <p class="review-a"><span class="lbl wrong">Your answer</span> {{ m.q.options[m.pick] }}</p>
                  <p class="review-a"><span class="lbl right">Correct</span> {{ m.q.options[m.q.correctIndex] }}</p>
                  @if (m.q.explanation) { <p class="review-ex">{{ m.q.explanation }}</p> }
                </li>
              }
            </ol>
          </section>
        } @else {
          <p class="all-right">No mistakes in this set.</p>
        }
      }
    }
  `,
  styles: [
    `
      .setup { display: grid; gap: 1rem; }
      .setup-title {
        font-family: 'DM Mono', monospace;
        font-size: 0.78rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
        margin: 0.5rem 0 0;
      }
      .topic-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
        gap: 0.6rem;
      }
      .topic, .length {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 12px;
        padding: 0.8rem 1rem;
        font: inherit;
        color: var(--ink);
        cursor: pointer;
        text-align: left;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .topic:hover, .length:hover { border-color: var(--orange); box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
      .topic.active, .length.active { background: var(--orange-bg); border-color: var(--orange); font-weight: 600; }
      .topic:focus-visible, .length:focus-visible, .option:focus-visible, .start-btn:focus-visible {
        outline: 3px solid var(--orange);
        outline-offset: 2px;
      }
      .topic-count { font-family: 'DM Mono', monospace; font-size: 0.8rem; color: var(--muted); }
      .length-row { display: flex; gap: 0.6rem; flex-wrap: wrap; }
      .length { justify-content: center; min-width: 88px; }
      .start-btn {
        justify-self: start;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
        padding: 0.9rem 1.8rem;
        border: none;
        border-radius: 14px;
        background: var(--orange-fill);
        color: #fff;
        font: 700 1rem inherit;
        font-family: inherit;
        cursor: pointer;
      }

      .set-meta {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 1rem;
        margin-bottom: 0.5rem;
      }
      .set-topic { font-weight: 600; }
      .counter { font-family: 'DM Mono', monospace; color: var(--muted); }
      .qtext {
        font-family: 'Playfair Display', serif;
        font-size: 1.6rem;
        margin-bottom: 1rem;
        text-align: center;
      }
      .options { display: grid; gap: 0.6rem; margin-bottom: 1rem; }
      .option {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 12px;
        padding: 1rem 1.2rem;
        text-align: left;
        font-family: inherit;
        color: inherit;
        cursor: pointer;
        font-size: 1rem;
        transition: border-color 0.15s, box-shadow 0.15s, opacity 0.15s;
      }
      /* Hover only outlines and lifts; filled backgrounds are reserved for results. */
      .option:hover:not(:disabled) { border-color: var(--orange); box-shadow: 0 3px 12px rgba(0,0,0,0.08); }
      .option:disabled { cursor: default; }
      .option.right { border-color: var(--green); background: var(--green-light); color: var(--green); font-weight: 600; }
      .option.wrong { border-color: var(--red); background: var(--red-light); color: var(--red); font-weight: 600; }
      .option.dim { opacity: 0.55; }
      .opt-icon { font-size: 1.2rem; flex-shrink: 0; }
      .explain {
        background: var(--stripe);
        border: 1px dashed var(--border);
        padding: 1rem;
        border-radius: 12px;
        margin-bottom: 1rem;
      }
      .next-container { display: flex; justify-content: flex-end; margin-top: 1.5rem; }
      .result {
        text-align: center;
        padding: 2rem;
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 16px;
      }
      .result h2 { margin: 0 0 0.25rem; }
      .result-pct { font-family: 'Playfair Display', serif; font-size: 2.6rem; font-weight: 900; margin: 0; color: var(--red); }
      .result-pct.good { color: var(--green); }
      .result-msg { color: var(--muted); }
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
      .save-notice.saved { background: var(--green-light); border: 1px solid var(--green); color: var(--green); }
      .save-notice.failed { background: var(--red-light); border: 1px solid var(--red); color: var(--red); }
      .save-notice.anon { background: var(--orange-bg); border: 1px solid var(--orange-border); color: var(--muted); }
      .save-notice.anon a { color: var(--orange); font-weight: 600; text-decoration: none; }
      .save-notice.anon a:hover { text-decoration: underline; }
      .nav-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 1.5rem; }
      .fc-btn.ghost { background: transparent; }

      .review { margin-top: 1.5rem; }
      .review h3 { margin: 0 0 0.75rem; }
      .review-list { display: grid; gap: 0.75rem; padding-left: 1.25rem; margin: 0; }
      .review-item { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 0.9rem 1rem; }
      .review-q { font-weight: 600; margin: 0 0 0.4rem; }
      .review-a { margin: 0.15rem 0; }
      .review-ex { margin: 0.5rem 0 0; color: var(--muted); font-size: 0.92rem; }
      .lbl { display: inline-block; min-width: 96px; font-family: 'DM Mono', monospace; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; }
      .lbl.wrong { color: var(--red); }
      .lbl.right { color: var(--green); }
      .all-right { text-align: center; color: var(--green); font-weight: 600; margin-top: 1rem; }

      @media (max-width: 520px) {
        .qtext { font-size: 1.3rem; }
        .start-btn { justify-self: stretch; justify-content: center; }
      }
    `,
  ],
})
export class QuizComponent {
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressService);
  private readonly auth = inject(AuthService);
  private startTime = Date.now();

  protected readonly bank = toSignal(
    this.content.quiz() as unknown as import('rxjs').Observable<QuizQuestion[]>,
    { initialValue: [] as QuizQuestion[] },
  );

  protected readonly topics = computed<Topic[]>(() => {
    const counts = new Map<string, number>();
    for (const q of this.bank()) {
      const name = q.category?.trim();
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts.entries()]
      .filter(([, n]) => n >= MIN_TOPIC_SIZE)
      .map(([name, count]) => ({ name, slug: slugify(name), count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  protected readonly phase = signal<'setup' | 'running' | 'finished'>('setup');
  protected readonly topic = signal<string>(MIXED);
  protected readonly length = signal<number>(10); // 0 = all
  protected readonly set = signal<QuizQuestion[]>([]);
  protected readonly index = signal(0);
  protected readonly correct = signal(0);
  protected readonly picked = signal<number | null>(null);
  /** The learner's pick per question in the current set (null = unanswered). */
  private readonly picks = signal<(number | null)[]>([]);
  protected readonly attemptSaved = signal<'saved' | 'failed' | 'anon' | null>(null);
  protected helpOpen = false;

  protected readonly current = computed(() => this.set()[this.index()]);
  protected readonly progressPct = computed(() => {
    const total = this.set().length;
    const done = this.index() + (this.picked() !== null ? 1 : 0);
    return total ? Math.round((done / total) * 100) : 0;
  });
  protected readonly scorePct = computed(() => {
    const total = this.set().length;
    return total ? Math.round((this.correct() / total) * 100) : 0;
  });
  protected readonly topicName = computed(() => {
    const slug = this.topic();
    return slug === MIXED ? 'Mixed' : (this.topics().find((t) => t.slug === slug)?.name ?? 'Mixed');
  });
  protected readonly missed = computed(() =>
    this.set()
      .map((q, i) => ({ q, pick: this.picks()[i] }))
      .filter((m): m is { q: QuizQuestion; pick: number } => m.pick !== null && m.pick !== undefined && m.pick !== m.q.correctIndex),
  );
  protected readonly lengthOptions = computed(() => [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 0, label: `All (${this.poolFor(this.topic()).length})` },
  ]);

  private poolFor(slug: string): QuizQuestion[] {
    const bank = this.bank();
    return slug === MIXED ? bank : bank.filter((q) => q.category && slugify(q.category) === slug);
  }

  protected setSizeFor(slug: string, length: number): number {
    const n = this.poolFor(slug).length;
    return length === 0 ? n : Math.min(length, n);
  }

  start(): void {
    const pool = shuffle(this.poolFor(this.topic()));
    const size = this.setSizeFor(this.topic(), this.length());
    this.set.set(pool.slice(0, size));
    this.picks.set(new Array(size).fill(null));
    this.index.set(0);
    this.correct.set(0);
    this.picked.set(null);
    this.attemptSaved.set(null);
    this.startTime = Date.now();
    this.phase.set('running');
  }

  pick(i: number): void {
    const q = this.current();
    if (!q || this.picked() !== null) return;
    this.picked.set(i);
    this.picks.update((p) => p.map((v, idx) => (idx === this.index() ? i : v)));
    if (i === q.correctIndex) this.correct.update((v) => v + 1);
  }

  next(): void {
    const total = this.set().length;
    if (this.index() + 1 >= total) {
      this.finish();
      return;
    }
    this.index.update((i) => i + 1);
    this.picked.set(null);
  }

  private finish(): void {
    this.phase.set('finished');
    if (!this.auth.isAuthenticated()) {
      this.attemptSaved.set('anon');
      return;
    }
    const total = this.set().length;
    this.progress
      .saveQuizAttempt({
        quizId: this.topic(),
        score: total > 0 ? this.correct() / total : 0,
        total,
        correct: this.correct(),
        durationMs: Date.now() - this.startTime,
      })
      .subscribe((ok) => this.attemptSaved.set(ok ? 'saved' : 'failed'));
  }

  retry(): void {
    this.start();
  }

  backToSetup(): void {
    this.phase.set('setup');
    this.set.set([]);
    this.picked.set(null);
  }
}
