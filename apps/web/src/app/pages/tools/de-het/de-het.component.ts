import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { Noun } from '@moredutch/shared';
import { ContentService } from '../../../core/content.service';
import { MetaService } from '../../../core/meta.service';
import { HelpDialogComponent } from '../../../layout/help-dialog/help-dialog.component';

type NounWithLegacyFields = Noun & {
  id?: number;
  level?: string;
  rule?: string;
};

@Component({
  selector: 'md-de-het',
  standalone: true,
  imports: [HelpDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero" style="border-bottom:none; padding-bottom: 0;">
      <h1>
        de / het<br /><em>Trainer</em>
        <button class="help-trigger" type="button" title="How it works" (click)="helpOpen = true">
          <span class="material-icons">help_outline</span>
        </button>
      </h1>
      <p class="hero-desc">
        Master Dutch articles through repetition. The more you play, the better your intuition.
      </p>
    </div>

    <md-help-dialog [(visible)]="helpOpen" title="De Het <em>Guide</em>">
      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--orange);">bolt</span>
          <h3 style="margin:0;">Rapid Choice</h3>
        </div>
        <p>
          Decide instantly between De or Het. It's the only way to build the intuition needed for
          real conversation.
        </p>
      </div>

      <div class="help-section">
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
          <span class="material-icons" style="color:var(--green);">lightbulb</span>
          <h3 style="margin:0;">Rule Tips</h3>
        </div>
        <p>
          If you get it wrong, we'll often show you the specific grammar rule (like diminutives or
          professions) to help you remember.
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

    <div class="game-container">
      <div class="stats-bar">
        <div>Session: <span class="score-val">{{ correct() }} / {{ total() }}</span></div>
        <div>
          <span class="stats-label">Level:</span>
          <select id="level-select" [value]="selectedLevel()" (change)="changeLevel($event)">
            <option value="all">All Levels</option>
            <option value="A1">A1 Only</option>
            <option value="A2">A2 Only</option>
            <option value="B1">B1 Only</option>
          </select>
        </div>
        <div>Mastered: <span class="score-val">{{ masteredCount() }}</span></div>
      </div>

      @if (current(); as noun) {
        <div class="word-card" [class.correct]="result() === 'right'" [class.incorrect]="result() === 'wrong'">
          <div class="current-word">{{ noun.word }}</div>
          @if (noun.english) {
            <div class="word-meaning">{{ noun.english }}</div>
          }

          <div
            class="feedback-msg"
            [style.color]="result() === 'right' ? 'var(--green)' : result() === 'wrong' ? 'var(--red)' : ''"
          >
            @if (result() === 'right') {
              Correct! Good job.
            } @else if (result() === 'wrong') {
              Actually, it's <strong style="text-transform:uppercase">{{ noun.article }}</strong>
              {{ noun.word }}.
            }
          </div>

          @if (result() !== null && noun.rule) {
            <div class="rule-tip">Tip: {{ noun.rule }}</div>
          }
        </div>

        @if (result() === null) {
          <div class="btn-group">
            <button class="article-btn btn-de" type="button" (click)="answer('de')">De</button>
            <button class="article-btn btn-het" type="button" (click)="answer('het')">Het</button>
          </div>
        }

        @if (result() !== null) {
          <button class="btn-next" type="button" (click)="nextWord()">
            Next Word
            <span class="material-icons" style="vertical-align: middle; font-size: 1.2rem; margin-left: 0.5rem;">arrow_forward</span>
          </button>
        }
      } @else {
        <div class="word-card">
          <div class="current-word">Empty</div>
          <div class="word-meaning">No words for this level</div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        --de-color: #3b82f6;
        --het-color: #f59e0b;
      }
      .game-container {
        max-width: 600px;
        margin: 4rem auto;
        text-align: center;
        perspective: 1000px;
      }
      .stats-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        font-family: 'DM Mono', monospace;
        font-size: 0.8rem;
        color: var(--muted);
      }
      .stats-bar > div {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .stats-label {
        text-transform: none;
        font-size: 0.8rem;
        color: var(--muted);
      }
      #level-select {
        padding: 0.3rem 0.8rem;
        font-size: 0.75rem;
        border-radius: 8px;
        border: 1.5px solid var(--border);
        background: var(--white);
        color: var(--ink);
        font-family: 'DM Sans', sans-serif;
        outline: none;
        cursor: pointer;
        transition: border-color 0.2s;
      }
      #level-select:focus {
        border-color: var(--het-color);
      }
      .score-val {
        color: var(--ink);
        font-weight: 700;
      }
      .word-card {
        background: var(--white);
        padding: 4rem 2rem;
        border-radius: 24px;
        border: 1.5px solid var(--border);
        box-shadow: var(--shadow-sm);
        margin-bottom: 2rem;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
      }
      .word-card.correct {
        border-color: var(--green);
        background: rgba(16, 185, 129, 0.05);
      }
      .word-card.incorrect {
        border-color: var(--red);
        background: rgba(239, 68, 68, 0.05);
      }
      .current-word {
        font-family: 'Playfair Display', serif;
        font-size: 4rem;
        font-weight: 900;
        margin-bottom: 0.5rem;
        color: var(--ink);
      }
      .word-meaning {
        font-family: 'DM Sans', sans-serif;
        font-size: 1.2rem;
        color: var(--muted);
        font-style: italic;
      }
      .btn-group {
        display: flex;
        gap: 1.5rem;
        justify-content: center;
        margin-bottom: 2rem;
      }
      .article-btn {
        padding: 1.2rem 3rem;
        font-size: 1.5rem;
        font-weight: 700;
        border-radius: 16px;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'DM Mono', monospace;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
      .btn-de {
        background: var(--de-color);
        color: white;
      }
      .btn-de:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
      }
      .btn-het {
        background: var(--het-color);
        color: white;
      }
      .btn-het:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3);
      }
      .btn-next {
        background: var(--ink);
        color: var(--white);
        padding: 0.8rem 2rem;
        border-radius: 12px;
        font-weight: 600;
        margin: 0 auto;
        border: none;
        cursor: pointer;
        font-family: 'DM Sans', sans-serif;
      }
      .feedback-msg {
        margin-top: 1.5rem;
        font-weight: 600;
        min-height: 1.5rem;
        font-size: 1.1rem;
      }
      .rule-tip {
        margin-top: 1rem;
        padding: 0.8rem;
        background: var(--bg);
        border-radius: 8px;
        font-size: 0.85rem;
        color: var(--muted);
      }
      @media (max-width: 640px) {
        .stats-bar,
        .btn-group {
          flex-direction: column;
        }
        .current-word {
          font-size: 3rem;
        }
        .article-btn {
          width: 100%;
        }
      }
    `,
  ],
})
export class DeHetComponent {
  private readonly content = inject(ContentService);

  protected readonly nouns = toSignal(this.content.nouns(), {
    initialValue: [] as NounWithLegacyFields[],
  });

  protected readonly index = signal(0);
  protected readonly streak = signal(0);
  protected readonly correct = signal(0);
  protected readonly total = signal(0);
  protected readonly result = signal<null | 'right' | 'wrong'>(null);
  protected readonly selectedLevel = signal('all');
  protected readonly masteredIds = signal<number[]>(this.readMasteredIds());
  protected helpOpen = false;
  private initialized = false;

  protected readonly filteredNouns = computed<NounWithLegacyFields[]>(() => {
    const level = this.selectedLevel();
    const nouns = this.nouns() as NounWithLegacyFields[];
    return level === 'all' ? nouns : nouns.filter((noun) => noun.level === level);
  });

  protected readonly current = computed<NounWithLegacyFields | undefined>(
    () => this.filteredNouns()[this.index()],
  );
  protected readonly masteredCount = computed(() => this.masteredIds().length);

  constructor() {
    inject(MetaService).set({
      title: 'de / het Trainer — Master Dutch Noun Gender | More Dutch',
      description:
        'The fastest way to learn de/het. Practice 500+ common nouns in a rapid-fire drill.',
      canonicalPath: '/tools/de-het',
    });

    effect(() => {
      const list = this.filteredNouns();
      if (list.length > 0 && (!this.initialized || this.index() >= list.length)) {
        this.index.set(this.randomIndex(list.length));
        this.initialized = true;
      }
    });
  }

  answer(choice: 'de' | 'het'): void {
    const n = this.current();
    if (!n) return;
    this.total.update((v) => v + 1);
    if (n.article === choice) {
      this.correct.update((v) => v + 1);
      this.streak.update((v) => v + 1);
      this.result.set('right');
      if (typeof n.id === 'number' && !this.masteredIds().includes(n.id)) {
        this.masteredIds.update((ids) => [...ids, n.id!]);
        this.writeMasteredIds();
      }
    } else {
      this.streak.set(0);
      this.result.set('wrong');
    }
  }

  changeLevel(event: Event): void {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement)) return;
    this.selectedLevel.set(select.value);
    this.result.set(null);
    const list = this.nouns() as NounWithLegacyFields[];
    const filtered =
      select.value === 'all' ? list : list.filter((noun) => noun.level === select.value);
    this.index.set(filtered.length ? this.randomIndex(filtered.length) : 0);
  }

  nextWord(): void {
    const list = this.filteredNouns();
    if (!list.length) return;
    this.index.set(this.randomIndex(list.length));
    this.result.set(null);
  }

  private randomIndex(length: number): number {
    return Math.floor(Math.random() * length);
  }

  private readMasteredIds(): number[] {
    try {
      const value = localStorage.getItem('dgh_mastered_nouns');
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  }

  private writeMasteredIds(): void {
    try {
      localStorage.setItem('dgh_mastered_nouns', JSON.stringify(this.masteredIds()));
    } catch {
      /* ignore */
    }
  }
}
