import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let nextId = 0;

/**
 * Small inline flag marking a Dutch or English text. Drawn as SVG rather than an
 * emoji because Windows renders flag emoji as two letters. Decorative: the label
 * next to it carries the meaning, so it is hidden from screen readers.
 */
@Component({
  selector: 'md-lang-flag',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (lang() === 'nl') {
      <svg viewBox="0 0 9 6" aria-hidden="true" focusable="false">
        <rect width="9" height="2" fill="#AE1C28" />
        <rect y="2" width="9" height="2" fill="#FFFFFF" />
        <rect y="4" width="9" height="2" fill="#21468B" />
      </svg>
    } @else {
      <svg viewBox="0 0 60 30" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <clipPath [attr.id]="clipId">
          <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
        </clipPath>
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" stroke-width="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" [attr.clip-path]="'url(#' + clipId + ')'" stroke="#C8102E" stroke-width="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" stroke-width="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6" />
      </svg>
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        vertical-align: -0.12em;
        margin-right: 0.4em;
        line-height: 0;
      }
      svg {
        width: 1.35em;
        height: 0.9em;
        border-radius: 2px;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);
      }
    `,
  ],
})
export class LangFlagComponent {
  readonly lang = input.required<'nl' | 'en'>();
  protected readonly clipId = `md-uk-clip-${nextId++}`;
}
