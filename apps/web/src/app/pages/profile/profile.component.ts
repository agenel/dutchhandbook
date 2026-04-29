import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../core/auth.service';
import { ProgressService } from '../../core/progress.service';

@Component({
  selector: 'md-profile',
  standalone: true,
  imports: [RouterLink, ButtonModule, CardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (auth.user(); as user) {
      <div class="profile-shell">
        <h1>Hi, {{ user.displayName ?? user.email }}</h1>
        <p class="muted">{{ user.email }}</p>

        <div class="stats-row">
          <div class="stat">
            <div class="stat-num">{{ progress.masteredCount() }}/15</div>
            <div class="stat-label">Cheat sheets mastered</div>
          </div>
          <div class="stat">
            <div class="stat-num">{{ user.emailVerified ? 'Yes' : 'No' }}</div>
            <div class="stat-label">Email verified</div>
          </div>
          <div class="stat">
            <div class="stat-num">{{ user.hasTotp ? 'On' : 'Off' }}</div>
            <div class="stat-label">Two-factor auth</div>
          </div>
        </div>

        <div class="actions">
          <a routerLink="/cheatsheets" class="fc-btn">Continue learning</a>
          <button pButton type="button" severity="secondary" (click)="signOut()" label="Sign out"></button>
        </div>
      </div>
    } @else {
      <div class="profile-shell">
        <h1>Not signed in</h1>
        <p>
          <a routerLink="/auth/login" class="fc-btn">Sign in</a>
          to view your profile.
        </p>
      </div>
    }
  `,
  styles: [
    `
      .profile-shell {
        max-width: 700px;
        margin: 2rem auto;
      }
      .profile-shell h1 {
        font-family: 'Playfair Display', serif;
        font-size: 2.4rem;
      }
      .muted {
        color: var(--muted);
        margin-bottom: 2rem;
      }
      .stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
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
        font-weight: 600;
        color: var(--orange);
      }
      .stat-label {
        font-size: 0.85rem;
        color: var(--muted);
      }
      .actions {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class ProfileComponent {
  protected readonly auth = inject(AuthService);
  protected readonly progress = inject(ProgressService);
  private readonly router = inject(Router);

  protected readonly mastered = computed(() => this.progress.masteredCount());

  signOut(): void {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/'));
  }
}
