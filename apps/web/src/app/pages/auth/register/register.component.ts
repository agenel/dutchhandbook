import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'md-register',
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
      <h1 class="auth-title">Create account</h1>
      <p class="auth-sub">Sync your mastery and progress across devices, free.</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
        <label>
          Display name (optional)
          <input pInputText type="text" autocomplete="nickname" formControlName="displayName" />
        </label>
        <label>
          Email
          <input pInputText type="email" autocomplete="email" formControlName="email" />
        </label>
        <label>
          Password
          <p-password
            formControlName="password"
            [toggleMask]="true"
            promptLabel="At least 12 characters with mixed case, a digit and a symbol."
            inputStyleClass="w-full"
            styleClass="w-full"
          />
        </label>

        @if (error()) {
          <p-message severity="error" [text]="error()!" />
        }
        @if (success()) {
          <p-message
            severity="success"
            text="Account created. Check your inbox for a verification email."
          />
        }

        <button
          pButton
          type="submit"
          [disabled]="loading() || form.invalid"
          label="Create account"
        ></button>
      </form>

      <div class="auth-links">
        <span>Already a member?</span>
        <a routerLink="/auth/login">Sign in</a>
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
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    displayName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(12)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    this.auth
      .register({
        email: v.email,
        password: v.password,
        displayName: v.displayName?.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.success.set(true);
          this.loading.set(false);
          setTimeout(() => this.router.navigateByUrl('/'), 1500);
        },
        error: (err: { error?: { message?: string } }) => {
          this.loading.set(false);
          this.error.set(err?.error?.message ?? 'Sign up failed.');
        },
      });
  }
}
