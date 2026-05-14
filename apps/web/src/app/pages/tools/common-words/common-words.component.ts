import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProgressService } from '../../../core/progress.service';

interface Card {
  id: string;
  front: string;
  back: string;
}

interface Lesson {
  category: string;
  icon: string;
  cards: Card[];
}

@Component({
  selector: 'md-common-words',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tool-shell">
      <div class="hero" [style.border-bottom]="selectedLesson() ? 'none' : null" [style.padding-bottom]="selectedLesson() ? '0' : null">
        <a routerLink="/tools" class="nav-back" style="margin-bottom: 1.5rem;">
          <span class="material-icons">arrow_back</span>
          Back to Tools
        </a>
        <h1>1000 Common <em>Words</em></h1>
        <p class="hero-desc">
          Master the most frequently used Dutch words. Grouped into 40 lessons of 25 words each to make your vocabulary building systematic and efficient.
        </p>
      </div>

      <div class="mastery-summary">
        <div class="progress-container">
          <div class="progress-fill" [style.width.%]="masteryPct()" [style.background]="progress.masteredCommonWordsCount() === totalWords() ? 'var(--gold)' : null"></div>
          <div class="progress-text">
            <strong>{{ progress.masteredCommonWordsCount() }} / {{ totalWords() }}</strong> Words Mastered
          </div>
        </div>
      </div>

      @if (!selectedLesson()) {
        <div class="section-title" style="margin: 2rem 0 1.5rem;">Lessons <div class="title-line"></div></div>
        <div class="lesson-grid">
          @for (lesson of lessons(); track lesson.category; let i = $index) {
            <button class="lesson-card" (click)="selectLesson(lesson)">
              <div class="lesson-icon">
                <span class="material-icons">{{ lesson.icon }}</span>
              </div>
              <div class="lesson-info">
                <h3>{{ lesson.category }}</h3>
                <div class="lesson-meta">
                  <span class="pill">{{ lesson.cards.length }} words</span>
                  @if (getLessonMasteredCount(lesson) > 0) {
                    <span class="mastery-badge">
                      <span class="material-icons">check_circle</span>
                      {{ getLessonMasteredCount(lesson) }} mastered
                    </span>
                  }
                </div>
              </div>
              <span class="material-icons arrow">chevron_right</span>
            </button>
          }
        </div>
      } @else {
        <div class="active-lesson">
          <div class="lesson-nav">
            <button class="nav-back" (click)="selectedLesson.set(null)" style="border:none; cursor:pointer; background:transparent; padding:0;">
              <span class="material-icons">arrow_back</span>
              Back to Lessons
            </button>
            <div class="view-toggle">
              <button [class.active]="viewMode() === 'list'" (click)="viewMode.set('list')">
                <span class="material-icons">list</span> List
              </button>
              <button [class.active]="viewMode() === 'test'" (click)="viewMode.set('test')">
                <span class="material-icons">style</span> Practice
              </button>
            </div>
          </div>

          <div class="lesson-header">
            <h2>{{ selectedLesson()?.category }}</h2>
            <p>{{ getLessonMasteredCount(selectedLesson()!) }} / {{ selectedLesson()?.cards?.length }} mastered in this lesson</p>
          </div>

          @if (viewMode() === 'list') {
            <div class="word-list-container">
              <div class="list-header">
                <span class="col-nl">Dutch</span>
                <span class="col-en">English</span>
                <span class="col-done">Done</span>
              </div>
              <div class="word-list">
                @for (card of selectedLesson()?.cards; track card.id) {
                  <div class="word-row" [class.mastered]="isMastered(card.id)" (click)="toggleMastery(card.id)">
                    <div class="col-nl">
                      <span class="dutch">{{ card.front }}</span>
                    </div>
                    <div class="col-en">
                      <span class="english">{{ card.back }}</span>
                    </div>
                    <div class="col-done">
                      <span class="material-icons mastery-icon">
                        {{ isMastered(card.id) ? 'check_circle' : 'radio_button_unchecked' }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>
          } @else {
            <div class="practice-zone">
              <div class="card-container" (click)="isFlipped.set(!isFlipped())">
                <div class="flip-card" [class.flipped]="isFlipped()">
                  <div class="card-face front">
                    <span class="card-label">Dutch</span>
                    <div class="content">{{ currentCard()?.front }}</div>
                    <span class="hint">Tap to reveal translation</span>
                  </div>
                  <div class="card-face back">
                    <span class="card-label">English</span>
                    <div class="content">{{ currentCard()?.back }}</div>
                    <span class="hint">Tap to see Dutch word</span>
                  </div>
                </div>
              </div>

              <div class="practice-controls">
                <button class="nav-btn" (click)="prevCard()" [disabled]="currentIndex() === 0" title="Previous">
                  <span class="material-icons">arrow_back</span>
                </button>
                
                <div class="center-controls">
                  <div class="card-count">{{ currentIndex() + 1 }} / {{ selectedLesson()?.cards?.length }}</div>
                  <button 
                    class="fc-btn" 
                    [class.mastered]="isMastered(currentCard()?.id || '')" 
                    (click)="toggleMastery(currentCard()?.id || ''); $event.stopPropagation()"
                  >
                    <span class="material-icons">{{ isMastered(currentCard()?.id || '') ? 'check_circle' : 'radio_button_unchecked' }}</span>
                    {{ isMastered(currentCard()?.id || '') ? 'Mastered' : 'Mark as Mastered' }}
                  </button>
                </div>

                <button class="nav-btn" (click)="nextCard()" [disabled]="currentIndex() === (selectedLesson()?.cards?.length || 0) - 1" title="Next">
                  <span class="material-icons">arrow_forward</span>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .tool-shell {
      max-width: 900px;
      margin: 0 auto;
      padding-bottom: 4rem;
    }

    .mastery-summary {
      margin-bottom: 2rem;
    }

    .progress-container {
      background: var(--white);
      border: 1.5px solid var(--border);
      height: 44px;
      border-radius: 12px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
    }

    .progress-fill {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      background: var(--orange);
      opacity: 0.15;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .progress-text {
      position: relative;
      width: 100%;
      text-align: center;
      font-size: 0.85rem;
      color: var(--ink);
      z-index: 1;
    }

    .progress-text strong {
      color: var(--orange);
      font-family: 'DM Mono', monospace;
    }

    .lesson-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .lesson-card {
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
      width: 100%;
    }

    .lesson-card:hover {
      transform: translateY(-3px);
      border-color: var(--orange);
      box-shadow: 0 8px 24px rgba(232, 80, 10, 0.08);
    }

    .lesson-icon {
      width: 44px;
      height: 44px;
      background: var(--orange-bg);
      color: var(--orange);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .lesson-info h3 {
      margin: 0;
      font-family: 'Playfair Display', serif;
      font-size: 1.1rem;
      color: var(--ink);
    }

    .lesson-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.4rem;
    }

    .mastery-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.7rem;
      color: var(--green);
      font-weight: 600;
    }

    .mastery-badge .material-icons {
      font-size: 0.9rem;
    }

    .lesson-card .arrow {
      margin-left: auto;
      color: var(--border);
      transition: color 0.2s;
    }

    .lesson-card:hover .arrow {
      color: var(--orange);
    }

    .nav-back {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--muted);
      font-size: 0.9rem;
      font-weight: 600;
      transition: color 0.2s;
      text-decoration: none;
    }

    .nav-back:hover {
      color: var(--orange);
    }

    .lesson-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .view-toggle {
      display: flex;
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: 10px;
      padding: 3px;
    }

    .view-toggle button {
      background: transparent;
      border: none;
      padding: 0.4rem 1rem;
      border-radius: 7px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }

    .view-toggle button .material-icons {
      font-size: 1rem;
    }

    .view-toggle button.active {
      background: var(--orange-bg);
      color: var(--orange);
    }

    .lesson-header {
      margin-bottom: 2rem;
    }

    .lesson-header h2 {
      font-family: 'Playfair Display', serif;
      font-size: 1.8rem;
      margin: 0 0 0.25rem;
    }

    .lesson-header p {
      color: var(--muted);
      font-size: 0.85rem;
      margin: 0;
    }

    .word-list-container {
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
    }

    .list-header {
      display: grid;
      grid-template-columns: 1fr 1fr 60px;
      padding: 0.75rem 1.5rem;
      background: var(--stripe);
      border-bottom: 1.5px solid var(--border);
      font-family: 'DM Mono', monospace;
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
    }

    .word-row {
      display: grid;
      grid-template-columns: 1fr 1fr 60px;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border);
      align-items: center;
      cursor: pointer;
      transition: background 0.15s;
    }

    .word-row:last-child {
      border-bottom: none;
    }

    .word-row:hover {
      background: var(--stripe);
    }

    .word-row.mastered {
      background: var(--green-light);
    }

    .word-row .dutch {
      font-weight: 700;
      color: var(--ink);
    }

    .word-row .english {
      color: var(--muted);
    }

    .mastery-icon {
      color: var(--border);
      transition: color 0.2s;
    }

    .word-row.mastered .mastery-icon {
      color: var(--green);
    }

    .col-done {
      text-align: right;
    }

    .practice-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2.5rem;
      padding: 1rem 0;
    }

    .card-container {
      width: 100%;
      max-width: 440px;
      aspect-ratio: 16/10;
      perspective: 1000px;
      cursor: pointer;
    }

    .flip-card {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
    }

    .flip-card.flipped {
      transform: rotateY(180deg);
    }

    .card-face {
      position: absolute;
      inset: 0;
      backface-visibility: hidden;
      background: var(--white);
      border: 2px solid var(--border);
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      box-shadow: 0 12px 32px rgba(0,0,0,0.04);
    }

    .card-face.back {
      transform: rotateY(180deg);
      border-color: var(--orange);
    }

    .card-label {
      font-family: 'DM Mono', monospace;
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--muted);
      margin-bottom: 2rem;
    }

    .card-face .content {
      font-family: 'Playfair Display', serif;
      font-size: 2.5rem;
      font-weight: 700;
      text-align: center;
      color: var(--ink);
    }

    .hint {
      margin-top: 2.5rem;
      font-size: 0.75rem;
      color: var(--muted);
      font-style: italic;
      opacity: 0.6;
    }

    .practice-controls {
      display: flex;
      align-items: center;
      gap: 2.5rem;
    }

    .center-controls {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .card-count {
      font-family: 'DM Mono', monospace;
      font-weight: 600;
      font-size: 1rem;
      color: var(--muted);
    }

    .nav-btn {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      border: 1.5px solid var(--border);
      background: var(--white);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--ink);
    }

    .nav-btn:hover:not(:disabled) {
      border-color: var(--orange);
      color: var(--orange);
      transform: scale(1.08);
    }

    .nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .fc-btn.mastered {
      background: var(--green);
      border-color: var(--green);
      color: white;
    }

    .fc-btn .material-icons {
      font-size: 1.1rem;
      margin-right: 0.4rem;
    }
  `],
})
export class CommonWordsComponent {
  private readonly http = inject(HttpClient);
  protected readonly progress = inject(ProgressService);
  
  protected readonly lessons = signal<Lesson[]>([]);
  protected readonly selectedLesson = signal<Lesson | null>(null);
  protected readonly viewMode = signal<'list' | 'test'>('list');
  protected readonly currentIndex = signal(0);
  protected readonly isFlipped = signal(false);

  protected readonly totalWords = computed(() => 
    this.lessons().reduce((acc, curr) => acc + curr.cards.length, 0)
  );

  protected readonly masteryPct = computed(() => {
    const total = this.totalWords();
    if (total === 0) return 0;
    return (this.progress.masteredCommonWordsCount() / total) * 100;
  });

  protected readonly currentCard = computed(() => {
    const lesson = this.selectedLesson();
    if (!lesson) return null;
    return lesson.cards[this.currentIndex()];
  });

  constructor() {
    this.http.get<Lesson[]>('assets/data/common-words.json').subscribe(data => {
      this.lessons.set(data);
    });

    this.progress.refreshCommonWordsFromServer().subscribe();
  }

  selectLesson(lesson: Lesson) {
    this.selectedLesson.set(lesson);
    this.currentIndex.set(0);
    this.isFlipped.set(false);
  }

  toggleMastery(cardId: string) {
    const mastered = this.progress.readMasteredCommonWords();
    if (mastered.has(cardId)) {
      mastered.delete(cardId);
    } else {
      mastered.add(cardId);
    }
    this.progress.writeMasteredCommonWords(mastered);
    this.progress.syncCommonWords([...mastered]);
  }

  isMastered(cardId: string): boolean {
    return this.progress.masteredCommonWords().has(cardId);
  }

  getLessonMasteredCount(lesson: Lesson): number {
    return lesson.cards.filter(c => this.isMastered(c.id)).length;
  }

  nextCard() {
    const max = (this.selectedLesson()?.cards.length || 0) - 1;
    if (this.currentIndex() < max) {
      this.isFlipped.set(false);
      setTimeout(() => this.currentIndex.update(i => i + 1), 150);
    }
  }

  prevCard() {
    if (this.currentIndex() > 0) {
      this.isFlipped.set(false);
      setTimeout(() => this.currentIndex.update(i => i - 1), 150);
    }
  }
}
