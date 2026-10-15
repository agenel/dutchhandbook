import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'md-not-found',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="nf">
      <div class="nf-code">404</div>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or has moved.</p>
      <a routerLink="/" class="fc-btn nf-btn">
        <span class="material-icons">home</span> Back to home
      </a>
    </div>
  `,
  styles: [
    `
      .nf {
        max-width: 520px;
        margin: 4rem auto;
        text-align: center;
        padding: 2rem 1.5rem;
      }
      .nf-code {
        font-family: 'Playfair Display', serif;
        font-size: 5rem;
        font-weight: 900;
        line-height: 1;
        color: var(--orange, #e8500a);
      }
      .nf h1 { margin: 0.5rem 0 0.5rem; }
      .nf p { color: var(--text-muted, #6b7280); margin-bottom: 1.75rem; }
      .nf-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--orange-bg);
        border-color: var(--orange-border);
        color: var(--orange);
      }
    `,
  ],
})
export class NotFoundComponent {}
