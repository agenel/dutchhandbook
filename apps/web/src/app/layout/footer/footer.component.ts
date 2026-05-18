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
      <div class="footer-support" style="margin-top: 1rem; display: flex; justify-content: center;">
        <a href="https://www.buymeacoffee.com/moredutch" target="_blank" rel="noopener noreferrer" class="bmc-btn">
          <span class="bmc-emoji">☕</span>
          <span class="bmc-text">Buy me a coffee</span>
        </a>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
