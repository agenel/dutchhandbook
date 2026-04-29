import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'md-forgot',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-shell">
      <div class="auth-logo">
        <a routerLink="/">More<span>Dutch</span></a>
      </div>
      <h1 class="auth-title">Reset password</h1>
      <p class="auth-sub">
        Enter your account email and we'll send you a link to reset your password.
      </p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
        <label class="auth-label">
          Email
          <input
            class="auth-input"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            formControlName="email"
          />
        </label>

        @if (sent()) {
          <div class="auth-alert success">
            <span class="material-icons">mark_email_read</span>
            If that account exists, you'll receive a reset link shortly.
          </div>
        }

        <button
          class="fc-btn auth-submit"
          type="submit"
          [disabled]="form.invalid || sent()"
        >
          Send reset link
        </button>
      </form>

      <div class="auth-links">
        <a routerLink="/auth/login">
          <span class="material-icons" style="font-size:1rem; vertical-align:middle;">arrow_back</span>
          Back to sign in
        </a>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class ForgotComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  protected readonly sent = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.auth.requestPasswordReset(this.form.getRawValue().email).subscribe({
      next: () => this.sent.set(true),
      error: () => this.sent.set(true),
    });
  }
}
