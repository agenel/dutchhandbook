import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'md-admin-system',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page-header">
      <h1>System Health</h1>
      <button class="refresh-btn" (click)="checkHealth()">
        <span class="material-icons">refresh</span> Refresh
      </button>
    </div>

    <div class="health-grid">
      <!-- API Status -->
      <div class="health-card">
        <h3>API Status</h3>
        @if (apiStatus() === 'loading') {
          <div class="status-indicator loading">Checking...</div>
        } @else if (apiStatus() === 'ok') {
          <div class="status-indicator ok"><span class="material-icons">check_circle</span> Online</div>
        } @else {
          <div class="status-indicator error"><span class="material-icons">error</span> Offline</div>
        }
        <div class="meta-info">Endpoint: {{ apiUrl }}</div>
      </div>

      <!-- Environment -->
      <div class="health-card">
        <h3>Environment</h3>
        <div class="env-vars">
          <div class="env-var">
            <span class="key">NODE_ENV</span>
            <span class="value">{{ isProd ? 'production' : 'development' }}</span>
          </div>
          <div class="env-var">
            <span class="key">Angular Version</span>
            <span class="value">v17+</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }
      .admin-page-header h1 {
        font-family: 'Playfair Display', serif;
        font-size: 1.8rem;
        color: var(--ink);
        margin: 0;
      }
      .refresh-btn {
        background: var(--white);
        border: 1.5px solid var(--border);
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-family: 'DM Sans', sans-serif;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: background 0.2s;
      }
      .refresh-btn:hover { background: var(--stripe); }
      .refresh-btn .material-icons { font-size: 1.1rem; }

      .health-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
      }
      .health-card {
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 12px;
        padding: 1.5rem;
      }
      .health-card h3 {
        margin: 0 0 1rem;
        font-size: 1.1rem;
        color: var(--ink);
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-family: 'DM Mono', monospace;
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }
      .status-indicator.ok { color: var(--green); }
      .status-indicator.error { color: var(--red); }
      .status-indicator.loading { color: var(--muted); }

      .meta-info {
        font-family: 'DM Mono', monospace;
        font-size: 0.8rem;
        color: var(--muted);
      }

      .env-vars {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .env-var {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        background: var(--stripe);
        border-radius: 6px;
        font-family: 'DM Mono', monospace;
        font-size: 0.85rem;
      }
      .env-var .key { color: var(--muted); }
      .env-var .value { font-weight: 600; color: var(--ink); }
    `
  ]
})
export class AdminSystemComponent implements OnInit {
  private readonly http = inject(HttpClient);
  
  protected readonly apiUrl = environment.apiBaseUrl;
  protected readonly isProd = environment.production;
  
  protected apiStatus = signal<'loading' | 'ok' | 'error'>('loading');

  ngOnInit() {
    this.checkHealth();
  }

  checkHealth() {
    this.apiStatus.set('loading');
    // Call the public health endpoint
    this.http.get(`${this.apiUrl}/health`).subscribe({
      next: () => this.apiStatus.set('ok'),
      error: () => this.apiStatus.set('error')
    });
  }
}
