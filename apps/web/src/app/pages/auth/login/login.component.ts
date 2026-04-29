import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/auth.service';
import { ProgressService } from '../../../core/progress.service';

@Component({
  selector: 'md-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-shell">
      <h1 class="auth-title">Sign in</h1>
      <p class="auth-sub">Welcome back. Your progress is right where you left it.</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
        <label>
          Email
          <input pInputText type="email" autocomplete="username" formControlName="email" />
        </label>
        <label>
          Password
          <p-password
            formControlName="password"
            [feedback]="false"
            [toggleMask]="true"
            inputStyleClass="w-full"
            styleClass="w-full"
          />
        </label>
        <label class="totp">
          One-time code (only if 2FA enabled)
          <input pInputText inputmode="numeric" maxlength="6" formControlName="totp" />
        </label>

        @if (error()) {
          <p-message severity="error" [text]="error()!" />
        }

        <button pButton type="submit" [disabled]="loading() || form.invalid" label="Sign in"></button>
      </form>

      <div class="auth-links">
        <a routerLink="/auth/forgot">Forgot password?</a>
        <a routerLink="/auth/register">Create an account</a>
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
      .auth-form .totp {
        opacity: 0.8;
      }
      .auth-links {
        display: flex;
        justify-content: space-between;
        margin-top: 1.4rem;
        font-size: 0.9rem;
      }
      .auth-links a {
        color: var(--orange);
      }
    `,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly progress = inject(ProgressService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

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
