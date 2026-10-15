import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  PLATFORM_ID,
  effect,
  inject,
  input,
  model,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'md-help-dialog',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="help-modal active"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="'Help'"
        (click)="closeFromBackdrop($event)"
      >
        <div class="help-content">
          <button class="help-close" type="button" aria-label="Close help" (click)="visible.set(false)">
            <span class="material-icons">close</span>
          </button>
          <div class="help-body">
            <h2
              style="background: linear-gradient(to right, var(--ink), var(--orange)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"
              [innerHTML]="title()"
            ></h2>
            <ng-content />
            <div style="margin-top: 2rem; border-top: 1.5px solid var(--border); padding-top: 1.5rem;">
              <a
                routerLink="/help"
                class="fc-btn"
                style="width: 100%; justify-content: center; display: flex; gap: 0.5rem; background: var(--orange-bg); border-color: var(--orange-border); color: var(--orange);"
                (click)="visible.set(false)"
              >
                Full Platform Guide <span class="material-icons">menu_book</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class HelpDialogComponent {
  readonly visible = model<boolean>(false);
  readonly title = input<string>('How it works');

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    // Lock background scroll while the dialog is open; always release on destroy.
    effect(() => {
      if (!this.isBrowser) return;
      document.body.style.overflow = this.visible() ? 'hidden' : '';
    });
    inject(DestroyRef).onDestroy(() => {
      if (this.isBrowser) document.body.style.overflow = '';
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible()) this.visible.set(false);
  }

  closeFromBackdrop(event: MouseEvent): void {
    if (event.target instanceof HTMLElement && event.target.classList.contains('help-modal')) {
      this.visible.set(false);
    }
  }
}
