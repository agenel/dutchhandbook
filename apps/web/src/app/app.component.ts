import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { RouteSeoService } from './core/route-seo.service';
import { AnalyticsService } from './core/analytics.service';
import { SessionSyncService } from './core/session-sync.service';
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
  /** Subscribes to `Router` events and applies per-route SEO from `data`. */
  private readonly routeSeo = inject(RouteSeoService);
  private readonly analytics = inject(AnalyticsService);
  private readonly sessionSync = inject(SessionSyncService);

  ngOnInit(): void {
    void this.routeSeo;
    this.analytics.init();

    // Re-hydrate the session cookie on first load. Failure is fine — we
    // simply stay anonymous and keep using localStorage progress.
    this.auth.bootstrap().subscribe((user) => {
      if (!user) return;
      this.sessionSync.syncAfterAuth().subscribe();
    });
  }
}
