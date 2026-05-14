import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/theme.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'md-hub-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="hub-nav">
      <div class="hub-nav-inner">
        <a routerLink="/" class="hub-logo">More<span>Dutch</span></a>
        <ul class="hub-menu">
          <li>
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
              >Home</a
            >
          </li>
          <li>
            <a routerLink="/cheatsheets" routerLinkActive="active">Cheat Sheets</a>
          </li>
          <li
            class="nav-dropdown"
            [class.open]="dropdownOpen()"
            (mouseenter)="openDropdown()"
            (mouseleave)="closeDropdownSoon()"
            (focusin)="setDropdown(true)"
            (focusout)="closeDropdownSoon()"
          >
            <button
              class="nav-dropdown-toggle"
              type="button"
              [attr.aria-expanded]="dropdownOpen()"
              aria-haspopup="true"
              (click)="toggleDropdown()"
            >
              Tools <span class="material-icons" aria-hidden="true">expand_more</span>
            </button>
            @if (dropdownOpen()) {
              <div class="nav-dropdown-menu">
                @for (tool of tools; track tool.slug) {
                  <a [routerLink]="['/tools', tool.slug]" (click)="setDropdown(false)">
                    <span class="material-icons">{{ tool.icon }}</span>
                    {{ tool.title }}
                  </a>
                }
              </div>
            }
          </li>
          <li>
            <a routerLink="/about" routerLinkActive="active">About</a>
          </li>
          @if (auth.user()?.isAdmin) {
            <li>
              <a routerLink="/admin" routerLinkActive="active" class="admin-link">Admin</a>
            </li>
          }
        </ul>
        <div class="fc-toggle-wrap">
          <button
            class="hub-hamburger"
            aria-label="Open menu"
            type="button"
            (click)="openMobile()"
          >
            <span class="material-icons">menu</span>
          </button>
          <button
            type="button"
            class="fc-btn icon-only"
            [title]="theme.dark() ? 'Switch to light mode' : 'Switch to dark mode'"
            [attr.aria-label]="theme.dark() ? 'Switch to light mode' : 'Switch to dark mode'"
            (click)="theme.toggleDark()"
          >
            <span class="material-icons" aria-hidden="true">{{
              theme.dark() ? 'light_mode' : 'dark_mode'
            }}</span>
          </button>
          @if (auth.isAuthenticated()) {
            <a routerLink="/profile" class="fc-btn nav-user" title="My Profile" aria-label="My Profile">
              <span class="material-icons" aria-hidden="true">account_circle</span>
              Profile
            </a>
            <button type="button" class="fc-btn icon-only nav-signout" title="Sign Out" aria-label="Sign Out" (click)="signOut()">
              <span class="material-icons" aria-hidden="true">logout</span>
            </button>
          } @else {
            <a routerLink="/auth/login" class="fc-btn nav-signin">
              Sign In
            </a>
          }
          <div class="flag" aria-hidden="true">
            <div class="flag-red"></div>
            <div class="flag-white"></div>
            <div class="flag-blue"></div>
          </div>
        </div>
      </div>
    </nav>

    @if (mobileOpen) {
      <div class="hub-mobile-menu open" role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div class="hub-mobile-header">
          <a routerLink="/" class="hub-logo" (click)="closeMobile()">More<span>Dutch</span></a>
          <button
            type="button"
            class="hub-mobile-close"
            aria-label="Close menu"
            (click)="closeMobile()"
          >
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="hub-mobile-body">
          <ul class="hub-mobile-links">
            <li><a routerLink="/" (click)="closeMobile()">Home</a></li>
            <li><a routerLink="/cheatsheets" (click)="closeMobile()">Cheat Sheets</a></li>
            <li><a routerLink="/about" (click)="closeMobile()">About</a></li>
          </ul>
          <div class="hub-mobile-section-label">Tools</div>
          <ul class="hub-mobile-links">
            @for (tool of tools; track tool.slug) {
              <li>
                <a [routerLink]="['/tools', tool.slug]" (click)="closeMobile()">{{ tool.title }}</a>
              </li>
            }
          </ul>
          <div class="hub-mobile-section-label">Account</div>
          <ul class="hub-mobile-links">
            @if (auth.isAuthenticated()) {
              <li><a routerLink="/profile" (click)="closeMobile()">My Profile</a></li>
              @if (auth.user()?.isAdmin) {
                <li><a routerLink="/admin" (click)="closeMobile()">Admin Panel</a></li>
              }
            } @else {
              <li><a routerLink="/auth/login" (click)="closeMobile()">Sign In</a></li>
              <li><a routerLink="/auth/register" (click)="closeMobile()">Create Account</a></li>
            }
          </ul>
        </div>
      </div>
    }
  `,
})
export class HubNavComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly tools = [
    { slug: 'verb-explorer', title: 'Verb Explorer', icon: 'edit' },
    { slug: 'flashcards', title: 'Flashcards', icon: 'style' },
    { slug: 'de-het', title: 'de/het Trainer', icon: 'compare_arrows' },
    { slug: 'quiz', title: 'Quiz', icon: 'quiz' },
    { slug: 'sentence-builder', title: 'Sentence Builder', icon: 'construction' },
    { slug: 'knm-exam', title: 'KNM Exam', icon: 'gavel' },
    { slug: 'common-words', title: '1000 Common Words', icon: 'menu_book' },
  ];

  protected readonly dropdownOpen = signal(false);
  protected mobileOpen = false;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  setDropdown(open: boolean): void {
    if (open && this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
    this.dropdownOpen.set(open);
  }

  openDropdown(): void {
    this.setDropdown(true);
  }

  closeDropdownSoon(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      this.dropdownOpen.set(false);
      this.closeTimer = null;
    }, 180);
  }

  toggleDropdown(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
    this.dropdownOpen.update((v) => !v);
  }

  openMobile(): void {
    this.mobileOpen = true;
  }

  closeMobile(): void {
    this.mobileOpen = false;
  }

  signOut(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/']));
  }
}
