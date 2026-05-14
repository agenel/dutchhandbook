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
      <div class="hero-header">
        <div class="hero-main">
          <a routerLink="/tools" class="nav-back small">
            <span class="material-icons">arrow_back</span>
            Back to Tools
          </a>
          <h1>1000 Common <em>Words</em></h1>
          <p class="hero-desc compact">
            Master the most frequently used Dutch words. 40 lessons of 25 words each.
          </p>
        </div>
        <div class="hero-stats">
          <div class="progress-container compact">
            <div class="progress-fill" [style.width.%]="masteryPct()"></div>
            <div class="progress-text">
              @if (!selectedLesson()) {
                <strong>{{ masteredLessonsCount() }} / {{ lessons().length }}</strong> Lessons Mastered
              } @else {
                <strong>{{ getLessonMasteredCount(selectedLesson()!) }} / {{ selectedLesson()?.cards?.length }}</strong> Words Mastered
              }
            </div>
          </div>
        </div>
      </div>

      @if (!selectedLesson()) {
        <div class="section-title compact">Lessons <div class="title-line"></div></div>
        <div class="lesson-grid">
          @for (lesson of lessons(); track lesson.category; let i = $index) {
            <button class="lesson-card" [class.fully-mastered]="isLessonFullyMastered(lesson)" (click)="selectLesson(lesson)">
              <div class="lesson-icon">
                <span class="material-icons">{{ lesson.icon }}</span>
              </div>
              <div class="lesson-info">
                <h3>{{ lesson.category }}</h3>
                <div class="lesson-meta">
                  <span class="pill">{{ lesson.cards.length }} words</span>
                </div>
              </div>
              @if (getLessonMasteredCount(lesson) > 0 && !isLessonFullyMastered(lesson)) {
                <div class="card-progress">
                  <div class="card-progress-fill" [style.width.%]="(getLessonMasteredCount(lesson) / lesson.cards.length) * 100"></div>
                </div>
              }
              @if (isLessonFullyMastered(lesson)) {
                <div class="mastery-ribbon">
                  <span class="material-icons">stars</span>
                  Mastered
                </div>
              }
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
            <p>Track your progress word by word in this lesson.</p>
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
      max-width: 1000px;
      margin: 0 auto;
      padding-bottom: 2rem;
    }

    .hero-header {
      display: grid;
      grid-template-columns: 1fr 220px;
      align-items: center;
      gap: 2rem;
      padding: 1.5rem 0;
      margin-bottom: 1rem;
      border-bottom: 2px solid var(--ink);
    }

    @media (max-width: 800px) {
      .hero-header {
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1rem 0;
      }
      .hero-stats {
        max-width: 300px;
      }
    }

    .hero-main h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.8rem, 4vw, 2.5rem);
      font-weight: 900;
      margin: 0.25rem 0;
      line-height: 1;
    }

    .hero-main h1 em {
      color: var(--orange);
      font-style: italic;
    }

    .hero-desc.compact {
      font-size: 0.85rem;
      color: var(--muted);
      margin: 0;
    }

    .progress-container.compact {
      background: var(--white);
      border: 1.5px solid var(--border);
      height: 36px;
      border-radius: 10px;
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
      opacity: 0.1;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .progress-text {
      position: relative;
      width: 100%;
      text-align: center;
      font-size: 0.75rem;
      color: var(--ink);
      z-index: 1;
      font-weight: 500;
      padding: 0 1rem;
    }

    .progress-text strong {
      color: var(--orange);
      font-family: 'DM Mono', monospace;
    }

    .section-title.compact {
      margin: 0 0 1rem 0;
      font-size: 0.9rem;
    }

    .lesson-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 0.75rem;
    }

    .lesson-card {
      position: relative;
      overflow: hidden;
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
      width: 100%;
    }

    .card-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--border);
      opacity: 0.5;
    }

    .card-progress-fill {
      height: 100%;
      background: var(--orange);
      transition: width 0.3s ease;
    }

    .mastery-ribbon {
      position: absolute;
      top: 0;
      right: 0;
      background: var(--green);
      color: white;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.25rem 1rem;
      transform: rotate(0);
      border-bottom-left-radius: 12px;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: -2px 2px 8px rgba(0,0,0,0.1);
    }

    .mastery-ribbon .material-icons {
      font-size: 0.8rem;
    }

    .lesson-card:hover {
      transform: translateY(-3px);
      border-color: var(--orange);
      box-shadow: 0 8px 24px rgba(232, 80, 10, 0.08);
    }

    .lesson-card.fully-mastered {
      border-color: var(--green);
      background: var(--green-light);
    }

    .lesson-card.fully-mastered .lesson-icon {
      background: var(--green);
      color: white;
    }

    .mastery-badge.done {
      color: var(--green);
      font-weight: 700;
    }

    .lesson-icon {
      width: 40px;
      height: 40px;
      background: var(--orange-bg);
      color: var(--orange);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .lesson-icon .material-icons {
      font-size: 1.2rem;
    }

    .lesson-info h3 {
      margin: 0;
      font-family: 'Playfair Display', serif;
      font-size: 1rem;
      color: var(--ink);
    }

    .lesson-meta {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .pill {
      white-space: nowrap;
      flex-shrink: 0;
    }

    .mastery-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.7rem;
      color: var(--green);
      font-weight: 600;
      white-space: nowrap;
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

    .nav-back.small {
      font-size: 0.75rem;
      gap: 0.35rem;
    }

    .nav-back.small .material-icons {
      font-size: 0.95rem;
    }

    .nav-back:hover {
      color: var(--orange);
    }

    .lesson-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
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
      padding: 0.35rem 0.8rem;
      border-radius: 7px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }

    .view-toggle button .material-icons {
      font-size: 0.9rem;
    }

    .view-toggle button.active {
      background: var(--orange-bg);
      color: var(--orange);
    }

    .lesson-header {
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px dashed var(--border);
    }

    .lesson-header h2 {
      font-family: 'Playfair Display', serif;
      font-size: 1.4rem;
      margin: 0 0 0.15rem;
    }

    .lesson-header p {
      color: var(--muted);
      font-size: 0.8rem;
      margin: 0;
    }

    .word-list-container {
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }

    .list-header {
      display: grid;
      grid-template-columns: 1fr 1fr 60px;
      padding: 0.5rem 1.25rem;
      background: var(--stripe);
      border-bottom: 1.5px solid var(--border);
      font-family: 'DM Mono', monospace;
      font-size: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
    }

    .word-row {
      display: grid;
      grid-template-columns: 1fr 1fr 60px;
      padding: 0.75rem 1.25rem;
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
      gap: 1.5rem;
      padding: 0.5rem 0;
    }

    .card-container {
      width: 100%;
      max-width: 400px;
      aspect-ratio: 16/9;
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
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      box-shadow: 0 8px 24px rgba(0,0,0,0.04);
    }

    .card-face.back {
      transform: rotateY(180deg);
      border-color: var(--orange);
    }

    .card-label {
      font-family: 'DM Mono', monospace;
      font-size: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--muted);
      margin-bottom: 1.5rem;
    }

    .card-face .content {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      text-align: center;
      color: var(--ink);
    }

    .hint {
      margin-top: 1.5rem;
      font-size: 0.7rem;
      color: var(--muted);
      font-style: italic;
      opacity: 0.6;
    }

    .practice-controls {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .center-controls {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .card-count {
      font-family: 'DM Mono', monospace;
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--muted);
    }

    .nav-btn {
      width: 48px;
      height: 48px;
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

  protected readonly masteredLessonsCount = computed(() => {
    return this.lessons().filter(l => this.isLessonFullyMastered(l)).length;
  });

  protected readonly masteryPct = computed(() => {
    const lesson = this.selectedLesson();
    if (lesson) {
      const total = lesson.cards.length;
      if (total === 0) return 0;
      return (this.getLessonMasteredCount(lesson) / total) * 100;
    } else {
      const total = this.lessons().length;
      if (total === 0) return 0;
      return (this.masteredLessonsCount() / total) * 100;
    }
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

  isLessonFullyMastered(lesson: Lesson): boolean {
    if (lesson.cards.length === 0) return false;
    return lesson.cards.every(c => this.isMastered(c.id));
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
