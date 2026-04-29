import { NgComponentOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { getSheet, type SheetMeta } from '@moredutch/shared';
import { catchError, map, of, switchMap } from 'rxjs';
import { MetaService } from '../../core/meta.service';
import { ProgressService } from '../../core/progress.service';
import { SheetContentRegistry } from './sheet-content.registry';

@Component({
  selector: 'md-sheet-page',
  standalone: true,
  imports: [RouterLink, ButtonModule, NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (sheet(); as s) {
      @if (legacyHtml()) {
        <article
          class="legacy-sheet-content"
          [innerHTML]="legacyHtml()"
          (click)="handleLegacyClick($event)"
        ></article>
      } @else {
        <div class="hero">
          <div class="hero-layout">
            <div class="hero-title">
              <h1>{{ s.title }}</h1>
            </div>
            <div class="hero-content">
              <p class="hero-desc">{{ s.description }}</p>
              <div class="hero-pills">
                <div class="pill">{{ s.level }}</div>
                <div class="pill">{{ s.category }}</div>
              </div>
            </div>
          </div>
        </div>

        <article class="sheet-content">
          @if (contentComponent()) {
            <ng-container *ngComponentOutlet="contentComponent()!" />
          } @else {
            <div class="placeholder-card">
              <p>
                The full interactive content for <strong>{{ s.title }}</strong> is being migrated.
                The original module is available in the legacy site for reference.
              </p>
              <p>
                Until then, here's what this sheet covers: <em>{{ s.description }}</em>
              </p>
            </div>
          }
        </article>

        <div class="sheet-footer">
          <button
            type="button"
            class="mastery-toggle"
            [class.mastered]="progress.isMastered(s.slug)"
            (click)="toggleMastery(s.slug)"
          >
            @if (progress.isMastered(s.slug)) {
              Mastered <span class="material-icons">check_circle</span>
            } @else {
              Mark as Mastered <span class="material-icons">check_circle_outline</span>
            }
          </button>

          <nav class="sheet-nav">
            @if (s.prev) {
              <a [routerLink]="['/sheets', s.prev]" class="fc-btn">
                <span class="material-icons">arrow_back</span> Previous
              </a>
            }
            @if (s.next) {
              <a [routerLink]="['/sheets', s.next]" class="fc-btn">
                Next <span class="material-icons">arrow_forward</span>
              </a>
            }
          </nav>
        </div>
      }
    } @else {
      <div class="placeholder-card">
        <h2>Sheet not found</h2>
        <p>
          This module doesn't exist. Browse all
          <a routerLink="/cheatsheets">15 cheat sheets</a> instead.
        </p>
      </div>
    }
  `,
  styles: [
    `
      .placeholder-card {
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 16px;
        padding: 2rem;
        margin: 2rem 0;
        color: var(--ink);
      }
      .sheet-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1.5px solid var(--border);
      }
      .sheet-nav {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
      }
      .legacy-sheet-content {
        display: contents;
      }
    `,
  ],
})
export class SheetPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly meta = inject(MetaService);
  private readonly registry = inject(SheetContentRegistry);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly progress = inject(ProgressService);

  private readonly params = toSignal<ParamMap | null>(this.route.paramMap, { initialValue: null });

  protected readonly legacyHtml = toSignal<SafeHtml | null>(
    this.route.paramMap.pipe(
      switchMap((params) => {
        const slug = params.get('slug');
        if (!slug) return of(null);
        return this.http
          .get(`/assets/data/sheet-html/${slug}.html`, { responseType: 'text' })
          .pipe(
            map((html) =>
              this.sanitizer.bypassSecurityTrustHtml(this.renderLegacyMasteryState(html, slug)),
            ),
            catchError(() => of(null)),
          );
      }),
    ),
    { initialValue: null },
  );

  protected readonly sheet = computed<SheetMeta | undefined>(() => {
    const slug = this.params()?.get('slug') ?? '';
    const s = getSheet(slug);
    if (s) {
      this.meta.set({
        title: `${s.title} — More Dutch`,
        description: s.description,
        canonicalPath: `/sheets/${s.slug}`,
        type: 'article',
      });
    }
    return s;
  });

  protected readonly contentComponent = computed(() => {
    const s = this.sheet();
    return s ? this.registry.get(s.slug) : null;
  });

  toggleMastery(slug: string): void {
    this.progress.setMastered(slug, !this.progress.isMastered(slug));
  }

  handleLegacyClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const flashcardToggle = target.closest('#fc-toggle');
    if (flashcardToggle) {
      event.preventDefault();
      flashcardToggle.classList.toggle('active');
      this.themeToggleFlashcard();
      return;
    }

    const masteryToggle = target.closest('.mastery-toggle');
    if (masteryToggle) {
      event.preventDefault();
      const sheetSlug = masteryToggle.getAttribute('data-sheet') ?? this.sheet()?.slug;
      if (sheetSlug) {
        const mastered = !this.progress.isMastered(sheetSlug);
        this.progress.setMastered(sheetSlug, mastered);
        this.applyMasteryButtonState(masteryToggle, mastered);
      }
      return;
    }

    const helpTrigger = target.closest('#help-trigger');
    if (helpTrigger) {
      event.preventDefault();
      this.setLegacyHelpOpen(true);
      return;
    }

    if (target.closest('#help-close')) {
      event.preventDefault();
      this.setLegacyHelpOpen(false);
      return;
    }

    if (target.classList.contains('help-modal')) {
      this.setLegacyHelpOpen(false);
    }
  }

  private themeToggleFlashcard(): void {
    document.body.classList.toggle('flashcard-mode');
    localStorage.setItem('dgh_flashcard_mode', String(document.body.classList.contains('flashcard-mode')));
  }

  private renderLegacyMasteryState(html: string, slug: string): string {
    const template = document.createElement('template');
    template.innerHTML = html;
    template.content.querySelectorAll('.mastery-toggle').forEach((button) => {
      const sheetSlug = button.getAttribute('data-sheet') ?? slug;
      this.applyMasteryButtonState(button, this.progress.isMastered(sheetSlug));
    });
    return template.innerHTML;
  }

  private applyMasteryButtonState(button: Element, mastered: boolean): void {
    button.classList.toggle('mastered', mastered);
    button.innerHTML = mastered
      ? 'Mastered <span class="material-icons">check_circle</span>'
      : 'Mark as Mastered <span class="material-icons">check_circle_outline</span>';
  }

  private setLegacyHelpOpen(open: boolean): void {
    const modal = document.getElementById('help-modal');
    if (!modal) return;
    modal.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
}
