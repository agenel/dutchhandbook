import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContentService } from '../../../core/content.service';
import { HelpDialogComponent } from '../../../layout/help-dialog/help-dialog.component';

interface SentenceChallenge {
  id: string;
  /** English meaning shown to learner. */
  english: string;
  /** Dutch words in the correct order. */
  words: string[];
  /** Optional rule label, e.g. "V2", "Inversion". */
  rule?: string;
  /** Short note on why this order is correct. */
  explanation?: string;
}

/** Curriculum order: the data file is sorted the same way, easiest rule first. */
const RULE_ORDER = [
  'Basic Word Order (V2)',
  'Adjectives & Articles',
  'Negation',
  'Yes/No Questions',
  'Wh-Questions',
  'Inversion',
  'Modal Verbs',
  'Separable Verbs',
  'Perfect Tense',
  'Subordinate Clauses',
];

@Component({
  selector: 'md-sentence-builder',
  standalone: true,
  imports: [HelpDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero">
      <h1>
        Sentence <em>Builder</em>
        <button class="help-trigger" type="button" title="How it works" (click)="helpOpen = true">
          <span class="material-icons">help_outline</span>
        </button>
      </h1>
      <p class="hero-desc">Master Dutch word order by assembling sentences block by block.</p>
    </div>

    <md-help-dialog [(visible)]="helpOpen" title="Sentence Builder <em>Guide</em>">
      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--orange);">gavel</span>
          <h3 style="margin:0;">The V2 Rule</h3>
        </div>
        <p>
          In a standard Dutch sentence, the <strong>conjugated verb</strong> is ALWAYS the 
          second element. This is known as the Verb-Second (V2) rule. 
          <em>(e.g., "Ik <strong>drink</strong> water")</em>.
        </p>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--blue);">swap_calls</span>
          <h3 style="margin:0;">Inversion</h3>
        </div>
        <p>
          If a sentence starts with something other than the subject (like a time or place), 
          the <strong>verb and subject swap places</strong> to keep the verb in the 2nd spot. 
          <em>(e.g., "Morgen <strong>drink ik</strong> water")</em>.
        </p>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--green);">format_align_right</span>
          <h3 style="margin:0;">Verb at the End</h3>
        </div>
        <p>
          If there is a second verb (like an infinitive or past participle), it almost always 
          goes to the <strong>very end</strong> of the sentence. 
          <em>(e.g., "Ik wil water <strong>drinken</strong>")</em>.
        </p>
      </div>
    </md-help-dialog>

    @if (challenges().length) {
      <div class="toolbar">
        <label class="rule-filter" for="sb-rule">
          <span>Rule</span>
          <select id="sb-rule" [value]="ruleFilter()" (change)="setRule($event)">
            <option value="all">All rules ({{ challenges().length }})</option>
            @for (r of rules(); track r.rule) {
              <option [value]="r.rule">{{ r.rule }} ({{ r.count }})</option>
            }
          </select>
        </label>
        @if (!finished()) {
          <span class="counter">Sentence {{ index() + 1 }} of {{ deck().length }}</span>
        }
      </div>
    }

    @if (finished()) {
      <div class="done" role="status">
        <span class="material-icons done-icon" aria-hidden="true">emoji_events</span>
        <h2>Set complete</h2>
        <p>
          You've completed all {{ deck().length }} sentences
          @if (ruleFilter() !== 'all') { for <strong>{{ ruleFilter() }}</strong> }.
        </p>
        <div class="controls">
          <button type="button" class="fc-btn" (click)="restart()">
            <span class="material-icons" aria-hidden="true">replay</span> Start this set again
          </button>
          @if (nextRule(); as nr) {
            <button type="button" class="fc-btn" (click)="selectRule(nr)">
              Next rule: {{ nr }} <span class="material-icons" aria-hidden="true">arrow_forward</span>
            </button>
          }
        </div>
      </div>
    } @else if (current(); as c) {
      <div class="prompt">
        <div class="english">{{ c.english }}</div>
        @if (c.rule) {
          <div class="rule-tag">{{ c.rule }}</div>
        }
      </div>

      <div class="answer">
        @for (w of placed(); track w.idx) {
          <button type="button" class="word placed" (click)="unplace(w.idx)">{{ w.text }}</button>
        }
      </div>

      <div class="bank">
        @for (w of bank(); track w.idx) {
          <button type="button" class="word" (click)="place(w.idx)">{{ w.text }}</button>
        }
      </div>

      <div class="controls">
        <button type="button" class="fc-btn" (click)="reset()">Reset</button>
        <button
          type="button"
          class="fc-btn"
          (click)="check()"
          [disabled]="placed().length !== c.words.length"
        >Check</button>
      </div>

      @if (verdict() === 'right') {
        <div class="feedback" role="status">
          <p class="ok">Correct!</p>
          @if (c.explanation) { <p class="why">{{ c.explanation }}</p> }
          <button type="button" class="fc-btn" (click)="nextChallenge()">
            {{ isLast() ? 'Finish set' : 'Next sentence' }}
            <span class="material-icons" style="vertical-align:middle; font-size:1.2rem;" aria-hidden="true">arrow_forward</span>
          </button>
        </div>
      } @else if (verdict() === 'wrong') {
        <div class="feedback" role="status">
          <p class="bad">Not quite. Try again.</p>
          @if (c.rule) { <p class="why">Hint: this sentence practises <strong>{{ c.rule }}</strong>.</p> }
        </div>
      }
    } @else {
      <p style="text-align:center; color:var(--muted);">Loading challenges…</p>
    }
  `,
  styles: [
    `
      .prompt {
        text-align: center;
        margin: 1.5rem 0;
      }
      .english {
        font-family: 'Playfair Display', serif;
        font-size: 1.6rem;
      }
      .rule-tag {
        display: inline-block;
        background: var(--orange-bg);
        color: var(--orange);
        padding: 0.2rem 0.7rem;
        border-radius: 12px;
        font-size: 0.75rem;
        margin-top: 0.4rem;
      }
      .answer,
      .bank {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        justify-content: center;
        min-height: 70px;
        padding: 1rem;
        border-radius: 16px;
        margin-bottom: 1rem;
      }
      .answer {
        background: var(--orange-bg);
        border: 2px dashed var(--orange-border);
      }
      .bank {
        background: var(--white);
        border: 1.5px solid var(--border);
      }
      .word {
        background: var(--cream);
        border: 1.5px solid var(--border);
        border-radius: 10px;
        padding: 0.6rem 1rem;
        font-family: 'DM Sans', sans-serif;
        font-size: 1.05rem;
        cursor: pointer;
        color: inherit;
      }
      .word {
        min-height: 44px;
      }
      .word.placed {
        background: var(--orange-fill);
        color: #fff;
        border-color: var(--orange-fill);
      }
      .toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
      .rule-filter {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: var(--muted);
      }
      .rule-filter select {
        font: inherit;
        color: var(--ink);
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 10px;
        padding: 0.45rem 0.6rem;
        max-width: 100%;
      }
      .counter {
        font-size: 0.9rem;
        color: var(--muted);
        font-variant-numeric: tabular-nums;
      }
      .feedback {
        text-align: center;
      }
      .why {
        color: var(--muted);
        max-width: 60ch;
        margin: 0 auto 0.8rem;
      }
      .done {
        text-align: center;
        padding: 2.5rem 1rem;
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 18px;
        margin: 1.5rem 0;
      }
      .done-icon {
        font-size: 2.6rem;
        color: var(--orange);
      }
      .done h2 {
        margin: 0.5rem 0 0.3rem;
      }
      .done p {
        color: var(--muted);
        margin-bottom: 1.2rem;
      }
      .controls {
        display: flex;
        gap: 0.6rem;
        justify-content: center;
        margin-bottom: 1rem;
      }
      .ok {
        color: var(--green);
        text-align: center;
        font-weight: 600;
      }
      .bad {
        color: var(--red);
        text-align: center;
        font-weight: 600;
      }
    `,
  ],
})
export class SentenceBuilderComponent {
  private readonly content = inject(ContentService);

  protected readonly challenges = toSignal(
    this.content.sentences() as unknown as import('rxjs').Observable<SentenceChallenge[]>,
    { initialValue: [] as SentenceChallenge[] },
  );

  protected readonly index = signal(0);
  protected readonly placedIndices = signal<number[]>([]);
  protected readonly verdict = signal<null | 'right' | 'wrong'>(null);
  protected readonly ruleFilter = signal('all');
  protected readonly finished = signal(false);
  protected helpOpen = false;

  /** Rules present in the data, in curriculum order, with their sentence counts. */
  protected readonly rules = computed(() => {
    const counts = new Map<string, number>();
    for (const c of this.challenges()) if (c.rule) counts.set(c.rule, (counts.get(c.rule) ?? 0) + 1);
    const rank = (r: string) => (RULE_ORDER.indexOf(r) === -1 ? RULE_ORDER.length : RULE_ORDER.indexOf(r));
    return [...counts.entries()]
      .sort((a, b) => rank(a[0]) - rank(b[0]))
      .map(([rule, count]) => ({ rule, count }));
  });

  /** The sentences in the current set (all rules, or one rule). */
  protected readonly deck = computed(() => {
    const rule = this.ruleFilter();
    const all = this.challenges();
    return rule === 'all' ? all : all.filter((c) => c.rule === rule);
  });

  protected readonly current = computed<SentenceChallenge | undefined>(
    () => this.deck()[this.index()],
  );

  protected readonly isLast = computed(() => this.index() >= this.deck().length - 1);

  /** After finishing one rule's set, offer the next rule in the curriculum. */
  protected readonly nextRule = computed(() => {
    const rule = this.ruleFilter();
    if (rule === 'all') return null;
    const list = this.rules().map((r) => r.rule);
    return list[list.indexOf(rule) + 1] ?? null;
  });

  protected readonly bank = computed(() => {
    const c = this.current();
    if (!c) return [];
    const placed = this.placedIndices();
    return this.shuffledWords(c).filter((w) => !placed.includes(w.idx));
  });

  protected readonly placed = computed(() => {
    const c = this.current();
    if (!c) return [];
    return this.placedIndices().map((idx) => ({ idx, text: c.words[idx] }));
  });

  place(wordIndex: number): void {
    this.placedIndices.update((arr) => [...arr, wordIndex]);
  }

  unplace(wordIndex: number): void {
    this.placedIndices.update((arr) => arr.filter((i) => i !== wordIndex));
    this.verdict.set(null);
  }

  reset(): void {
    this.placedIndices.set([]);
    this.verdict.set(null);
  }

  check(): void {
    const c = this.current();
    if (!c) return;
    // Compare the words, not the tile positions: a sentence can contain the
    // same word twice ("de ... de"), and either tile is then correct.
    const built = this.placedIndices().map((idx) => c.words[idx]);
    const ok = built.length === c.words.length && built.every((w, i) => w === c.words[i]);
    this.verdict.set(ok ? 'right' : 'wrong');
  }

  nextChallenge(): void {
    if (this.isLast()) {
      this.finished.set(true);
    } else {
      this.index.update((i) => i + 1);
    }
    this.reset();
  }

  setRule(event: Event): void {
    const select = event.target;
    if (select instanceof HTMLSelectElement) this.selectRule(select.value);
  }

  selectRule(rule: string): void {
    this.ruleFilter.set(rule);
    this.restart();
  }

  restart(): void {
    this.index.set(0);
    this.finished.set(false);
    this.reset();
  }

  private shuffledWords(challenge: SentenceChallenge): { idx: number; text: string }[] {
    const words = challenge.words.map((text, idx) => ({ idx, text }));
    let seed = [...challenge.id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) || 1;
    return words
      .map((word) => {
        seed = (seed * 9301 + 49297) % 233280;
        return { word, sort: seed / 233280 };
      })
      .sort((a, b) => a.sort - b.sort)
      .map(({ word }) => word);
  }
}
