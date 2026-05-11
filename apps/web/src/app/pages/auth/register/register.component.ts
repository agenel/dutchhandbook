import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'md-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-shell">
      <div class="auth-logo">
        <a routerLink="/">More<span>Dutch</span></a>
      </div>
      <h1 class="auth-title">Create account</h1>
      <p class="auth-sub">Sync your mastery and progress across devices, free.</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
        <label class="auth-label">
          Display name <span class="auth-optional">(optional)</span>
          <input
            class="auth-input"
            type="text"
            autocomplete="nickname"
            placeholder="Jan de Vries"
            formControlName="displayName"
          />
        </label>

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

        <label class="auth-label">
          Password
          <div class="auth-input-wrap">
            <input
              class="auth-input"
              [type]="showPw() ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="At least 8 characters"
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
          <span class="auth-hint">Min. 8 characters.</span>
        </label>

        @if (error()) {
          <div class="auth-alert error">
            <span class="material-icons">error_outline</span>
            {{ error() }}
          </div>
        }
        @if (success()) {
          <div class="auth-alert success">
            <span class="material-icons">mark_email_read</span>
            Account created! Check your inbox for a verification email.
          </div>
        }

        <button
          class="fc-btn auth-submit"
          type="submit"
          [disabled]="loading() || form.invalid || success()"
        >
          @if (loading()) {
            <span class="material-icons spin">progress_activity</span>
          }
          Create account
        </button>
      </form>

      <div class="auth-links">
        <span>Already a member?</span>
        <a routerLink="/auth/login">Sign in</a>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal(false);
  protected readonly showPw = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    displayName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
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
          setTimeout(() => this.router.navigateByUrl('/'), 2000);
        },
        error: (err: { error?: { message?: string } }) => {
          this.loading.set(false);
          this.error.set(err?.error?.message ?? 'Sign up failed.');
        },
      });
  }
}
