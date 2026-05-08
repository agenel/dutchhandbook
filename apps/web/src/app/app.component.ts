import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { ProgressService } from './core/progress.service';
import { RouteSeoService } from './core/route-seo.service';
import { ThemeService } from './core/theme.service';
import { FooterComponent } from './layout/footer/footer.component';
import { HubNavComponent } from './layout/hub-nav/hub-nav.component';

@Component({
  selector: 'md-root',
  standalone: true,
  imports: [RouterOutlet, HubNavComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main">Skip to main content</a>
    <md-hub-nav />
    <main id="main" class="page">
      <router-outlet />
    </main>
    <md-footer />
  `,
})
export class AppComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly progress = inject(ProgressService);
  private readonly theme = inject(ThemeService);
  /** Subscribes to `Router` events and applies per-route SEO from `data`. */
  private readonly routeSeo = inject(RouteSeoService);

  ngOnInit(): void {
    void this.routeSeo;
    // Re-hydrate the session cookie on first load. Failure is fine — we
    // simply stay anonymous and keep using localStorage progress.
    this.auth.bootstrap().subscribe((user) => {
      if (!user) return;
      // Logged in: push any anonymous localStorage progress up, then pull
      // the authoritative server state down.
      this.progress.migrateAnonymousProgress().subscribe(() => {
        this.progress.refreshFromServer().subscribe();
        this.progress.refreshPreferencesFromServer().subscribe((prefs) => {
          if (!prefs) return;
          if (prefs.darkMode !== undefined) this.theme.setDark(!!prefs.darkMode);
          if (prefs.flashcardMode !== undefined) this.theme.setFlashcard(!!prefs.flashcardMode);
          if (prefs.hideMastered !== undefined) {
            this.progress.applyHideMasteredFromServer(!!prefs.hideMastered);
          }
        });
      });
    });
  }
}
