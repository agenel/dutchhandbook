import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ProgressService } from '../../../core/progress.service';

@Component({
  selector: 'md-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-shell">
      <div class="auth-logo">
        <a routerLink="/">More<span>Dutch</span></a>
      </div>
      <h1 class="auth-title">Sign in</h1>
      <p class="auth-sub">Welcome back. Your progress is right where you left it.</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
        <label class="auth-label">
          Email
          <input
            class="auth-input"
            type="email"
            autocomplete="username"
            placeholder="you@example.com"
            formControlName="email"
          />
        </label>

        <label class="auth-label">
          Password
          <div class="auth-input-wrap">
            <input
              class="auth-input"
              [type]="showPw() ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••••••"
              formControlName="password"
            />
            <button
              type="button"
              class="auth-eye"
              (click)="showPw.set(!showPw())"
              [attr.aria-label]="showPw() ? 'Hide password' : 'Show password'"
            >
              <span class="material-icons">{{ showPw() ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </label>

        @if (error()) {
          <div class="auth-alert error">
            <span class="material-icons">error_outline</span>
            {{ error() }}
          </div>
        }

        <button
          class="fc-btn auth-submit"
          type="submit"
          [disabled]="loading() || form.invalid"
        >
          @if (loading()) {
            <span class="material-icons spin">progress_activity</span>
          }
          Sign in
        </button>
      </form>

      <div class="auth-or">or</div>

      <a routerLink="/auth/register" class="fc-btn auth-secondary">
        Create an account
      </a>

      <div class="auth-links">
        <a routerLink="/auth/forgot">Forgot password?</a>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .auth-or {
      text-align: center;
      margin: 0.4rem 0;
      font-size: 0.82rem;
      color: var(--muted);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .auth-or::before, .auth-or::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
      opacity: 0.4;
    }
    .auth-secondary {
      width: 100%;
      justify-content: center;
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
      border-radius: 10px;
      background: transparent;
      border: 1.5px solid var(--border);
      color: var(--muted);
      display: flex;
      align-items: center;
      text-decoration: none;
      margin-top: 0;
    }
    .auth-secondary:hover {
      border-color: var(--orange);
      color: var(--orange);
      background: var(--orange-bg);
    }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly progress = inject(ProgressService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPw = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(1)]],
    totp: [''],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    this.auth
      .login({
        email: v.email,
        password: v.password,
        totp: v.totp || undefined,
      })
      .subscribe({
        next: () => {
          this.progress.migrateAnonymousProgress().subscribe(() => {
            this.progress.refreshFromServer().subscribe();
            this.router.navigateByUrl('/');
          });
        },
        error: (err: { error?: { message?: string } }) => {
          this.loading.set(false);
          this.error.set(err?.error?.message ?? 'Sign in failed. Please try again.');
        },
      });
  }
}
