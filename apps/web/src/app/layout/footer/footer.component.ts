import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'md-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer>
      <div class="footer-brand">More<span>Dutch</span></div>
      <div class="footer-meta">
        <span>Interactive Hub</span>
        <span class="dot"></span>
        <span>A1&ndash;B1 Level</span>
      </div>
      <div class="footer-credit">
        Made by
        <a href="https://soylu.dev" target="_blank" rel="noopener">soylu.dev</a>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
