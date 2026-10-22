import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/theme.service';
import { AuthService } from '../../core/auth.service';
import { SessionSyncService } from '../../core/session-sync.service';

@Component({
  selector: 'md-hub-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="hub-nav" aria-label="Main">
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
            #dropdown
            class="nav-dropdown"
            [class.open]="dropdownOpen()"
            (mouseenter)="onDropdownEnter()"
            (mouseleave)="onDropdownLeave()"
            (focusin)="cancelClose()"
            (focusout)="onDropdownFocusOut($event)"
          >
            <button
              #dropdownToggle
              class="nav-dropdown-toggle"
              type="button"
              [attr.aria-expanded]="dropdownOpen()"
              aria-haspopup="true"
              aria-controls="tools-menu"
              (click)="toggleDropdown()"
            >
              Tools <span class="material-icons" aria-hidden="true">expand_more</span>
            </button>
            @if (dropdownOpen()) {
              <div class="nav-dropdown-menu" id="tools-menu">
                @for (tool of tools; track tool.slug) {
                  <a [routerLink]="['/tools', tool.slug]" (click)="closeDropdown()">
                    <span class="material-icons" aria-hidden="true">{{ tool.icon }}</span>
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
            #hamburger
            class="hub-hamburger"
            aria-label="Open menu"
            type="button"
            [attr.aria-expanded]="mobileOpen"
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
            #mobileClose
            type="button"
            class="hub-mobile-close"
            aria-label="Close menu"
            (click)="closeMobile(true)"
          >
            <span class="material-icons">close</span>
          </button>
        </div>
        <nav class="hub-mobile-body" aria-label="Mobile">
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
        </nav>
      </div>
    }
  `,
})
export class HubNavComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly auth = inject(AuthService);
  private readonly sessionSync = inject(SessionSyncService);
  private readonly router = inject(Router);
  protected readonly tools = [
    { slug: 'knm-exam', title: 'KNM Exam', icon: 'gavel' },
    { slug: 'verb-explorer', title: 'Verb Explorer', icon: 'travel_explore' },
    { slug: 'verb-wheel', title: 'Conjugation Wheel', icon: 'donut_large' },
    { slug: 'common-words', title: 'Common Words', icon: 'menu_book' },
    { slug: 'flashcards', title: 'Flashcards', icon: 'style' },
    { slug: 'de-het', title: 'de/het Trainer', icon: 'category' },
    { slug: 'quiz', title: 'Quiz', icon: 'quiz' },
    { slug: 'sentence-builder', title: 'Sentence Builder', icon: 'account_tree' },
  ];

  protected readonly dropdownOpen = signal(false);
  protected mobileOpen = false;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  /** True once the menu was opened deliberately (click / keyboard); hover-out won't close it then. */
  private pinned = false;

  private readonly dropdownEl = viewChild<ElementRef<HTMLElement>>('dropdown');
  private readonly dropdownToggle = viewChild<ElementRef<HTMLButtonElement>>('dropdownToggle');
  private readonly hamburger = viewChild<ElementRef<HTMLButtonElement>>('hamburger');
  private readonly mobileClose = viewChild<ElementRef<HTMLButtonElement>>('mobileClose');
  private readonly cdr = inject(ChangeDetectorRef);

  cancelClose(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  onDropdownEnter(): void {
    this.cancelClose();
    this.dropdownOpen.set(true);
  }

  onDropdownLeave(): void {
    if (this.pinned) return;
    this.cancelClose();
    this.closeTimer = setTimeout(() => {
      this.dropdownOpen.set(false);
      this.closeTimer = null;
    }, 180);
  }

  onDropdownFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.dropdownEl()?.nativeElement.contains(next)) return;
    // Focus left the menu entirely (e.g. Tab past the last link).
    this.closeDropdown();
  }

  /**
   * Click / Enter / Space. Hover may already have opened the menu, so a click
   * on an open-but-unpinned menu pins it open instead of toggling it shut.
   */
  toggleDropdown(): void {
    this.cancelClose();
    if (!this.dropdownOpen()) {
      this.dropdownOpen.set(true);
      this.pinned = true;
    } else if (!this.pinned) {
      this.pinned = true;
    } else {
      this.closeDropdown();
    }
  }

  closeDropdown(): void {
    this.cancelClose();
    this.pinned = false;
    this.dropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.dropdownOpen()) return;
    const el = this.dropdownEl()?.nativeElement;
    if (el && !el.contains(event.target as Node)) this.closeDropdown();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.mobileOpen) {
      this.closeMobile(true);
    } else if (this.dropdownOpen()) {
      this.closeDropdown();
      this.dropdownToggle()?.nativeElement.focus();
    }
  }

  openMobile(): void {
    this.mobileOpen = true;
    this.cdr.markForCheck();
    // Move focus into the dialog once it has rendered.
    setTimeout(() => this.mobileClose()?.nativeElement.focus());
  }

  closeMobile(restoreFocus = false): void {
    this.mobileOpen = false;
    this.cdr.markForCheck();
    if (restoreFocus) setTimeout(() => this.hamburger()?.nativeElement.focus());
  }

  signOut(): void {
    this.sessionSync.signOut().subscribe(() => this.router.navigate(['/']));
  }
}
