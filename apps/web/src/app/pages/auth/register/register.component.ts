import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
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
              placeholder="Create a strong password"
              formControlName="password"
              (input)="onPwInput($event)"
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
          
          <!-- Password Requirements Checklist -->
          <div class="pw-requirements">
            <div class="req-item" [class.valid]="hasLength()">
              <span class="material-icons">{{ hasLength() ? 'check_circle' : 'circle' }}</span>
              Min. 8 characters
            </div>
            <div class="req-item" [class.valid]="hasNumber()">
              <span class="material-icons">{{ hasNumber() ? 'check_circle' : 'circle' }}</span>
              At least one number
            </div>
            <div class="req-item" [class.valid]="hasSymbol()">
              <span class="material-icons">{{ hasSymbol() ? 'check_circle' : 'circle' }}</span>
              At least one symbol (!@#$%...)
            </div>
          </div>
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
            <span class="material-icons spin">autorenew</span>
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
    .pw-requirements {
      margin-top: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .req-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--muted);
      transition: color 0.2s;
    }
    .req-item .material-icons {
      font-size: 0.9rem;
      opacity: 0.4;
    }
    .req-item.valid {
      color: var(--green);
    }
    .req-item.valid .material-icons {
      opacity: 1;
    }
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

  // Requirement signals
  protected readonly pwValue = signal('');
  protected readonly hasLength = computed(() => this.pwValue().length >= 8);
  protected readonly hasNumber = computed(() => /[0-9]/.test(this.pwValue()));
  protected readonly hasSymbol = computed(() => /[^a-zA-Z0-9]/.test(this.pwValue()));

  protected readonly form = this.fb.nonNullable.group({
    displayName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required, 
      Validators.minLength(8),
      Validators.pattern(/[0-9]/),
      Validators.pattern(/[^a-zA-Z0-9]/)
    ]],
  });

  onPwInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.pwValue.set(val);
  }

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
