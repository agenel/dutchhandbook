import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SHEET_REGISTRY, type CefrLevel, type SheetMeta } from '@moredutch/shared';
import { MetaService } from '../../core/meta.service';
import { ProgressService } from '../../core/progress.service';
import { HelpDialogComponent } from '../../layout/help-dialog/help-dialog.component';

type LevelFilter = 'all' | CefrLevel;

@Component({
  selector: 'md-cheatsheets',
  standalone: true,
  imports: [RouterLink, FormsModule, ButtonModule, InputTextModule, HelpDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero" style="border-bottom:none; padding-top:1rem;">
      <div class="hero-layout">
        <div class="hero-title">
          <h1>
            Grammar<br /><em>Cheat</em><br />Sheets
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
            All 15 grammar modules in one place. Study each topic, track your mastery, and use Test
            Mode to quiz yourself.
          </p>
          <div class="hero-pills">
            <div class="pill">15 Modules</div>
            <div class="pill">A1 — B1</div>
            <div class="pill">Test Mode</div>
          </div>
        </div>
      </div>
    </div>

    <md-help-dialog [(visible)]="helpOpen" title="Library <em>Help</em>">
      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--orange);">manage_search</span>
          <h3 style="margin:0;">Advanced Discovery</h3>
        </div>
        <p>
          Use the level pills (A1, A2, B1) and the search bar to find exactly what you need. Our
          search even looks inside the content of the modules!
        </p>
      </div>
      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--green);">verified</span>
          <h3 style="margin:0;">Mastery Badges</h3>
        </div>
        <p>
          Cards with a <span class="material-icons" style="font-size:1rem; color:var(--green); vertical-align:middle;">check_circle</span>
          checkmark are those you've marked as mastered.
        </p>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--blue);">palette</span>
          <h3 style="margin:0;">Visual Coding</h3>
        </div>
        <div style="background:var(--stripe); padding:1rem; border-radius:12px; border:1px solid var(--border); margin-top:0.5rem;">
          <div class="color-block"><div class="cb-dot" style="background:var(--orange)"></div><span><strong>Orange</strong>: A1 Beginner</span></div>
          <div class="color-block"><div class="cb-dot" style="background:var(--green)"></div><span><strong>Green</strong>: A2 Elementary</span></div>
          <div class="color-block"><div class="cb-dot" style="background:var(--blue)"></div><span><strong>Blue</strong>: B1 Intermediate</span></div>
        </div>
      </div>
    </md-help-dialog>

    <div class="section-title">
      Grammar Cheat Sheets
      <div class="title-line"></div>
      <button
        type="button"
        class="icon-toggle-btn"
        title="Toggle Mastered Modules"
        (click)="progress.toggleHideMastered()"
      >
        <span class="material-icons" [style.color]="progress.hideMastered() ? 'var(--orange)' : ''">
          {{ progress.hideMastered() ? 'visibility_off' : 'visibility' }}
        </span>
      </button>
    </div>

    <div
      class="dash-row"
      style="display:flex; gap:1rem; margin-bottom:2rem; flex-wrap:wrap;"
    >
      <div class="search-container" style="margin-bottom:0;">
        <span class="material-icons">search</span>
        <input
          type="text"
          placeholder="Search cheatsheets..."
          [ngModel]="search()"
          (ngModelChange)="search.set($event)"
        />
      </div>
      <div class="filter-bar" style="margin-bottom:0;">
        @for (level of levels; track level) {
          <button
            type="button"
            class="filter-pill"
            [class.active]="activeLevel() === level"
            (click)="activeLevel.set(level)"
          >
            {{ level === 'all' ? 'All' : level }}
          </button>
        }
      </div>
      <div
        class="progress-wrap"
        style="flex:1; min-width:250px; display:flex; flex-direction:column; justify-content:center;"
      >
        <div class="progress-container" style="margin-bottom:0;">
          <div class="progress-fill" [style.width.%]="masteryPct()"></div>
          <div class="progress-text">
            <strong>{{ progress.masteredCount() }}/{{ total }}</strong> Modules Mastered
          </div>
        </div>
      </div>
    </div>

    <div class="sheets-grid">
      @for (s of visible(); track s.slug) {
        <a
          [routerLink]="['/sheets', s.slug]"
          class="sheet-card"
          [class]="'sc-' + s.stripe"
          [class.mastered-card]="progress.isMastered(s.slug)"
        >
          <div class="mastery-badge"><span class="material-icons">check</span></div>
          <div class="card-stripe"></div>
          <div class="card-inner">
            <div class="card-icon"><span class="material-icons">{{ s.icon }}</span></div>
            <div class="card-level">{{ s.category }}</div>
            <div class="card-title">{{ s.title }}</div>
            <div class="card-desc">{{ s.description }}</div>
          </div>
          <div class="card-footer">
            <span>{{ s.footer }}</span>
            <span class="material-icons">arrow_forward</span>
          </div>
        </a>
      }
    </div>
  `,
})
export class CheatsheetsComponent {
  private readonly meta = inject(MetaService);
  protected readonly progress = inject(ProgressService);

  protected readonly sheets: readonly SheetMeta[] = SHEET_REGISTRY;
  protected readonly levels: LevelFilter[] = ['all', 'A1', 'A2', 'B1'];
  protected readonly total = SHEET_REGISTRY.length;

  protected readonly search = signal('');
  protected readonly activeLevel = signal<LevelFilter>('all');

  protected helpOpen = false;

  protected readonly visible = computed<readonly SheetMeta[]>(() => {
    const q = this.search().trim().toLowerCase();
    const lvl = this.activeLevel();
    const hide = this.progress.hideMastered();
    return this.sheets.filter((s) => {
      if (lvl !== 'all' && s.level !== lvl) return false;
      if (hide && this.progress.isMastered(s.slug)) return false;
      if (!q) return true;
      const haystack = `${s.title} ${s.description} ${s.footer} ${s.category}`.toLowerCase();
      return haystack.includes(q);
    });
  });

  protected readonly masteryPct = computed(() =>
    Math.round((this.progress.masteredCount() / this.total) * 100),
  );

  constructor() {
    this.meta.set({
      title: '15 Essential Dutch Grammar Cheat Sheets — More Dutch',
      description:
        'Browse 15 interactive Dutch grammar cheat sheets covering A1 to B1 levels. Master Dutch word order, verbs, negation, and more with our free library.',
      canonicalPath: '/cheatsheets',
    });
  }
}
