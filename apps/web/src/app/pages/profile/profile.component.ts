import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import type { AttemptItem } from '@moredutch/shared';
import { AuthService } from '../../core/auth.service';
import { ProgressService } from '../../core/progress.service';

@Component({
  selector: 'md-profile',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (auth.user(); as user) {
      <div class="profile-shell">
        <!-- Header -->
        <div class="profile-header">
          <div class="avatar">{{ initials(user.displayName ?? user.email) }}</div>
          <div class="profile-info">
            <h1>{{ user.displayName ?? user.email }}</h1>
            <p class="profile-email">
              {{ user.email }}
              @if (user.emailVerified) {
                <span class="badge verified">
                  <span class="material-icons">verified</span> Verified
                </span>
              } @else {
                <span class="badge unverified">Not verified</span>
              }
            </p>
          </div>
        </div>

        <!-- Stats row -->
        <div class="section-title">Progress Overview <div class="title-line"></div></div>
        <div class="stats-row">
          <div class="stat">
            <div class="stat-num">{{ progress.masteredCount() }}<span class="stat-denom">/15</span></div>
            <div class="stat-label">Sheets Mastered</div>
          </div>
          <div class="stat">
            <div class="stat-num">{{ progress.masteredVerbsCount() }}</div>
            <div class="stat-label">Verbs Mastered</div>
          </div>
          <div class="stat">
            <div class="stat-num">{{ progress.masteredNounsCount() }}</div>
            <div class="stat-label">Nouns Mastered</div>
          </div>
          <div class="stat">
            <div class="stat-num">{{ (stats()?.totalQuizAttempts ?? 0) + (stats()?.totalKnmAttempts ?? 0) }}</div>
            <div class="stat-label">Total Attempts</div>
          </div>
        </div>

        <!-- Attempts table -->
        <div class="section-title" style="margin-top:2rem;">Recent Attempts <div class="title-line"></div></div>
        @if (attempts().length > 0) {
          <div class="attempts-table">
            <div class="attempts-head">
              <span>Tool</span>
              <span>Score</span>
              <span>Correct</span>
              <span>Duration</span>
              <span>Date</span>
            </div>
            @for (a of attempts(); track a.id) {
              <div class="attempt-row">
                <span>
                  <span class="tool-badge" [class.quiz]="a.tool === 'quiz'" [class.knm]="a.tool === 'knm'">
                    {{ a.tool === 'quiz' ? 'Quiz' : 'KNM Exam' }}
                  </span>
                </span>
                <span class="score-pct" [class.good]="a.score >= 0.6" [class.bad]="a.score < 0.6">
                  {{ (a.score * 100).toFixed(0) }}%
                </span>
                <span class="mono">{{ a.correct }} / {{ a.total }}</span>
                <span class="mono">{{ formatDuration(a.durationMs) }}</span>
                <span class="muted-text">{{ formatDate(a.createdAt) }}</span>
              </div>
            }
          </div>
        } @else {
          <p class="empty-state">No attempts yet. Try the <a routerLink="/tools/quiz">Grammar Quiz</a> or <a routerLink="/tools/knm-exam">KNM Exam</a>!</p>
        }

        <!-- Actions -->
        <div class="actions">
          <a routerLink="/cheatsheets" class="fc-btn">Continue Learning</a>
          <a routerLink="/auth/forgot" class="fc-btn">Change Password</a>
          <button type="button" class="fc-btn sign-out" (click)="signOut()">
            <span class="material-icons">logout</span> Sign Out
          </button>
        </div>
      </div>
    } @else {
      <div class="profile-shell">
        <h1>Not signed in</h1>
        <p class="muted-text" style="margin-bottom:1.5rem;">Sign in to view your profile and track progress.</p>
        <a routerLink="/auth/login" class="fc-btn">Sign in</a>
      </div>
    }
  `,
  styles: [
    `
      .profile-shell {
        max-width: 820px;
        margin: 2rem auto;
      }

      /* Header */
      .profile-header {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 2.5rem;
      }
      .avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: var(--orange-bg);
        border: 2px solid var(--orange-border);
        color: var(--orange);
        font-family: 'Playfair Display', serif;
        font-size: 1.4rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .profile-info h1 {
        font-family: 'Playfair Display', serif;
        font-size: 1.8rem;
        margin: 0 0 0.25rem;
      }
      .profile-email {
        color: var(--muted);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.72rem;
        font-family: 'DM Mono', monospace;
        padding: 0.2rem 0.5rem;
        border-radius: 999px;
        font-weight: 600;
      }
      .badge.verified { background: var(--green-light); color: var(--green); }
      .badge.unverified { background: var(--gold-light); color: var(--gold); }
      .badge .material-icons { font-size: 0.85rem; }

      /* Stats */
      .stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .stat {
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 16px;
        padding: 1.4rem;
      }
      .stat-num {
        font-family: 'DM Mono', monospace;
        font-size: 1.6rem;
        font-weight: 700;
        color: var(--orange);
        line-height: 1;
        margin-bottom: 0.4rem;
      }
      .stat-denom { font-size: 1rem; color: var(--muted); font-weight: 400; }
      .stat-label { font-size: 0.82rem; color: var(--muted); }

      /* Attempts table */
      .attempts-table {
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 16px;
        overflow: hidden;
        margin-bottom: 2rem;
      }
      .attempts-head {
        display: grid;
        grid-template-columns: 1.4fr 1fr 1fr 1fr 1.4fr;
        padding: 0.75rem 1.2rem;
        background: var(--stripe);
        border-bottom: 1px solid var(--border);
        font-size: 0.75rem;
        font-family: 'DM Mono', monospace;
        font-weight: 600;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .attempt-row {
        display: grid;
        grid-template-columns: 1.4fr 1fr 1fr 1fr 1.4fr;
        padding: 0.85rem 1.2rem;
        border-bottom: 1px solid var(--border);
        align-items: center;
        font-size: 0.9rem;
        transition: background 0.15s;
      }
      .attempt-row:last-child { border-bottom: none; }
      .attempt-row:hover { background: var(--stripe); }
      .tool-badge {
        font-size: 0.75rem;
        font-family: 'DM Mono', monospace;
        font-weight: 600;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
      }
      .tool-badge.quiz { background: var(--blue-light); color: var(--blue); }
      .tool-badge.knm { background: var(--orange-bg); color: var(--orange); }
      .score-pct { font-family: 'DM Mono', monospace; font-weight: 700; }
      .score-pct.good { color: var(--green); }
      .score-pct.bad { color: var(--red); }
      .mono { font-family: 'DM Mono', monospace; font-size: 0.85rem; }
      .muted-text { color: var(--muted); font-size: 0.85rem; }

      .empty-state {
        color: var(--muted);
        text-align: center;
        padding: 2rem;
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 16px;
        margin-bottom: 2rem;
      }
      .empty-state a { color: var(--orange); }

      /* Actions */
      .actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        margin-top: 0.5rem;
      }
      .sign-out { color: var(--red); border-color: var(--red-border); }
      .sign-out:hover { background: var(--red-light); }
      .sign-out .material-icons { font-size: 1rem; vertical-align: middle; }

      @media (max-width: 640px) {
        .attempts-head,
        .attempt-row {
          grid-template-columns: 1fr 1fr 1fr;
        }
        .attempt-row > :nth-child(4),
        .attempts-head > :nth-child(4) { display: none; }
        .profile-header { flex-direction: column; text-align: center; }
        .profile-email { justify-content: center; }
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly progress = inject(ProgressService);
  private readonly router = inject(Router);

  protected readonly attempts = signal<AttemptItem[]>([]);
  protected readonly stats = signal<{
    masteredSheets: number;
    masteredVerbs: number;
    masteredNouns: number;
    totalQuizAttempts: number;
    totalKnmAttempts: number;
  } | null>(null);

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.progress.getAttempts().subscribe((items) => this.attempts.set(items));
      this.progress.getStats().subscribe((s) => this.stats.set(s));
      // Refresh verb/noun signals from server so counts are in sync
      this.progress.refreshVerbsFromServer().subscribe();
      this.progress.refreshNounsFromServer().subscribe();
    }
  }

  signOut(): void {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/'));
  }

  protected initials(nameOrEmail: string): string {
    const parts = nameOrEmail.split(/[\s@]/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  protected formatDuration(ms: number | null): string {
    if (!ms) return '—';
    const secs = Math.round(ms / 1000);
    if (secs < 60) return `${secs}s`;
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
