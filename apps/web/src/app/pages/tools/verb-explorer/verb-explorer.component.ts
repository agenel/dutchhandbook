import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import type { Verb } from '@moredutch/shared';
import { ContentService } from '../../../core/content.service';
import { MetaService } from '../../../core/meta.service';
import { HelpDialogComponent } from '../../../layout/help-dialog/help-dialog.component';

const MASTERED_VERBS_KEY = 'dgh_mastered_verbs';

type VerbWithLegacyFields = Verb & {
  id?: number;
  rank?: number;
  helper?: string;
  level?: string;
  separable?: boolean;
  example_en?: string;
  conjugations?: {
    ik?: string;
    jij?: string;
    hij?: string;
    wij?: string;
    jullie?: string;
    zij?: string;
    imperfectum_sg?: string;
    imperfectum_pl?: string;
    perfectum?: string;
  };
};

@Component({
  selector: 'md-verb-explorer',
  standalone: true,
  imports: [FormsModule, HelpDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero" style="border-bottom:none; padding-bottom: 1rem;">
      <h1>
        Verb <em>Explorer</em>
        <button class="help-trigger" type="button" title="How it works" (click)="helpOpen = true">
          <span class="material-icons">help_outline</span>
        </button>
      </h1>
      <p class="hero-desc">
        All 200 most common Dutch verbs. Search, filter by level or type, and track your mastery.
      </p>
    </div>

    <md-help-dialog [(visible)]="helpOpen" title="Verb Explorer <em>Guide</em>">
      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--orange);">search</span>
          <h3 style="margin:0;">Search & Filter</h3>
        </div>
        <p>
          Find any verb by Dutch or English. Filter by type (regular/irregular) or CEFR level to
          focus your study.
        </p>
      </div>
      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--blue);">list_alt</span>
          <h3 style="margin:0;">Full Conjugations</h3>
        </div>
        <p>
          Click any verb to see its full forms in Present, Past, and Perfect tenses. Perfect for
          checking tricky irregulars.
        </p>
      </div>
      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--blue);">trending_up</span>
          <h3 style="margin:0;">Build Muscle Memory</h3>
        </div>
        <p>
          This tool is designed for high-speed repetition. The goal is to reach a point where your
          choices are automatic.
        </p>
      </div>
    </md-help-dialog>

    <div style="display:flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: flex-end;">
      <div class="search-container" style="flex:1; min-width:200px;">
        <span class="material-icons">search</span>
        <input
          type="text"
          placeholder="Search by Dutch or English..."
          [ngModel]="query()"
          (ngModelChange)="query.set($event)"
        />
      </div>
      <div class="filters">
        <div class="filter-group">
          <label>Mastery</label>
          <select [ngModel]="masteryFilter()" (ngModelChange)="masteryFilter.set($event)">
            <option value="all">All Verbs</option>
            <option value="unmastered">Unmastered Only</option>
            <option value="mastered">Mastered Only</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Type</label>
          <select [ngModel]="typeFilter()" (ngModelChange)="typeFilter.set($event)">
            <option value="all">All Types</option>
            <option value="regular">Regular</option>
            <option value="irregular">Irregular</option>
            <option value="modal">Modal</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Level</label>
          <select [ngModel]="levelFilter()" (ngModelChange)="levelFilter.set($event)">
            <option value="all">All Levels</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
          </select>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <div class="progress-container">
        <div
          class="progress-fill"
          [style.width.%]="masteryPct()"
          [style.background]="masteredCount() === verbs().length ? 'var(--gold)' : null"
        ></div>
        <div class="progress-text">
          <strong>{{ masteredCount() }}/{{ verbs().length || 200 }}</strong> Verbs Mastered
        </div>
      </div>
    </div>

    <div class="verb-table-container">
      <table class="verb-table">
        <thead>
          <tr>
            <th class="col-rank">#</th>
            <th>Infinitive</th>
            <th>English</th>
            <th class="col-type">Type</th>
            <th class="col-helper">Helper</th>
            <th class="col-level">Level</th>
            <th style="text-align:right;">Done</th>
          </tr>
        </thead>
        <tbody>
          @if (filtered().length === 0) {
            <tr>
              <td colspan="7" style="text-align:center;padding:2rem;color:var(--muted);">
                No verbs found. Try adjusting your filters.
              </td>
            </tr>
          } @else {
            @for (verb of filtered(); track verb.id ?? verb.infinitive) {
              <tr
                [style.opacity]="isMastered(verb) ? '0.6' : '1'"
                (click)="openDetail(verb)"
                tabindex="0"
                (keydown.enter)="openDetail(verb)"
              >
                <td class="col-rank">{{ verb.rank }}</td>
                <td><span class="verb-infinitive">{{ verb.infinitive }}</span></td>
                <td><span class="verb-meaning">{{ verb.english }}</span></td>
                <td class="col-type"><span class="verb-type">{{ verb.type }}</span></td>
                <td class="col-helper"><span class="verb-type">{{ verb.helper }}</span></td>
                <td class="col-level"><span class="pill" style="font-size:0.6rem;">{{ verb.level }}</span></td>
                <td style="text-align:right;">
                  @if (isMastered(verb)) {
                    <span
                      class="material-icons"
                      style="color:var(--green);font-size:1.1rem;vertical-align:middle;"
                      >check_circle</span
                    >
                  } @else {
                    <span
                      class="material-icons"
                      style="color:var(--border);font-size:1.1rem;vertical-align:middle;"
                      >radio_button_unchecked</span
                    >
                  }
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>

    @if (selectedVerb(); as verb) {
      <div class="detail-overlay" style="display:block;" (click)="closeDetail()"></div>
      <div class="detail-panel active">
        <div class="detail-header">
          <div class="detail-title">
            <h2>{{ verb.infinitive }}</h2>
            <p>{{ verb.english }}</p>
          </div>
          <button class="close-detail" type="button" (click)="closeDetail()">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; gap:0.5rem; flex-wrap:wrap;">
          <div class="tool-tag">{{ typeLabel(verb) }}</div>
          <button
            type="button"
            class="fc-btn"
            style="padding:0.4rem 0.9rem; font-size:0.75rem;"
            [class.mastered]="isMastered(verb)"
            (click)="toggleMastery(verb); $event.stopPropagation()"
          >
            {{ isMastered(verb) ? '✓ Mastered' : 'Mark as Mastered' }}
          </button>
        </div>

        <div class="example" style="margin-bottom:1.5rem;">
          <span class="nl">{{ verb.example }}</span>
          <span class="en">{{ verb.example_en }}</span>
        </div>

        <div class="conjugation-grid">
          <div class="conj-box">
            <h4>Present Tense</h4>
            <div class="conj-row">
              <span class="conj-pronoun">ik</span><span class="conj-verb">{{ conjugations(verb).ik }}</span>
            </div>
            <div class="conj-row">
              <span class="conj-pronoun">jij / je</span><span class="conj-verb">{{ conjugations(verb).jij }}</span>
            </div>
            <div class="conj-row">
              <span class="conj-pronoun">hij / zij / u</span><span class="conj-verb">{{ conjugations(verb).hij }}</span>
            </div>
            <div class="conj-row">
              <span class="conj-pronoun">wij / jullie / zij</span><span class="conj-verb">{{ conjugations(verb).wij }}</span>
            </div>
          </div>
          <div class="conj-box">
            <h4>Past & Perfect</h4>
            <div class="conj-row">
              <span class="conj-pronoun">past (sg)</span
              ><span class="conj-verb">{{ conjugations(verb).imperfectum_sg }}</span>
            </div>
            <div class="conj-row">
              <span class="conj-pronoun">past (pl)</span
              ><span class="conj-verb">{{ conjugations(verb).imperfectum_pl }}</span>
            </div>
            <div
              class="conj-row"
              style="margin-top:0.6rem;padding-top:0.6rem;border-top:1.5px solid var(--border);"
            >
              <span class="conj-pronoun">perfect</span>
              <span class="conj-verb" style="color:var(--orange)">{{
                conjugations(verb).perfectum
              }}</span>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .filters {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: flex-end;
      }
      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .filter-group label {
        font-family: 'DM Mono', monospace;
        font-size: 0.6rem;
        text-transform: uppercase;
        color: var(--muted);
        letter-spacing: 0.05em;
      }
      select {
        padding: 0.6rem 1rem;
        border-radius: 8px;
        border: 1.5px solid var(--border);
        background: var(--white);
        font-family: 'DM Sans', sans-serif;
        font-size: 0.85rem;
        color: var(--ink);
        outline: none;
        cursor: pointer;
      }
      select:focus {
        border-color: var(--orange);
      }
      .verb-table tbody tr {
        cursor: pointer;
      }
      .col-rank {
        font-family: 'DM Mono', monospace;
        font-size: 0.7rem;
        color: var(--muted);
      }
      .fc-btn.mastered {
        background: var(--green);
        color: #fff;
        border-color: var(--green);
      }
    `,
  ],
})
export class VerbExplorerComponent {
  private readonly content = inject(ContentService);

  protected readonly verbs = toSignal(this.content.verbs(), {
    initialValue: [] as VerbWithLegacyFields[],
  });
  protected readonly query = signal('');
  protected readonly typeFilter = signal('all');
  protected readonly levelFilter = signal('all');
  protected readonly masteryFilter = signal('all');
  protected readonly selectedVerb = signal<VerbWithLegacyFields | null>(null);
  protected helpOpen = false;
  protected readonly masteredIds = signal<number[]>(this.readMasteredIds());

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const type = this.typeFilter();
    const level = this.levelFilter();
    const mastery = this.masteryFilter();
    const all = this.verbs();
    return all.filter((v) => {
      const mastered = this.isMastered(v);
      if (mastery === 'mastered' && !mastered) return false;
      if (mastery === 'unmastered' && mastered) return false;
      if (type !== 'all' && v.type !== type) return false;
      if (level !== 'all' && v.level !== level) return false;
      if (q) {
        const haystack = `${v.infinitive} ${v.english}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  });

  protected readonly masteredCount = computed(
    () => this.masteredIds().filter((id) => this.verbs().some((v) => v.id === id)).length,
  );

  protected readonly masteryPct = computed(() => {
    const total = this.verbs().length || 200;
    return (this.masteredCount() / total) * 100;
  });

  constructor() {
    inject(MetaService).set({
      title: 'Dutch Verb Explorer — Conjugations & Search | More Dutch',
      description:
        'Search and filter the most common Dutch verbs. Conjugations and example sentences for every verb.',
      canonicalPath: '/tools/verb-explorer',
    });

    effect(() => {
      localStorage.setItem(MASTERED_VERBS_KEY, JSON.stringify(this.masteredIds()));
    });
  }

  protected openDetail(verb: VerbWithLegacyFields): void {
    this.selectedVerb.set(verb);
    document.body.style.overflow = 'hidden';
  }

  protected closeDetail(): void {
    this.selectedVerb.set(null);
    document.body.style.overflow = '';
  }

  protected isMastered(verb: VerbWithLegacyFields): boolean {
    return verb.id !== undefined && this.masteredIds().includes(verb.id);
  }

  protected toggleMastery(verb: VerbWithLegacyFields): void {
    if (verb.id === undefined) return;
    this.masteredIds.update((ids) =>
      ids.includes(verb.id!) ? ids.filter((id) => id !== verb.id) : [...ids, verb.id!],
    );
  }

  protected typeLabel(verb: VerbWithLegacyFields): string {
    return `${verb.type ?? ''}${verb.separable ? ' · separable' : ''}`;
  }

  protected conjugations(verb: VerbWithLegacyFields): NonNullable<VerbWithLegacyFields['conjugations']> {
    return verb.conjugations ?? {
      ik: verb.ik,
      jij: verb.jij,
      hij: verb.hij,
      wij: verb.wij,
      imperfectum_sg: verb.past,
      perfectum: verb.participle,
    };
  }

  private readMasteredIds(): number[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(MASTERED_VERBS_KEY) ?? '[]');
      return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : [];
    } catch {
      return [];
    }
  }
}
