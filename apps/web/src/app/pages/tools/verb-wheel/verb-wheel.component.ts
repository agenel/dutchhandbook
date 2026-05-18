
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { Verb } from '@moredutch/shared';
import { ContentService } from '../../../core/content.service';
import { HelpDialogComponent } from '../../../layout/help-dialog/help-dialog.component';

type VerbExt = Verb & {
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
    imperfectum_sg?: string;
    imperfectum_pl?: string;
    perfectum?: string;
  };
};

type TenseKey = 'present' | 'past' | 'perfect';

interface WheelTense {
  key: TenseKey;
  label: string;
  dutchLabel: string;
  form: string;
  pronoun: string;
  color: string;
  bg: string;
  border: string;
  position: 'top' | 'left' | 'bottom';
}

@Component({
  selector: 'md-verb-wheel',
  standalone: true,
  imports: [FormsModule, RouterLink, HelpDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero" style="border-bottom:none; padding-bottom:1rem;">
      <h1>
        Conjugation <em>Wheel</em>
        <button class="help-trigger" type="button" title="How it works" (click)="helpOpen = true">
          <span class="material-icons">help_outline</span>
        </button>
      </h1>
      <p class="hero-desc">
        Visualize all tenses at once. Browse 200 verbs or switch to Drill Mode to test yourself.
      </p>
    </div>

    <md-help-dialog [(visible)]="helpOpen" title="Conjugation Wheel <em>Guide</em>">
      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--orange);">donut_large</span>
          <h3 style="margin:0;">The Four-Position Wheel</h3>
        </div>
        <p>
          Each verb is shown as a wheel of 3 tenses around a central infinitive. The <strong style="color:#c0392b;">red</strong> circle
          is the <em>Present</em> (O.T.T), the <strong style="color:#2c3e87;">blue</strong> is the <em>Past</em> (O.V.T),
          and the <strong style="color:#27ae60;">green</strong> is the <em>Perfect</em> (V.T.T).
        </p>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--blue);">sports_esports</span>
          <h3 style="margin:0;">Drill Mode</h3>
        </div>
        <p>
          Click <strong>Drill</strong> to enter practice mode. One tense circle is randomly hidden —
          type the correct conjugation and hit <em>Enter</em> or <strong>Check Answer</strong>. 
          Wrong? The correct form is revealed instantly. Your session score is tracked at the bottom.
        </p>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--green);">filter_list</span>
          <h3 style="margin:0;">Filters</h3>
        </div>
        <p>
          Use <strong>Level</strong> to focus on A1, A2, or B1 verbs. Use <strong>Type</strong> to isolate
          <em>Irregular</em> verbs — these are the most important to memorize as they don't follow predictable patterns.
        </p>
      </div>
    </md-help-dialog>

    <!-- Controls -->
    <div class="wheel-controls">
      <div class="filter-group">
        <label>Level</label>
        <select [ngModel]="levelFilter()" (ngModelChange)="levelFilter.set($event); resetIndex()">
          <option value="all">All Levels</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Type</label>
        <select [ngModel]="typeFilter()" (ngModelChange)="typeFilter.set($event); resetIndex()">
          <option value="all">All Types</option>
          <option value="irregular">Irregular</option>
          <option value="regular">Regular</option>
          <option value="modal">Modal</option>
        </select>
      </div>
      <div class="mode-toggle">
        <button
          type="button"
          class="mode-btn"
          [class.active]="!drillMode()"
          (click)="drillMode.set(false)"
        >
          <span class="material-icons">visibility</span> Browse
        </button>
        <button
          type="button"
          class="mode-btn"
          [class.active]="drillMode()"
          (click)="enterDrill()"
        >
          <span class="material-icons">sports_esports</span> Drill
        </button>
      </div>
    </div>

    @if (deck().length === 0) {
      <div class="empty-state">No verbs match your filters.</div>
    } @else {
      <!-- Counter & nav -->
      <div class="nav-row">
        <button class="nav-btn" type="button" (click)="prev()" [disabled]="cardIndex() === 0">
          <span class="material-icons">arrow_back</span>
        </button>
        <span class="counter">{{ cardIndex() + 1 }} / {{ deck().length }}</span>
        <button class="nav-btn" type="button" (click)="next()" [disabled]="cardIndex() === deck().length - 1">
          <span class="material-icons">arrow_forward</span>
        </button>
      </div>

      @if (currentVerb(); as verb) {
        <!-- Full table link -->
        <div class="mastery-row">
          <a [routerLink]="['/tools/verb-explorer']" class="explorer-link">
            <span class="material-icons" style="font-size:1rem;">travel_explore</span> Open in Verb Explorer
          </a>
        </div>

        <!-- Wheel -->
        <div class="wheel-wrap">
          <!-- Top: Present -->
          <div class="satellite-wrap top">
            <div class="tense-badge" style="background:#c0392b; color:#fff;">PRESENT / O.T.T</div>
            <div
              class="satellite present"
              [class.hidden-tense]="drillMode() && hiddenTense() === 'present'"
              [class.correct]="drillResult() === 'correct' && hiddenTense() === 'present'"
              [class.wrong]="drillResult() === 'wrong' && hiddenTense() === 'present'"
            >
              @if (drillMode() && hiddenTense() === 'present' && drillResult() === null) {
                <span class="pronoun-sm">ik</span>
                <input class="drill-input" #drillInput type="text"
                  [ngModel]="drillAnswer()" (ngModelChange)="drillAnswer.set($event)"
                  (keydown.enter)="checkDrill()"
                  placeholder="?" autofocus />
              } @else {
                <span class="pronoun-sm">ik</span>
                <span class="conj-form">{{ getConjugations(verb).ik }}</span>
                <span class="translation">{{ verbMeaning() }}</span>
              }
            </div>
          </div>

          <!-- Middle row: Past | Center | Perfect -->
          <div class="middle-row">
            <!-- Left: Past -->
            <div class="satellite-wrap left">
              <div class="tense-badge" style="background:#2c3e87; color:#fff;">PAST / O.V.T</div>
              <div
                class="satellite past"
                [class.hidden-tense]="drillMode() && hiddenTense() === 'past'"
                [class.correct]="drillResult() === 'correct' && hiddenTense() === 'past'"
                [class.wrong]="drillResult() === 'wrong' && hiddenTense() === 'past'"
              >
                @if (drillMode() && hiddenTense() === 'past' && drillResult() === null) {
                  <span class="pronoun-sm">ik</span>
                  <input class="drill-input" type="text"
                    [ngModel]="drillAnswer()" (ngModelChange)="drillAnswer.set($event)"
                    (keydown.enter)="checkDrill()"
                    placeholder="?" />
                } @else {
                  <span class="pronoun-sm">ik</span>
                  <span class="conj-form">{{ getConjugations(verb).imperfectum_sg }}</span>
                  <span class="translation">I saw</span>
                }
              </div>
            </div>

            <!-- Center -->
            <div class="center-circle">
              <span class="center-infinitive">{{ upperInfinitive() }}</span>
              <span class="center-divider"></span>
              <span class="center-translation">{{ verb.english }}</span>
            </div>

            <!-- Right: Perfect -->
            <div class="satellite-wrap right">
              <div class="tense-badge" style="background:#27ae60; color:#fff;">PERFECT / V.T.T</div>
              <div
                class="satellite perfect"
                [class.hidden-tense]="drillMode() && hiddenTense() === 'perfect'"
                [class.correct]="drillResult() === 'correct' && hiddenTense() === 'perfect'"
                [class.wrong]="drillResult() === 'wrong' && hiddenTense() === 'perfect'"
              >
                @if (drillMode() && hiddenTense() === 'perfect' && drillResult() === null) {
                  <input class="drill-input" type="text"
                    [ngModel]="drillAnswer()" (ngModelChange)="drillAnswer.set($event)"
                    (keydown.enter)="checkDrill()"
                    placeholder="?" />
                } @else {
                  <span class="conj-form" style="font-size:1.1rem;">{{ getConjugations(verb).perfectum }}</span>
                  <span class="translation">{{ 'have ' + verb.english.replace('to ','') }}</span>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Drill feedback -->
        @if (drillMode()) {
          <div class="drill-controls">
            @if (drillResult() === null) {
              <button type="button" class="check-btn" (click)="checkDrill()">
                Check Answer
              </button>
              <button type="button" class="skip-btn" (click)="nextDrill()">Skip</button>
            } @else {
              <div class="drill-feedback" [class.correct]="drillResult() === 'correct'" [class.wrong]="drillResult() === 'wrong'">
                @if (drillResult() === 'correct') {
                  <span class="material-icons">check_circle</span> Correct!
                } @else {
                  <span class="material-icons">cancel</span> Answer: <strong>{{ correctAnswer() }}</strong>
                }
              </div>
              <button type="button" class="check-btn" (click)="nextDrill()">
                Next <span class="material-icons">arrow_forward</span>
              </button>
            }
          </div>

          <!-- Drill score -->
          <div class="drill-score">
            Session: <strong>{{ drillCorrect() }} correct</strong> / {{ drillTotal() }} attempted
          </div>
        }

        <!-- Example sentence -->
        <div class="example-card">
          <span class="ex-nl">{{ verb.example }}</span>
          <span class="ex-en">{{ verb.example_en }}</span>
        </div>
      }
    }
  `,
  styles: [`
    .wheel-controls {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: flex-end;
      margin-bottom: 1.5rem;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .filter-group label {
      font-family: 'DM Mono', monospace;
      font-size: 0.6rem;
      text-transform: uppercase;
      color: var(--muted);
      letter-spacing: 0.05em;
    }
    select {
      padding: 0.55rem 1rem;
      border-radius: 8px;
      border: 1.5px solid var(--border);
      background: var(--white);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      color: var(--ink);
      outline: none;
      cursor: pointer;
    }
    select:focus { border-color: var(--orange); }

    .mode-toggle {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-left: auto;
    }
    .mode-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.55rem 1rem;
      border-radius: 10px;
      border: 1.5px solid var(--border);
      background: var(--white);
      color: var(--muted);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mode-btn .material-icons { font-size: 1rem; }
    .mode-btn.active {
      background: var(--orange);
      color: #fff;
      border-color: var(--orange);
    }

    .nav-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      margin-bottom: 0.75rem;
    }
    .nav-btn {
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 1.5px solid var(--border);
      background: var(--white);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .nav-btn:hover:not(:disabled) { border-color: var(--orange); color: var(--orange); }
    .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .counter {
      font-family: 'DM Mono', monospace;
      font-size: 0.9rem;
      color: var(--muted);
      min-width: 80px;
      text-align: center;
    }

    .mastery-row {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    .explorer-link {
      font-size: 0.85rem;
      color: var(--muted);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-weight: 500;
    }
    .explorer-link:hover { color: var(--orange); }

    /* === WHEEL === */
    .wheel-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      margin: 0 auto;
      max-width: 560px;
      user-select: none;
    }
    .middle-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      width: 100%;
    }
    .satellite-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .satellite-wrap.top { margin-bottom: -12px; z-index: 2; }
    .satellite-wrap.left { margin-right: -12px; z-index: 2; }
    .satellite-wrap.right { margin-left: -12px; z-index: 2; }

    .tense-badge {
      font-family: 'DM Mono', monospace;
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 0.25rem 0.7rem;
      border-radius: 999px;
    }

    .satellite {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.2rem;
      border: 3px solid transparent;
      transition: all 0.3s ease;
      position: relative;
      box-shadow: 0 4px 16px rgba(0,0,0,0.07);
    }
    .satellite.present {
      background: #fdf2f2;
      border-color: #c0392b;
    }
    .satellite.past {
      background: #eef2ff;
      border-color: #2c3e87;
    }
    .satellite.perfect {
      background: #edfdf5;
      border-color: #27ae60;
    }
    .satellite.hidden-tense {
      background: #f8f8f8;
      border-style: dashed;
      border-color: var(--border);
    }
    .satellite.correct { background: #d1fae5 !important; border-color: var(--green) !important; border-style: solid !important; }
    .satellite.wrong   { background: #fee2e2 !important; border-color: #ef4444 !important; border-style: solid !important; }

    .center-circle {
      width: 170px;
      height: 170px;
      border-radius: 50%;
      background: var(--orange);
      border: 4px solid #c05a1a;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 3;
      box-shadow: 0 6px 24px rgba(232,80,10,0.25);
      flex-shrink: 0;
    }
    .center-infinitive {
      font-family: 'Playfair Display', serif;
      font-size: 1.4rem;
      font-weight: 900;
      color: #fff;
      letter-spacing: 0.02em;
    }
    .center-divider {
      width: 40px;
      height: 2px;
      background: rgba(255,255,255,0.4);
      border-radius: 1px;
      margin: 0.3rem 0;
    }
    .center-translation {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.85);
      font-style: italic;
    }

    .pronoun-sm {
      font-family: 'DM Mono', monospace;
      font-size: 0.65rem;
      color: var(--muted);
    }
    .conj-form {
      font-family: 'Playfair Display', serif;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--ink);
    }
    .translation {
      font-size: 0.72rem;
      color: var(--muted);
      font-style: italic;
      text-align: center;
      padding: 0 0.5rem;
    }

    .drill-input {
      width: 80%;
      text-align: center;
      padding: 0.4rem 0.5rem;
      border-radius: 8px;
      border: 1.5px solid var(--orange);
      background: #fff;
      font-family: 'Playfair Display', serif;
      font-size: 1.1rem;
      outline: none;
      color: var(--ink);
    }

    .drill-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .check-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--orange);
      color: #fff;
      border: none;
      padding: 0.65rem 1.5rem;
      border-radius: 10px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .check-btn:hover { background: #c05a1a; }
    .check-btn .material-icons { font-size: 1rem; }
    .skip-btn {
      background: transparent;
      border: 1.5px solid var(--border);
      color: var(--muted);
      padding: 0.65rem 1.2rem;
      border-radius: 10px;
      font-family: 'DM Sans', sans-serif;
      cursor: pointer;
    }
    .drill-feedback {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 0.95rem;
      padding: 0.6rem 1.2rem;
      border-radius: 10px;
    }
    .drill-feedback.correct { color: var(--green); background: #d1fae5; }
    .drill-feedback.wrong { color: #dc2626; background: #fee2e2; }
    .drill-feedback .material-icons { font-size: 1.1rem; }

    .drill-score {
      text-align: center;
      font-size: 0.82rem;
      color: var(--muted);
      margin-top: 0.75rem;
      font-family: 'DM Mono', monospace;
    }

    .example-card {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      background: var(--stripe);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-top: 2rem;
      max-width: 560px;
      margin-left: auto;
      margin-right: auto;
    }
    .ex-nl { font-size: 1rem; font-weight: 600; color: var(--ink); }
    .ex-en { font-size: 0.85rem; color: var(--muted); font-style: italic; }

    .empty-state {
      text-align: center;
      padding: 4rem;
      color: var(--muted);
      font-size: 1rem;
    }

    @media (max-width: 520px) {
      .satellite { width: 120px; height: 120px; }
      .center-circle { width: 130px; height: 130px; }
      .center-infinitive { font-size: 1.1rem; }
      .conj-form { font-size: 1.1rem; }
      .wheel-controls { flex-direction: column; align-items: stretch; }
      .mode-toggle { margin-left: 0; }
    }
  `],
})
export class VerbWheelComponent {
  private readonly content = inject(ContentService);

  protected helpOpen = false;

  private readonly allVerbs = toSignal(this.content.verbs(), {
    initialValue: [] as VerbExt[],
  });

  protected readonly levelFilter = signal('all');
  protected readonly typeFilter = signal('all');
  protected readonly cardIndex = signal(0);
  protected readonly drillMode = signal(false);

  // Drill state
  protected readonly hiddenTense = signal<TenseKey>('present');
  protected readonly drillAnswer = signal('');
  protected readonly drillResult = signal<null | 'correct' | 'wrong'>(null);
  protected readonly drillCorrect = signal(0);
  protected readonly drillTotal = signal(0);

  protected readonly deck = computed(() => {
    const level = this.levelFilter();
    const type = this.typeFilter();
    return (this.allVerbs() as VerbExt[]).filter(v => {
      if (level !== 'all' && v.level !== level) return false;
      if (type !== 'all' && v.type !== type) return false;
      return true;
    });
  });

  protected readonly currentVerb = computed(() => this.deck()[this.cardIndex()] ?? null);

  protected readonly upperInfinitive = computed(() =>
    (this.currentVerb()?.infinitive ?? '').toUpperCase()
  );

  protected readonly verbMeaning = computed(() => {
    const eng = this.currentVerb()?.english ?? '';
    return 'I ' + eng.replace('to ', '');
  });

  protected readonly correctAnswer = computed(() => {
    const v = this.currentVerb();
    if (!v) return '';
    const c = this.getConjugations(v);
    const t = this.hiddenTense();
    if (t === 'present') return c.ik ?? '';
    if (t === 'past') return c.imperfectum_sg ?? '';
    if (t === 'perfect') return c.perfectum ?? '';
    return '';
  });

  constructor() {
    // When deck changes, clamp index
    effect(() => {
      const len = this.deck().length;
      if (this.cardIndex() >= len && len > 0) this.cardIndex.set(0);
    });
  }

  prev() { if (this.cardIndex() > 0) { this.cardIndex.update(i => i - 1); this.resetDrillState(); } }
  next() { if (this.cardIndex() < this.deck().length - 1) { this.cardIndex.update(i => i + 1); this.resetDrillState(); } }

  resetIndex() { this.cardIndex.set(0); this.resetDrillState(); }

  enterDrill() {
    this.drillMode.set(true);
    this.drillCorrect.set(0);
    this.drillTotal.set(0);
    this.pickHiddenTense();
    this.resetDrillState();
  }

  checkDrill() {
    const answer = this.drillAnswer().trim().toLowerCase();
    const correct = this.correctAnswer().trim().toLowerCase();
    this.drillTotal.update(n => n + 1);
    if (answer === correct) {
      this.drillResult.set('correct');
      this.drillCorrect.update(n => n + 1);
    } else {
      this.drillResult.set('wrong');
    }
    setTimeout(() => this.nextDrill(), 1600);
  }

  nextDrill() {
    this.next();
    this.pickHiddenTense();
    this.resetDrillState();
  }

  private pickHiddenTense() {
    const tenses: TenseKey[] = ['present', 'past', 'perfect'];
    this.hiddenTense.set(tenses[Math.floor(Math.random() * tenses.length)]);
  }

  private resetDrillState() {
    this.drillAnswer.set('');
    this.drillResult.set(null);
  }

  getConjugations(verb: VerbExt) {
    return verb.conjugations ?? {
      ik: (verb as any).ik,
      jij: (verb as any).jij,
      hij: (verb as any).hij,
      wij: (verb as any).wij,
      imperfectum_sg: (verb as any).past,
      imperfectum_pl: (verb as any).past,
      perfectum: (verb as any).participle,
    };
  }
}
