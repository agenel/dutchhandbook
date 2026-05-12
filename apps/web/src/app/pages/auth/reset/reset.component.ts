import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'md-reset',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MessageModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-shell">
      <div class="auth-logo">
        <a routerLink="/">More<span>Dutch</span></a>
      </div>
      <h1 class="auth-title">Choose new password</h1>
      <p class="auth-sub">Please enter a strong new password for your account.</p>

      @if (state() === 'success') {
        <div class="auth-success-state">
          <p-message severity="success" text="Password changed successfully!" />
          <p style="margin-top:1.5rem;">
            <a routerLink="/auth/login" class="fc-btn">Sign in now →</a>
          </p>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <label class="auth-label">
            New Password
            <input
              class="auth-input"
              type="password"
              placeholder="••••••••"
              formControlName="password"
            />
          </label>

          <label class="auth-label">
            Confirm Password
            <input
              class="auth-input"
              type="password"
              placeholder="••••••••"
              formControlName="confirmPassword"
            />
          </label>

          @if (error()) {
            <p-message severity="error" [text]="error()!" styleClass="w-full mb-3" />
          }

          <button
            class="fc-btn auth-submit"
            type="submit"
            [disabled]="form.invalid || loading()"
          >
            {{ loading() ? 'Saving...' : 'Update password' }}
          </button>
        </form>
      }

      <div class="auth-links">
        <a routerLink="/auth/login">Back to sign in</a>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .auth-shell {
      max-width: 420px;
      margin: 3rem auto;
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    }
    .auth-logo { text-align: center; margin-bottom: 2rem; }
    .auth-logo a { font-family: 'Playfair Display', serif; font-weight: 900; font-size: 1.8rem; text-decoration: none; color: #333; }
    .auth-logo span { color: var(--orange); }
    .auth-title { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 0.5rem; text-align: center; }
    .auth-sub { color: #666; text-align: center; margin-bottom: 2rem; font-size: 0.95rem; }
    .auth-form { display: flex; flex-direction: column; gap: 1.2rem; }
    .auth-label { display: flex; flex-direction: column; gap: 0.5rem; font-weight: 600; font-size: 0.9rem; }
    .auth-input {
      padding: 0.8rem 1rem;
      border: 1.5px solid var(--border);
      border-radius: 12px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    .auth-input:focus { outline: none; border-color: var(--orange); }
    .auth-submit { width: 100%; margin-top: 1rem; }
    .auth-links { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; }
    .auth-links a { color: var(--orange); text-decoration: none; font-weight: 500; }
    .auth-success-state { text-align: center; padding: 1rem 0; }
  `],
})
export class ResetComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly state = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  private token: string | null = null;

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.error.set('Invalid or missing reset token.');
      this.form.disable();
    }
  }

  submit(): void {
    if (this.form.invalid || !this.token) return;
    
    const { password, confirmPassword } = this.form.getRawValue();
    if (password !== confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth.confirmPasswordReset(this.token, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.state.set('success');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to reset password. The link may have expired.');
      }
    });
  }
}
