import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'md-admin-mail-templates',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Email Templates</h1>
        <p class="page-sub">Preview and verify the design of system-generated emails.</p>
      </div>
    </div>

    <div class="preview-layout">
      <div class="template-selector">
        <button 
          class="selector-btn" 
          [class.active]="activeTemplate() === 'verify'"
          (click)="selectTemplate('verify')"
        >
          <span class="material-icons">how_to_reg</span>
          <div class="btn-text">
            <strong>Verification Email</strong>
            <span>Sent after registration</span>
          </div>
        </button>

        <button 
          class="selector-btn" 
          [class.active]="activeTemplate() === 'reset'"
          (click)="selectTemplate('reset')"
        >
          <span class="material-icons">lock_reset</span>
          <div class="btn-text">
            <strong>Password Reset</strong>
            <span>Sent upon request</span>
          </div>
        </button>

        <div class="preview-info">
          <h3><span class="material-icons">info</span> Tips</h3>
          <ul>
            <li>Templates are responsive and tested for mobile.</li>
            <li>Brand colors and typography are unified.</li>
            <li>Links are dynamically generated in production.</li>
          </ul>
        </div>
      </div>

      <div class="preview-viewport">
        <div class="viewport-header">
          <div class="viewport-controls">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <div class="viewport-url">
            {{ activeTemplate() === 'verify' ? 'verification-email.html' : 'password-reset.html' }}
          </div>
        </div>
        <iframe [src]="previewUrl()" class="preview-iframe"></iframe>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-title { font-family: 'Playfair Display', serif; font-size: 2.2rem; margin-bottom: 0.5rem; color: var(--ink); }
    .page-sub { color: var(--muted); font-size: 1.1rem; }

    .preview-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 2rem;
      align-items: start;
    }

    .template-selector {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .selector-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: 16px;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s;
    }

    .selector-btn .material-icons {
      font-size: 1.8rem;
      color: var(--muted);
      transition: color 0.2s;
    }

    .selector-btn .btn-text {
      display: flex;
      flex-direction: column;
    }

    .selector-btn strong { font-size: 1rem; color: var(--ink); }
    .selector-btn span { font-size: 0.8rem; color: var(--muted); }

    .selector-btn:hover {
      border-color: var(--orange);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .selector-btn.active {
      border-color: var(--orange);
      background: var(--orange-bg);
    }

    .selector-btn.active .material-icons { color: var(--orange); }
    .selector-btn.active strong { color: var(--orange); }

    .preview-info {
      margin-top: 2rem;
      padding: 1.5rem;
      background: var(--stripe);
      border-radius: 16px;
    }

    .preview-info h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      color: var(--ink);
    }

    .preview-info ul {
      padding-left: 1.2rem;
      margin: 0;
      font-size: 0.85rem;
      color: var(--muted);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .preview-viewport {
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.05);
      height: 700px;
      display: flex;
      flex-direction: column;
    }

    .viewport-header {
      background: #f1f1f1;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      border-bottom: 1px solid var(--border);
    }

    .viewport-controls { display: flex; gap: 6px; margin-right: 1.5rem; }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot.red { background: #ff5f56; }
    .dot.yellow { background: #ffbd2e; }
    .dot.green { background: #27c93f; }

    .viewport-url {
      flex: 1;
      background: var(--white);
      border-radius: 6px;
      padding: 0.25rem 0.75rem;
      font-family: 'DM Mono', monospace;
      font-size: 0.75rem;
      color: var(--muted);
      text-align: center;
    }

    .preview-iframe {
      width: 100%;
      flex: 1;
      border: none;
      background: #f9f9f9;
    }

    @media (max-width: 1024px) {
      .preview-layout { grid-template-columns: 1fr; }
    }
  `],
})
export class AdminMailTemplatesComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly baseUrl = `${environment.apiBaseUrl}/mail-preview`;

  protected readonly activeTemplate = signal<'verify' | 'reset'>('verify');
  protected readonly previewUrl = signal<SafeResourceUrl>(
    this.sanitizer.bypassSecurityTrustResourceUrl(`${this.baseUrl}/verify`)
  );

  selectTemplate(type: 'verify' | 'reset') {
    this.activeTemplate.set(type);
    this.previewUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(`${this.baseUrl}/${type}`)
    );
  }
}
