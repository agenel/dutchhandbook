import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'md-forgot',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, MessageModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-shell">
      <h1 class="auth-title">Reset password</h1>
      <p class="auth-sub">
        Enter the email associated with your account. If we recognise it, we'll send you a
        password reset link.
      </p>
      <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
        <label>
          Email
          <input pInputText type="email" autocomplete="email" formControlName="email" />
        </label>
        @if (sent()) {
          <p-message
            severity="success"
            text="If that account exists, you'll receive a reset link shortly."
          />
        }
        <button pButton type="submit" [disabled]="form.invalid" label="Send reset link"></button>
      </form>
      <div class="auth-links">
        <a routerLink="/auth/login">Back to sign in</a>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-shell {
        max-width: 420px;
        margin: 3rem auto;
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 20px;
        padding: 2rem;
      }
      .auth-title {
        font-family: 'Playfair Display', serif;
        font-size: 2.4rem;
        margin-bottom: 0.4rem;
      }
      .auth-sub {
        color: var(--muted);
        margin-bottom: 1.6rem;
      }
      .auth-form {
        display: grid;
        gap: 1rem;
      }
      .auth-form label {
        display: grid;
        gap: 0.4rem;
        font-size: 0.85rem;
        color: var(--muted);
      }
      .auth-links {
        margin-top: 1.4rem;
        font-size: 0.9rem;
      }
      .auth-links a {
        color: var(--orange);
      }
    `,
  ],
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
      // We always show "sent" even on error to avoid leaking which emails are registered.
      error: () => this.sent.set(true),
    });
  }
}
