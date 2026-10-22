import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { AttemptItem } from '@moredutch/shared';
import { AuthService } from '../../core/auth.service';
import { ProgressService } from '../../core/progress.service';
import { SessionSyncService } from '../../core/session-sync.service';

@Component({
  selector: 'md-profile',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
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
            <div class="stat-num">{{ progress.masteredCommonWordsCount() }}</div>
            <div class="stat-label">Words Mastered</div>
          </div>
          <div class="stat">
            <div class="stat-num">{{ (userStats()?.totalQuizAttempts ?? 0) + (userStats()?.totalKnmAttempts ?? 0) }}</div>
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
          <button type="button" class="fc-btn sign-out" (click)="signOut()">
            <span class="material-icons">logout</span> Sign Out
          </button>
        </div>

        <!-- Account settings -->
        <div class="section-title" style="margin-top:2.5rem;">Account <div class="title-line"></div></div>
        <div class="account-grid">
          <form class="account-card" [formGroup]="nameForm" (ngSubmit)="saveName()">
            <h2 class="card-title">Display name</h2>
            <label class="field" for="displayName">Shown on your profile instead of your email
              <input id="displayName" class="input" formControlName="displayName" maxlength="40" autocomplete="nickname" />
            </label>
            @if (nameMsg(); as m) {
              <p class="form-msg" [class.error]="m.error" role="status">{{ m.text }}</p>
            }
            <button class="fc-btn" type="submit" [disabled]="nameForm.invalid || nameForm.pristine || busy() === 'name'">
              {{ busy() === 'name' ? 'Saving…' : 'Save name' }}
            </button>
          </form>

          <form class="account-card" [formGroup]="pwForm" (ngSubmit)="changePassword()">
            <h2 class="card-title">Change password</h2>
            <label class="field" for="currentPassword">Current password
              <input id="currentPassword" class="input" type="password" formControlName="currentPassword" autocomplete="current-password" />
            </label>
            <label class="field" for="newPassword">New password
              <input id="newPassword" class="input" type="password" formControlName="newPassword" autocomplete="new-password" />
              <span class="hint">At least 8 characters, including a number and a symbol.</span>
            </label>
            <label class="field" for="confirmPassword">Confirm new password
              <input id="confirmPassword" class="input" type="password" formControlName="confirmPassword" autocomplete="new-password" />
            </label>
            @if (pwMsg(); as m) {
              <p class="form-msg" [class.error]="m.error" role="status">{{ m.text }}</p>
            }
            <button class="fc-btn" type="submit" [disabled]="pwForm.invalid || busy() === 'password'">
              {{ busy() === 'password' ? 'Changing…' : 'Change password' }}
            </button>
          </form>
        </div>

        <div class="danger-zone">
          <h2 class="card-title">Delete account</h2>
          <p>Permanently removes your account, progress and exam history. This can't be undone.</p>
          @if (!confirmDelete()) {
            <button type="button" class="fc-btn danger" (click)="confirmDelete.set(true)">Delete my account…</button>
          } @else {
            <form [formGroup]="deleteForm" (ngSubmit)="deleteAccount()">
              <label class="field" for="deletePassword">Enter your password to confirm
                <input id="deletePassword" class="input" type="password" formControlName="password" autocomplete="current-password" />
              </label>
              @if (deleteMsg(); as m) {
                <p class="form-msg error" role="alert">{{ m }}</p>
              }
              <div class="danger-actions">
                <button type="submit" class="fc-btn danger-solid" [disabled]="deleteForm.invalid || busy() === 'delete'">
                  {{ busy() === 'delete' ? 'Deleting…' : 'Permanently delete account' }}
                </button>
                <button type="button" class="fc-btn" (click)="cancelDelete()">Cancel</button>
              </div>
            </form>
          }
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
        overflow-wrap: anywhere; /* an email as the heading must not break mid-layout */
      }
      .profile-info { min-width: 0; }
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
        /* Five stats: one row on wide screens; on phones two columns with the
           last card spanning the row so nothing sits alone. */
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }
      @media (max-width: 720px) {
        .stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .stats-row > .stat:last-child:nth-child(odd) { grid-column: 1 / -1; }
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

      /* Account settings */
      .account-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
        align-items: start;
      }
      .account-card,
      .danger-zone {
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 16px;
        padding: 1.4rem;
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
      }
      .account-card .fc-btn { align-self: flex-start; }
      .card-title { font-size: 1.05rem; margin: 0; }
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-size: 0.85rem;
        color: var(--muted);
      }
      .input {
        width: 100%;
        padding: 0.7rem 0.9rem;
        border: 1.5px solid var(--border);
        border-radius: 10px;
        background: var(--cream);
        color: var(--ink);
        font: inherit;
        font-size: 0.95rem;
      }
      .input:focus { outline: none; border-color: var(--orange); }
      .hint { font-size: 0.78rem; }
      .form-msg { margin: 0; font-size: 0.85rem; color: var(--green); }
      .form-msg.error { color: var(--red); }
      .danger-zone { margin-top: 1rem; border-color: var(--red-border); }
      .danger-zone p { margin: 0; color: var(--muted); font-size: 0.9rem; }
      .danger-zone form { display: flex; flex-direction: column; gap: 0.9rem; }
      .danger-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
      .danger { align-self: flex-start; color: var(--red); border-color: var(--red-border); }
      .danger:hover { background: var(--red-light); }
      .danger-solid { background: var(--red); border-color: var(--red); color: #fff; }
      .danger-solid:disabled { opacity: 0.6; }
      @media (max-width: 720px) {
        .account-grid { grid-template-columns: 1fr; }
      }

      @media (max-width: 640px) {
        .attempts-head,
        .attempt-row {
          grid-template-columns: 1fr 1fr 1fr;
        }
        .attempt-row > :nth-child(4),
        .attempts-head > :nth-child(4) { display: none; }
        .profile-header { flex-direction: column; text-align: center; }
        .profile-info h1 { font-size: 1.4rem; }
        .profile-email { justify-content: center; }
      }
    `,
  ],
})
export class ProfileComponent {
  protected readonly auth = inject(AuthService);
  private readonly sessionSync = inject(SessionSyncService);
  protected readonly progress = inject(ProgressService);
  private readonly router = inject(Router);

  protected readonly attempts = signal<AttemptItem[]>([]);
  protected readonly userStats = signal<{
    masteredSheets: number;
    masteredVerbs: number;
    masteredNouns: number;
    totalQuizAttempts: number;
    totalKnmAttempts: number;
  } | null>(null);

  private loaded = false;

  private readonly fb = inject(FormBuilder);
  protected readonly busy = signal<'name' | 'password' | 'delete' | null>(null);
  protected readonly nameMsg = signal<{ text: string; error: boolean } | null>(null);
  protected readonly pwMsg = signal<{ text: string; error: boolean } | null>(null);
  protected readonly deleteMsg = signal<string | null>(null);
  protected readonly confirmDelete = signal(false);

  protected readonly nameForm = this.fb.nonNullable.group({
    displayName: ['', [Validators.maxLength(40)]],
  });
  // Mirrors the API's PasswordSchema (min 8, a number and a symbol).
  protected readonly pwForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/[0-9]/),
      Validators.pattern(/[^a-zA-Z0-9]/),
    ]],
    confirmPassword: ['', [Validators.required]],
  });
  protected readonly deleteForm = this.fb.nonNullable.group({
    password: ['', [Validators.required]],
  });

  constructor() {
    // Prefill the name field once the user is known.
    effect(() => {
      const user = this.auth.user();
      if (user && this.nameForm.pristine) {
        this.nameForm.setValue({ displayName: user.displayName ?? '' }, { emitEvent: false });
      }
    });

    // React to the auth signal rather than checking once in ngOnInit: on a hard
    // refresh of /profile the session bootstrap hasn't resolved yet, so a one-shot
    // `isAuthenticated()` check would be false and the page would render empty
    // stats until an in-app re-navigation.
    effect(() => {
      if (this.auth.isAuthenticated() && !this.loaded) {
        this.loaded = true;
        this.loadProfileData();
      }
    });
  }

  private loadProfileData(): void {
    this.progress.getAttempts().subscribe((items) => this.attempts.set(items));
    this.progress.getStats().subscribe((s) => this.userStats.set(s));
    // Refresh signals from server so counts are in sync
    this.progress.refreshVerbsFromServer().subscribe();
    this.progress.refreshNounsFromServer().subscribe();
    this.progress.refreshCommonWordsFromServer().subscribe();
  }

  signOut(): void {
    this.sessionSync.signOut().subscribe(() => this.router.navigateByUrl('/'));
  }

  protected saveName(): void {
    if (this.nameForm.invalid) return;
    const name = this.nameForm.getRawValue().displayName.trim();
    this.busy.set('name');
    this.nameMsg.set(null);
    this.auth.updateProfile(name || null).subscribe({
      next: (u) => {
        this.busy.set(null);
        this.nameForm.reset({ displayName: u.displayName ?? '' });
        this.nameMsg.set({ text: 'Name saved.', error: false });
      },
      error: (err) => {
        this.busy.set(null);
        this.nameMsg.set({ text: this.errorText(err, 'Could not save your name. Try again.'), error: true });
      },
    });
  }

  protected changePassword(): void {
    if (this.pwForm.invalid) return;
    const { currentPassword, newPassword, confirmPassword } = this.pwForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.pwMsg.set({ text: 'The new passwords don’t match.', error: true });
      return;
    }
    this.busy.set('password');
    this.pwMsg.set(null);
    this.auth.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.busy.set(null);
        this.pwForm.reset();
        this.pwMsg.set({ text: 'Password changed. Other devices have been signed out.', error: false });
      },
      error: (err) => {
        this.busy.set(null);
        this.pwMsg.set({ text: this.errorText(err, 'Could not change your password. Try again.'), error: true });
      },
    });
  }

  protected cancelDelete(): void {
    this.confirmDelete.set(false);
    this.deleteForm.reset();
    this.deleteMsg.set(null);
  }

  protected deleteAccount(): void {
    if (this.deleteForm.invalid) return;
    this.busy.set('delete');
    this.deleteMsg.set(null);
    this.auth.deleteAccount(this.deleteForm.getRawValue().password).subscribe({
      next: () => {
        this.busy.set(null);
        this.progress.clearLocalProgress();
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.busy.set(null);
        this.deleteMsg.set(this.errorText(err, 'Could not delete your account. Try again.'));
      },
    });
  }

  private errorText(err: unknown, fallback: string): string {
    const msg = (err as { error?: { message?: unknown } })?.error?.message;
    return typeof msg === 'string' && msg ? msg : fallback;
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
