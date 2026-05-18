import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'md-admin-dev-tools',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page-header">
      <div>
        <h1>Developer Tools & Integrations</h1>
        <p class="sub">Manage keys and tracking IDs for analytics, monitoring, and customer support widgets.</p>
      </div>
      <button
        class="save-btn"
        [disabled]="loading() || !form.dirty"
        (click)="saveSettings()"
      >
        @if (loading()) {
          <span class="material-icons spin">autorenew</span>
        } @else {
          <span class="material-icons">save</span>
        }
        Save Changes
      </button>
    </div>

    @if (error()) {
      <div class="alert error">
        <span class="material-icons">error_outline</span>
        {{ error() }}
      </div>
    }

    @if (success()) {
      <div class="alert success">
        <span class="material-icons">check_circle</span>
        Settings saved successfully! Reload the page to test active injections.
      </div>
    }

    <form [formGroup]="form" class="tools-grid">
      <!-- Google Analytics -->
      <div class="tool-card">
        <div class="card-head">
          <div class="tool-title">
            <span class="material-icons" style="color: #EA4335;">analytics</span>
            <h3>Google Analytics (GA4)</h3>
          </div>
          <span class="badge" [class.active]="form.value.googleAnalyticsKey">
            {{ form.value.googleAnalyticsKey ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <p class="desc">Standard website traffic tracking and user behavioral analytics.</p>
        <label class="field">
          Measurement ID
          <input type="text" formControlName="googleAnalyticsKey" placeholder="G-XXXXXXX" />
        </label>
      </div>

      <!-- Google Tag Manager -->
      <div class="tool-card">
        <div class="card-head">
          <div class="tool-title">
            <span class="material-icons" style="color: #4285F4;">tag</span>
            <h3>Google Tag Manager</h3>
          </div>
          <span class="badge" [class.active]="form.value.googleTagManagerId">
            {{ form.value.googleTagManagerId ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <p class="desc">Container ID for managing all marketing and analytics tags.</p>
        <label class="field">
          Container ID
          <input type="text" formControlName="googleTagManagerId" placeholder="GTM-XXXXXXX" />
        </label>
      </div>

      <!-- Sentry -->
      <div class="tool-card">
        <div class="card-head">
          <div class="tool-title">
            <span class="material-icons" style="color: #362D59;">bug_report</span>
            <h3>Sentry Error Monitoring</h3>
          </div>
          <span class="badge" [class.active]="form.value.sentryDsn">
            {{ form.value.sentryDsn ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <p class="desc">Real-time frontend exception and performance tracking.</p>
        <label class="field">
          Client DSN
          <input type="text" formControlName="sentryDsn" placeholder="https://...@...sentry.io/..." />
        </label>
      </div>

      <!-- PostHog -->
      <div class="tool-card">
        <div class="card-head">
          <div class="tool-title">
            <span class="material-icons" style="color: #F54E00;">insights</span>
            <h3>PostHog Product OS</h3>
          </div>
          <span class="badge" [class.active]="form.value.posthogKey">
            {{ form.value.posthogKey ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <p class="desc">Open-source product analytics, session recording, and feature flags.</p>
        <label class="field">
          Project API Key
          <input type="text" formControlName="posthogKey" placeholder="phc_XXXXXXX..." />
        </label>
      </div>

      <!-- Intercom -->
      <div class="tool-card">
        <div class="card-head">
          <div class="tool-title">
            <span class="material-icons" style="color: #0057FF;">chat_bubble</span>
            <h3>Intercom Messenger</h3>
          </div>
          <span class="badge" [class.active]="form.value.intercomAppId">
            {{ form.value.intercomAppId ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <p class="desc">In-app customer messaging, help center, and support ticketing.</p>
        <label class="field">
          App ID
          <input type="text" formControlName="intercomAppId" placeholder="xxxxxxx" />
        </label>
      </div>

      <!-- Crisp -->
      <div class="tool-card">
        <div class="card-head">
          <div class="tool-title">
            <span class="material-icons" style="color: #1972F5;">forum</span>
            <h3>Crisp Live Chat</h3>
          </div>
          <span class="badge" [class.active]="form.value.crispWebsiteId">
            {{ form.value.crispWebsiteId ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <p class="desc">Live customer support widget and automated knowledge base.</p>
        <label class="field">
          Website ID
          <input type="text" formControlName="crispWebsiteId" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
        </label>
      </div>

      <!-- Meta Pixel -->
      <div class="tool-card">
        <div class="card-head">
          <div class="tool-title">
            <span class="material-icons" style="color: #0668E1;">ads_click</span>
            <h3>Meta Pixel</h3>
          </div>
          <span class="badge" [class.active]="form.value.metaPixelId">
            {{ form.value.metaPixelId ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <p class="desc">Conversion tracking and retargeting for Facebook and Instagram ad campaigns.</p>
        <label class="field">
          Pixel ID
          <input type="text" formControlName="metaPixelId" placeholder="123456789012345" />
        </label>
      </div>
    </form>
  `,
  styles: [
    `
      .admin-page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2rem;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .admin-page-header h1 {
        font-family: 'Playfair Display', serif;
        font-size: 1.8rem;
        color: var(--ink);
        margin: 0 0 0.3rem;
      }
      .admin-page-header .sub {
        font-size: 0.9rem;
        color: var(--muted);
        margin: 0;
      }
      .save-btn {
        background: var(--orange);
        color: #fff;
        border: 1.5px solid var(--orange);
        padding: 0.65rem 1.25rem;
        border-radius: 10px;
        font-family: 'DM Sans', sans-serif;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
      }
      .save-btn:hover:not(:disabled) {
        background: #c05a1a;
        border-color: #c05a1a;
      }
      .save-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .save-btn .material-icons { font-size: 1.1rem; }

      .alert {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.8rem 1.2rem;
        border-radius: 10px;
        font-size: 0.88rem;
        margin-bottom: 2rem;
      }
      .alert.error { background: #fff5f5; border: 1px solid #fed7d7; color: #c53030; }
      .alert.success { background: #f0fff4; border: 1px solid #9ae6b4; color: #276749; }

      .tools-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
        gap: 1.5rem;
      }
      .tool-card {
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 14px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .tool-card:hover {
        border-color: var(--orange-border);
        box-shadow: 0 4px 16px rgba(232, 80, 10, 0.06);
      }
      .card-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.6rem;
      }
      .tool-title {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }
      .tool-title h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--ink);
      }
      .tool-title .material-icons {
        font-size: 1.4rem;
      }
      .badge {
        font-family: 'DM Mono', monospace;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        background: var(--stripe);
        color: var(--muted);
        border: 1px solid var(--border);
      }
      .badge.active {
        background: var(--green-light);
        color: var(--green);
        border-color: var(--green-border);
      }
      .desc {
        font-size: 0.83rem;
        color: var(--muted);
        line-height: 1.45;
        margin-bottom: 1.4rem;
        flex: 1;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--muted);
      }
      .field input {
        padding: 0.65rem 0.9rem;
        border: 1.5px solid var(--border);
        border-radius: 8px;
        font-family: 'DM Mono', monospace;
        font-size: 0.85rem;
        color: var(--ink);
        background: var(--white);
        transition: border-color 0.2s;
        outline: none;
      }
      .field input:focus {
        border-color: var(--orange);
      }
    `
  ]
})
export class AdminDevToolsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    googleAnalyticsKey: [''],
    googleTagManagerId: [''],
    sentryDsn: [''],
    posthogKey: [''],
    intercomAppId: [''],
    crispWebsiteId: [''],
    metaPixelId: [''],
  });

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Record<string, string>>(`${environment.apiBaseUrl}/admin/settings`).subscribe({
      next: (res) => {
        this.form.patchValue(res);
        this.form.markAsPristine();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load developer tool settings.');
        this.loading.set(false);
      }
    });
  }

  saveSettings() {
    if (this.loading() || !this.form.dirty) return;
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    const data = this.form.getRawValue();

    this.http.patch<Record<string, string>>(`${environment.apiBaseUrl}/admin/settings`, data).subscribe({
      next: (res) => {
        this.form.patchValue(res);
        this.form.markAsPristine();
        this.success.set(true);
        this.loading.set(false);
        setTimeout(() => this.success.set(false), 5000);
      },
      error: () => {
        this.error.set('Failed to save developer tool settings.');
        this.loading.set(false);
      }
    });
  }
}
