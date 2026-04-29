import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { ProgressService } from './core/progress.service';
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

  ngOnInit(): void {
    // Re-hydrate the session cookie on first load. Failure is fine — we
    // simply stay anonymous and keep using localStorage progress.
    this.auth.bootstrap().subscribe((user) => {
      if (!user) return;
      // Logged in: push any anonymous localStorage progress up, then pull
      // the authoritative server state down.
      this.progress.migrateAnonymousProgress().subscribe(() => {
        this.progress.refreshFromServer().subscribe();
      });
    });
  }
}
