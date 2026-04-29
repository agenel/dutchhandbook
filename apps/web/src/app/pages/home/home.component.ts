import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TOOL_REGISTRY } from '@moredutch/shared';
import { MetaService } from '../../core/meta.service';
import { ProgressService } from '../../core/progress.service';
import { HelpDialogComponent } from '../../layout/help-dialog/help-dialog.component';

@Component({
  selector: 'md-home',
  standalone: true,
  imports: [RouterLink, HelpDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero" style="border-bottom:none; padding-top:1rem;">
      <div class="hero-layout">
        <div class="hero-title">
          <h1>
            Dutch<br /><em>Language</em><br />Hub
            <button
              class="help-trigger"
              type="button"
              title="How it works"
              (click)="helpOpen = true"
            >
              <span class="material-icons">help_outline</span>
            </button>
          </h1>
        </div>
        <div class="hero-content">
          <p class="hero-desc">
            Your central platform for mastering Dutch. Interactive tools to practice verbs,
            vocabulary, and grammar rules — all in one place.
          </p>
          <div class="hero-pills">
            <div class="pill">Interactive Tools</div>
            <div class="pill">15 Cheat Sheets</div>
            <div class="pill">A1 — B1</div>
          </div>
        </div>
      </div>
    </div>

    <md-help-dialog [(visible)]="helpOpen" title="Hub <em>Dashboard</em>">
      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--orange);">dashboard</span>
          <h3 style="margin:0;">Welcome to More Dutch</h3>
        </div>
        <p>
          Your central dashboard for Dutch learning. From here, you can track your overall
          progress, access the library, and dive into practice tools.
        </p>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--green);">trending_up</span>
          <h3 style="margin:0;">Mastery Progress</h3>
        </div>
        <p>
          The progress bar above tracks how many grammar modules you've marked as
          <strong>Mastered</strong>. Can you reach 100%?
        </p>
        <div style="background:var(--stripe); padding:1rem; border-radius:12px; border:1px solid var(--border); margin-top:0.5rem;">
          <div class="color-block"><div class="cb-dot" style="background:var(--orange)"></div><span><strong>Orange</strong>: A1 Beginner</span></div>
          <div class="color-block"><div class="cb-dot" style="background:var(--green)"></div><span><strong>Green</strong>: A2 Elementary</span></div>
          <div class="color-block"><div class="cb-dot" style="background:var(--blue)"></div><span><strong>Blue</strong>: B1 Intermediate</span></div>
        </div>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--blue);">map</span>
          <h3 style="margin:0;">Learning Roadmap</h3>
        </div>
        <p>
          The Roadmap section provides a guided path through Dutch grammar. Follow the topics in
          order to build a solid foundation.
        </p>
      </div>
    </md-help-dialog>

    <div class="section-title">
      Grammar Cheat Sheets
      <div class="title-line"></div>
    </div>

    <div
      class="sheets-bar"
      style="display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 1.5rem; background: var(--white); border-radius: 16px; border: 1.5px solid var(--border); margin-bottom: 2.5rem; gap: 1.5rem; flex-wrap: wrap;"
    >
      <div style="display:flex; align-items:center; gap:1rem; flex:1; min-width:250px;">
        <span class="material-icons" style="font-size:1.8rem; color:var(--orange);"
          >library_books</span
        >
        <div style="text-align:left;">
          <span style="font-weight:700; font-size:1.1rem; display:block; margin-bottom:0.1rem;"
            >15 Grammar Modules</span
          >
          <p style="color:var(--muted); margin:0; line-height:1.4; font-size:0.85rem;">
            The complete library of A1 to B1 grammar cheat sheets.
          </p>
        </div>
      </div>
      <a
        routerLink="/cheatsheets"
        class="fc-btn"
        style="padding:0.6rem 1.2rem; font-size:0.85rem; display:flex; align-items:center; gap:0.4rem; white-space:nowrap;"
      >
        Browse All <span class="material-icons" style="font-size:1.1rem;">arrow_forward</span>
      </a>
    </div>

    <div class="progress-container" style="margin-bottom:2.5rem;">
      <div class="progress-fill" [style.width.%]="masteryPct()"></div>
      <div class="progress-text">
        <strong>{{ mastered() }}/{{ total }}</strong> Modules Mastered
      </div>
    </div>

    <div class="section-title">
      Interactive Practice Tools
      <div class="title-line"></div>
    </div>

    <div class="tools-grid">
      @for (tool of tools; track tool.slug) {
        <a [routerLink]="['/tools', tool.slug]" class="tool-card">
          <div class="tool-icon" [attr.aria-label]="tool.title + ' Icon'">
            <span class="material-icons">{{ tool.icon }}</span>
          </div>
          <div class="tool-info">
            <h3>{{ tool.title }}</h3>
            <p>{{ tool.description }}</p>
          </div>
          <div class="tool-tag">{{ tool.tag }}</div>
        </a>
      }
    </div>
  `,
})
export class HomeComponent {
  private readonly meta = inject(MetaService);
  private readonly progress = inject(ProgressService);
  protected readonly tools = TOOL_REGISTRY;

  protected readonly total = 15;
  protected readonly mastered = computed(() => this.progress.masteredCount());
  protected readonly masteryPct = computed(() =>
    Math.round((this.mastered() / this.total) * 100),
  );

  protected helpOpen = false;

  constructor() {
    this.meta.set({
      title: 'More Dutch — Interactive Dutch Grammar Hub & Cheat Sheets',
      description:
        'The ultimate interactive hub for Dutch learners. Master A1-B1 grammar with 15+ cheat sheets, verb explorers, flashcards, and drills. Start learning for free at More Dutch.',
      canonicalPath: '/',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'More Dutch Hub',
        url: 'https://moredutch.com',
        description:
          'Interactive tools and grammar cheat sheets for learning Dutch (A1-B1).',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        author: { '@type': 'Organization', name: 'More Dutch', url: 'https://moredutch.com' },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      },
    });
  }
}
