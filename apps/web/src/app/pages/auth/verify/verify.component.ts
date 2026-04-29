import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'md-verify',
  standalone: true,
  imports: [RouterLink, MessageModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-shell">
      <h1 class="auth-title">Verify email</h1>
      @if (state() === 'pending') {
        <p>Verifying your email…</p>
      } @else if (state() === 'ok') {
        <p-message severity="success" text="Email verified. You can now sign in." />
        <p style="margin-top:1rem;">
          <a routerLink="/auth/login">Continue to sign in →</a>
        </p>
      } @else {
        <p-message
          severity="error"
          text="That link is invalid or has expired. Please request a new one."
        />
        <p style="margin-top:1rem;">
          <a routerLink="/auth/login">Back to sign in</a>
        </p>
      }
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
        font-size: 2rem;
        margin-bottom: 1rem;
      }
      .auth-shell a {
        color: var(--orange);
      }
    `,
  ],
})
export class VerifyComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  protected readonly state = signal<'pending' | 'ok' | 'error'>('pending');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state.set('error');
      return;
    }
    this.auth.verifyEmail(token).subscribe({
      next: () => this.state.set('ok'),
      error: () => this.state.set('error'),
    });
  }
}
