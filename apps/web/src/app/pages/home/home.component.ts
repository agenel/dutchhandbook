import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SHEET_REGISTRY, TOOL_REGISTRY, type AttemptItem } from '@moredutch/shared';
import { AuthService } from '../../core/auth.service';
import { ProgressService } from '../../core/progress.service';
import { HelpDialogComponent } from '../../layout/help-dialog/help-dialog.component';

@Component({
  selector: 'md-home',
  standalone: true,
  imports: [RouterLink, HelpDialogComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .start-here { margin: 0.25rem 0 2rem; }
      .start-kicker {
        display: inline-block;
        font-size: 0.78rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--orange);
        font-weight: 700;
        margin-bottom: 1rem;
      }
      .path-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.2rem;
      }
      .path-card {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.55rem;
        padding: 1.6rem;
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 18px;
        text-decoration: none;
        color: var(--ink);
        transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .path-card:hover {
        transform: translateY(-3px);
        border-color: var(--orange-border);
        box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
      }
      .path-card h3 { margin: 0; font-size: 1.15rem; line-height: 1.2; }
      .path-card p {
        margin: 0;
        color: var(--muted);
        font-size: 0.9rem;
        line-height: 1.5;
        flex: 1;
      }
      .path-icon {
        font-size: 1.7rem;
        color: var(--orange);
        background: var(--orange-bg);
        border-radius: 12px;
        padding: 0.5rem;
      }
      .path-cta {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        color: var(--orange);
        font-weight: 600;
        font-size: 0.9rem;
        margin-top: 0.3rem;
      }
      .path-cta .material-icons { font-size: 1.1rem; }
      .path-featured {
        border-color: var(--orange-border);
        background: linear-gradient(180deg, var(--orange-bg), var(--white) 70%);
      }
      .hero-desc { font-size: 1rem; color: var(--ink); line-height: 1.55; }
      .start-kicker { margin: 0 0 1rem; font-family: inherit; }

      .welcome {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
        gap: 1.5rem;
        align-items: center;
        padding: 1.5rem 1.6rem;
        margin: 0.5rem 0 2.5rem;
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 18px;
      }
      .welcome h2 { margin: 0 0 0.4rem; font-size: 1.45rem; }
      .welcome p { margin: 0 0 1rem; color: var(--muted); }
      .welcome p strong { color: var(--ink); }
      .welcome-actions { display: flex; flex-wrap: wrap; gap: 0.6rem; }
      .w-btn {
        display: inline-flex; align-items: center; min-height: 44px;
        padding: 0.55rem 1rem; border-radius: 12px; font-weight: 600; font-size: 0.92rem;
        text-decoration: none; color: var(--ink); border: 1.5px solid var(--border);
        background: var(--cream);
      }
      .w-btn:hover { border-color: var(--orange-border); }
      .w-primary { background: var(--orange-fill); border-color: var(--orange-fill); color: #fff; }
      .w-primary:hover { filter: brightness(1.08); }
      .welcome-stats {
        display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; margin: 0;
      }
      .welcome-stats div {
        background: var(--stripe); border: 1px solid var(--border); border-radius: 12px; padding: 0.7rem 0.9rem;
      }
      .welcome-stats dt { font-size: 0.78rem; color: var(--muted); }
      .welcome-stats dd {
        margin: 0.15rem 0 0; font-size: 1.35rem; font-weight: 700; color: var(--ink);
        font-variant-numeric: tabular-nums;
      }

      @media (max-width: 900px) {
        .welcome { grid-template-columns: 1fr; }
      }
      /* Phones: goal cards become compact rows so all three fit on one screen. */
      @media (max-width: 600px) {
        .path-card {
          display: grid;
          grid-template-columns: auto 1fr;
          column-gap: 0.85rem;
          row-gap: 0.15rem;
          padding: 1rem 1.1rem;
          align-items: center;
        }
        .path-card .path-icon { grid-row: span 2; font-size: 1.4rem; }
        .path-card p { display: none; }
        .path-card .path-cta { margin-top: 0; }
      }
      @media (max-width: 900px) {
        .path-grid { grid-template-columns: 1fr; }
      }
    `,
  ],
  template: `
    <div class="hero">
      <div class="hero-layout">
        <div class="hero-title">
          <h1>
            Dutch <em>Language</em> Hub
            <button
              class="help-trigger"
              type="button"
              title="How it works"
              (click)="helpOpen = true"
            >
              <span class="material-icons">help_outline</span>
            </button>
          </h1>
        </div>
        <div class="hero-content">
          <p class="hero-desc">
            Everything you need to learn Dutch and pass your inburgering exam — grammar
            cheat sheets, KNM practice exams, and interactive drills, all in one place.
          </p>
          <div class="hero-pills">
            <div class="pill">KNM Exam Prep</div>
            <div class="pill">{{ total }} Cheat Sheets</div>
            <div class="pill">A1 — B1</div>
          </div>
        </div>
      </div>
    </div>

    @if (auth.isAuthenticated()) {
      <section class="welcome" aria-labelledby="welcome-title">
        <div class="welcome-main">
          <h2 id="welcome-title">Welcome back{{ firstName() ? ', ' + firstName() : '' }}</h2>
          @if (lastAttempt(); as a) {
            <p>
              Last session: <strong>{{ a.tool === 'knm' ? 'KNM exam' : 'Grammar quiz' }}</strong>,
              {{ pct(a.score) }}% ({{ a.correct }} of {{ a.total }}) on {{ a.createdAt | date: 'd MMM' }}.
            </p>
          } @else {
            <p>Your progress is saved to your account. Take a KNM practice exam to see your score here.</p>
          }
          <div class="welcome-actions">
            <a class="w-btn w-primary" [routerLink]="lastAttempt()?.tool === 'quiz' ? '/tools/quiz' : '/tools/knm-exam'">
              {{ lastAttempt() ? 'Practice again' : 'Start a KNM exam' }}
            </a>
            @if (nextSheet(); as s) {
              <a class="w-btn" [routerLink]="['/sheets', s.slug]">Next cheat sheet: {{ s.title }}</a>
            }
          </div>
        </div>
        <dl class="welcome-stats">
          <div><dt>Cheat sheets</dt><dd>{{ mastered() }}/{{ total }}</dd></div>
          <div><dt>Verbs</dt><dd>{{ progress.masteredVerbsCount() }}</dd></div>
          <div><dt>Nouns</dt><dd>{{ progress.masteredNounsCount() }}</dd></div>
          <div><dt>Words</dt><dd>{{ progress.masteredCommonWordsCount() }}</dd></div>
        </dl>
      </section>
    }

    <section class="start-here" aria-labelledby="start-title">
      <h2 class="start-kicker" id="start-title">{{ auth.isAuthenticated() ? 'Practice by goal' : 'New here? Pick your goal' }}</h2>
      <div class="path-grid">
        <a routerLink="/tools/knm-exam" class="path-card path-featured">
          <span class="material-icons path-icon">workspace_premium</span>
          <h3>Pass the inburgering exam</h3>
          <p>Realistic KNM mock exams across all 10 topics, with instant feedback and scoring.</p>
          <span class="path-cta">Start exam prep <span class="material-icons">arrow_forward</span></span>
        </a>
        <a routerLink="/cheatsheets" class="path-card">
          <span class="material-icons path-icon">menu_book</span>
          <h3>Learn the grammar</h3>
          <p>{{ total }} clear A1–B1 cheat sheets that break Dutch grammar down one rule at a time.</p>
          <span class="path-cta">Browse cheat sheets <span class="material-icons">arrow_forward</span></span>
        </a>
        <a routerLink="/tools/flashcards" class="path-card">
          <span class="material-icons path-icon">style</span>
          <h3>Build your vocabulary</h3>
          <p>Spaced-repetition flashcards and the most common Dutch words, grouped by topic.</p>
          <span class="path-cta">Practice words <span class="material-icons">arrow_forward</span></span>
        </a>
      </div>
    </section>

    <md-help-dialog [(visible)]="helpOpen" title="Hub <em>Dashboard</em>">
      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--orange);">dashboard</span>
          <h3 style="margin:0;">Welcome to More Dutch</h3>
        </div>
        <p>
          Pick a goal to start: KNM exam practice, grammar cheat sheets, or vocabulary. Every
          practice tool is listed further down the page.
        </p>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--green);">trending_up</span>
          <h3 style="margin:0;">Your progress</h3>
        </div>
        <p>
          With a free account, your exam scores and everything you mark as
          <strong>Mastered</strong> are saved and shown at the top of this page.
        </p>
        <div style="background:var(--stripe); padding:1rem; border-radius:12px; border:1px solid var(--border); margin-top:0.5rem;">
          <div class="color-block"><div class="cb-dot" style="background:var(--orange)"></div><span><strong>Orange</strong>: A1 Beginner</span></div>
          <div class="color-block"><div class="cb-dot" style="background:var(--green)"></div><span><strong>Green</strong>: A2 Elementary</span></div>
          <div class="color-block"><div class="cb-dot" style="background:var(--blue)"></div><span><strong>Blue</strong>: B1 Intermediate</span></div>
        </div>
      </div>

    </md-help-dialog>

    @if (!auth.isAuthenticated()) {
      <div class="progress-signin-nudge">
        <span class="material-icons">lock_open</span>
        <span>
          Save your exam scores and progress across devices:
          <a routerLink="/auth/register">create a free account</a> or
          <a routerLink="/auth/login">sign in</a>.
        </span>
      </div>
    }

    <div class="section-title" id="tools" role="heading" aria-level="2">
      All practice tools
      <div class="title-line"></div>
    </div>

    <div class="tools-grid">
      @for (tool of tools; track tool.slug) {
        <a [routerLink]="['/tools', tool.slug]" class="tool-card">
          <div class="tool-icon" [attr.aria-label]="tool.title + ' Icon'">
            <span class="material-icons">{{ tool.icon }}</span>
          </div>
          <div class="tool-info">
            <h3>{{ tool.title }}</h3>
            <p>{{ tool.description }}</p>
          </div>
          <div class="tool-tag">{{ tool.tag }}</div>
        </a>
      }
    </div>
  `,
})
export class HomeComponent {
  protected readonly progress = inject(ProgressService);
  protected readonly auth = inject(AuthService);
  protected readonly tools = TOOL_REGISTRY;

  protected readonly total = SHEET_REGISTRY.length;
  protected readonly mastered = computed(() => this.progress.masteredCount());

  private readonly attempts = signal<AttemptItem[]>([]);
  protected readonly lastAttempt = computed(() =>
    [...this.attempts()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null,
  );
  /** First cheat sheet (registry order = suggested order) not yet mastered. */
  protected readonly nextSheet = computed(() => {
    this.progress.mastery(); // re-evaluate when mastery changes
    return SHEET_REGISTRY.find((s) => !this.progress.isMastered(s.slug)) ?? null;
  });
  protected readonly firstName = computed(() => {
    const name = this.auth.user()?.displayName?.trim();
    return name ? name.split(/\s+/)[0] : null;
  });

  protected helpOpen = false;

  constructor() {
    // Load the returning user's last session once the session is known.
    let loaded = false;
    effect(() => {
      if (!this.auth.isAuthenticated() || loaded) return;
      loaded = true;
      this.progress.getAttempts().subscribe((items) => this.attempts.set(items));
    });
  }

  protected pct(score: number): number {
    // Attempt scores are stored as a 0–1 fraction.
    return Math.round((score <= 1 ? score * 100 : score));
  }
}
