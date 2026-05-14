import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../core/content.service';
import { ProgressService } from '../../../core/progress.service';
import { HelpDialogComponent } from '../../../layout/help-dialog/help-dialog.component';

interface CommonWordCard {
  id: string;
  front: string;
  back: string;
}

interface CommonWordLesson {
  category: string;
  icon?: string;
  cards: CommonWordCard[];
}

@Component({
  selector: 'md-common-words',
  standalone: true,
  imports: [CommonModule, RouterLink, HelpDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tool-shell">
      @if (!selectedLesson()) {
        <div class="hero-header">
          <div class="hero-main">
            <div class="nav-back-container">
              <a routerLink="/tools" class="nav-back small">
                <span class="material-icons">arrow_back</span>
                Back to Tools
              </a>
            </div>
            <h1>
              1000 Common <em>Words</em>
              <button class="help-trigger" type="button" title="How it works" (click)="helpOpen = true">
                <span class="material-icons">help_outline</span>
              </button>
            </h1>
            <p class="hero-desc compact">
              Master the most frequently used Dutch words. 40 lessons of 25 words each.
            </p>
          </div>
          <div class="hero-stats">
            <div class="section-title compact" style="margin-bottom: 0.5rem; text-align: right;">
              Overall Progress
            </div>
            <div class="progress-container compact">
              <div class="progress-fill" [style.width.%]="masteryPct()"></div>
              <div class="progress-text">
                <strong>{{ masteredLessonsCount() }} / {{ lessons().length }}</strong> Lessons Mastered
              </div>
            </div>
          </div>
        </div>
      }

      <md-help-dialog [(visible)]="helpOpen" title="Common Words <em>Guide</em>">
        <div class="help-section">
          <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
            <span class="material-icons" style="color:var(--orange);">auto_awesome</span>
            <h3 style="margin:0;">The 1000 Words Journey</h3>
          </div>
          <p>
            This tool is designed to take you through the most essential Dutch vocabulary. 
            The list is divided into 40 structured lessons, each containing 25 high-frequency words.
          </p>
        </div>

        <div class="help-section">
          <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
            <span class="material-icons" style="color:var(--blue);">view_quilt</span>
            <h3 style="margin:0;">Learning Modes</h3>
          </div>
          <p>
            Each lesson offers two modes:
            <br>• <strong>List View</strong>: A structured overview to study meanings and mark words as mastered.
            <br>• <strong>Practice Mode</strong>: Interactive flashcards to test your recall and build active vocabulary.
          </p>
        </div>

        <div class="help-section">
          <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
            <span class="material-icons" style="color:var(--green);">verified</span>
            <h3 style="margin:0;">Mastery Tracking</h3>
          </div>
          <p>
            When you feel confident with a word, mark it as "Mastered". 
            A lesson is only considered complete once <strong>all 25 words</strong> are mastered. 
            Track your overall progress on the main dashboard.
          </p>
        </div>

        <div class="help-section">
          <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">
            <span class="material-icons" style="color:var(--gold);">filter_list</span>
            <h3 style="margin:0;">Smart Filters</h3>
          </div>
          <p>
            Use the toggle buttons at the end of section headers to focus your study:
            <br>• Hide completed lessons to focus on new ones.
            <br>• Sort lists to bring unmastered words to the top.
          </p>
        </div>
      </md-help-dialog>

      @if (!selectedLesson()) {
        <div class="section-header line-end">
          <h2 class="section-title compact">Lessons</h2>
          <button 
            class="toggle-btn" 
            [class.active]="hideMasteredLessons()" 
            (click)="hideMasteredLessons.set(!hideMasteredLessons())"
            [title]="hideMasteredLessons() ? 'Show all lessons' : 'Hide mastered lessons'"
          >
            <span class="material-icons">{{ hideMasteredLessons() ? 'visibility_off' : 'visibility' }}</span>
            <span>{{ hideMasteredLessons() ? 'Hide Mastered' : 'Show All' }}</span>
          </button>
        </div>
        <div class="lesson-grid">
          @for (lesson of filteredLessons(); track lesson.category) {
            <div class="lesson-card" 
                 [class.fully-mastered]="isLessonFullyMastered(lesson)"
                 (click)="selectLesson(lesson)">
              <div class="lesson-icon">
                <span class="material-icons">{{ lesson.icon || 'category' }}</span>
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
            </div>
          }
        </div>
      } @else {
        <div class="lesson-view">
          <div class="lesson-nav">
            <div class="nav-left">
              <a (click)="selectLesson(null)" class="nav-back">
                <span class="material-icons">arrow_back</span>
                Back
              </a>
            </div>
            
            <div class="view-toggle">
              <button [class.active]="viewMode() === 'list'" (click)="viewMode.set('list')">
                <span class="material-icons">format_list_bulleted</span>
                List
              </button>
              <button [class.active]="viewMode() === 'practice'" (click)="viewMode.set('practice')">
                <span class="material-icons">layers</span>
                Practice
              </button>
            </div>

            <div class="nav-right">
              @if (viewMode() === 'list') {
                <button 
                  class="sort-btn mobile-only-btn" 
                  [class.active]="sortMasteredLast()" 
                  (click)="sortMasteredLast.set(!sortMasteredLast())"
                >
                  <span class="material-icons">sort</span>
                </button>
              }
            </div>
          </div>

          <div class="lesson-header-main">
            <div class="header-content">
              <h2>{{ selectedLesson()?.category }}</h2>
              <p>Track your progress word by word in this lesson.</p>
            </div>
            <div class="lesson-progress-box">
              <div class="progress-label">
                Lesson Progress <span>({{ getLessonMasteredCount(selectedLesson()!) }}/{{ selectedLesson()?.cards?.length }})</span>
              </div>
              <div class="progress-bar-wrap">
                <div class="progress-bar-fill" [style.width.%]="lessonMasteryPct()"></div>
              </div>
            </div>
          </div>

          @if (viewMode() === 'list') {
            <div class="word-list-container">
              <div class="word-list-header line-end">
                <div class="col-dutch">Dutch</div>
                <div class="col-english">English</div>
                <div class="col-done">
                  Done
                  <button 
                    class="sort-btn" 
                    [class.active]="sortMasteredLast()" 
                    (click)="sortMasteredLast.set(!sortMasteredLast())"
                    [title]="sortMasteredLast() ? 'Show in original order' : 'Sort unmastered to top'"
                  >
                    <span class="material-icons">sort</span>
                  </button>
                </div>
              </div>
              <div class="word-rows">
                @for (card of sortedCards(); track card.id) {
                  <div class="word-row" [class.mastered]="isMastered(card.id)">
                    <div class="col-dutch">
                      <span class="dutch-word">{{ card.front }}</span>
                    </div>
                    <div class="col-english">
                      <span class="english-word">{{ card.back }}</span>
                    </div>
                    <div class="col-done">
                      <button class="master-btn" 
                              [class.active]="isMastered(card.id)"
                              (click)="toggleMastery(card.id)">
                        <span class="material-icons">
                          {{ isMastered(card.id) ? 'check_circle' : 'radio_button_unchecked' }}
                        </span>
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          } @else {
            <div class="practice-container">
              @if (practiceCards().length > 0) {
                <div class="practice-card-wrapper">
                  <div class="practice-card" [class.flipped]="isFlipped()" (click)="toggleFlip()">
                    <div class="card-face card-front">
                      <div class="card-label">Dutch</div>
                      <div class="card-content">{{ practiceCards()[currentIdx()].front }}</div>
                      <div class="card-hint">Click to flip</div>
                    </div>
                    <div class="card-face card-back">
                      <div class="card-label">English</div>
                      <div class="card-content">{{ practiceCards()[currentIdx()].back }}</div>
                      <div class="card-hint">Click to flip</div>
                    </div>
                  </div>

                  <div class="practice-controls">
                    <button class="control-btn" (click)="prevCard($event)" [disabled]="currentIdx() === 0">
                      <span class="material-icons">chevron_left</span>
                    </button>
                    <div class="practice-idx">
                      {{ currentIdx() + 1 }} / {{ practiceCards().length }}
                    </div>
                    <button class="control-btn" (click)="nextCard($event)" [disabled]="currentIdx() === practiceCards().length - 1">
                      <span class="material-icons">chevron_right</span>
                    </button>
                  </div>

                  <div class="practice-actions">
                    <button class="action-btn master" 
                            [class.is-mastered]="isMastered(practiceCards()[currentIdx()].id)"
                            (click)="toggleMastery(practiceCards()[currentIdx()].id); $event.stopPropagation()">
                      <span class="material-icons">
                        {{ isMastered(practiceCards()[currentIdx()].id) ? 'check_circle' : 'stars' }}
                      </span>
                      {{ isMastered(practiceCards()[currentIdx()].id) ? 'Mastered' : 'Mark as Mastered' }}
                    </button>
                  </div>
                </div>
              } @else {
                <div class="empty-practice">
                  <span class="material-icons">task_alt</span>
                  <h3>All words mastered!</h3>
                  <p>Great job! You've completed this lesson.</p>
                  <button class="btn-primary" (click)="viewMode.set('list')">Back to List</button>
                </div>
              }
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
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .hero-main h1 em {
      color: var(--orange);
      font-style: italic;
    }

    .help-trigger {
      background: none;
      border: none;
      color: var(--muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0;
      transition: color 0.2s;
    }

    .help-trigger:hover {
      color: var(--orange);
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
      margin: 0;
      font-size: 0.9rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .line-end {
      position: relative;
      border-bottom: 2px solid var(--ink);
      padding-bottom: 0.5rem;
      margin-bottom: 1.5rem !important;
    }

    .toggle-btn, .sort-btn {
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: 8px;
      padding: 0.4rem 0.8rem;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .toggle-btn:hover, .sort-btn:hover {
      border-color: var(--orange);
      color: var(--orange);
    }

    .toggle-btn.active, .sort-btn.active {
      background: var(--orange-bg);
      border-color: var(--orange);
      color: var(--orange);
    }

    .toggle-btn .material-icons, .sort-btn .material-icons {
      font-size: 1rem;
    }

    .sort-btn {
      padding: 0.2rem 0.5rem;
      margin-left: 0.5rem;
      border-radius: 6px;
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
      display: flex;
      align-items: center;
      gap: 0.25rem;
      transform: translate(0, 0);
      border-bottom-left-radius: 12px;
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
    }

    .pill {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--muted);
      background: var(--bg);
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
      white-space: nowrap;
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
      cursor: pointer;
    }

    .nav-back.small {
      font-size: 0.75rem;
      gap: 0.35rem;
      margin-bottom: 0.5rem;
    }

    .nav-back:hover {
      color: var(--orange);
    }

    .lesson-nav {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .view-toggle {
      display: flex;
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: 12px;
      padding: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    .view-toggle button {
      background: transparent;
      border: none;
      padding: 0.5rem 1.25rem;
      border-radius: 9px;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .view-toggle button .material-icons {
      font-size: 1.1rem;
    }

    .view-toggle button.active {
      background: var(--orange-bg);
      color: var(--orange);
    }

    .lesson-header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .lesson-header-main h2 {
      font-family: 'Playfair Display', serif;
      font-size: 2.2rem;
      font-weight: 900;
      margin: 0 0 0.5rem 0;
    }

    .lesson-header-main p {
      color: var(--muted);
      margin: 0;
    }

    .lesson-progress-box {
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      box-shadow: var(--shadow-sm);
      width: 220px;
    }

    .progress-label {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      margin-bottom: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .progress-label span {
      color: var(--ink);
      font-weight: 800;
    }

    .progress-bar-wrap {
      height: 6px;
      background: var(--bg);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--green);
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .word-list-header {
      display: grid;
      grid-template-columns: 1.2fr 1fr 80px;
      padding: 0 1.5rem 0.75rem 1.5rem;
      font-weight: 700;
      color: var(--muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .col-done {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .word-rows {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .word-row {
      display: grid;
      grid-template-columns: 1.2fr 1fr 80px;
      padding: 0.75rem 1.25rem;
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: 10px;
      align-items: center;
      transition: all 0.2s;
    }

    .word-row.mastered {
      background: var(--green-light);
      border-color: var(--green-light);
      opacity: 0.8;
    }

    .dutch-word {
      font-weight: 800;
      font-size: 1.1rem;
      color: var(--ink);
    }

    .english-word {
      color: var(--muted);
      font-style: italic;
    }

    .master-btn {
      background: none;
      border: none;
      color: var(--border);
      cursor: pointer;
      transition: all 0.2s;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .master-btn .material-icons {
      font-size: 1.5rem;
    }

    .master-btn:hover {
      color: var(--orange);
    }

    .master-btn.active {
      color: var(--green);
    }

    /* Practice Mode Styles */
    .practice-container {
      max-width: 500px;
      margin: 2rem auto;
      text-align: center;
    }

    .practice-card-wrapper {
      perspective: 1000px;
    }

    .practice-card {
      position: relative;
      width: 100%;
      height: 320px;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
      cursor: pointer;
      margin-bottom: 2rem;
    }

    .practice-card.flipped {
      transform: rotateY(180deg);
    }

    .card-face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: var(--white);
      border: 2px solid var(--border);
      border-radius: 24px;
      box-shadow: var(--shadow-md);
    }

    .card-back {
      transform: rotateY(180deg);
      border-color: var(--orange);
      background: var(--orange-bg);
    }

    .card-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      margin-bottom: 1.5rem;
    }

    .card-content {
      font-family: 'Playfair Display', serif;
      font-size: 2.5rem;
      font-weight: 900;
      color: var(--ink);
      text-align: center;
    }

    .card-hint {
      margin-top: 2rem;
      font-size: 0.75rem;
      color: var(--muted);
      font-style: italic;
    }

    .practice-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .control-btn {
      width: 48px;
      height: 48px;
      border-radius: 24px;
      border: 1.5px solid var(--border);
      background: var(--white);
      color: var(--ink);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .control-btn:hover:not(:disabled) {
      border-color: var(--orange);
      color: var(--orange);
    }

    .control-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .practice-idx {
      font-family: 'DM Mono', monospace;
      font-weight: 700;
      color: var(--muted);
    }

    .practice-actions {
      display: flex;
      justify-content: center;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.8rem 1.5rem;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      border: 1.5px solid var(--border);
      background: var(--white);
      color: var(--ink);
    }

    .action-btn.master:hover {
      border-color: var(--green);
      color: var(--green);
    }

    .action-btn.master.is-mastered {
      background: var(--green);
      border-color: var(--green);
      color: white;
    }

    .empty-practice {
      padding: 4rem 2rem;
      background: var(--white);
      border: 2px solid var(--border);
      border-radius: 24px;
    }

    .empty-practice .material-icons {
      font-size: 4rem;
      color: var(--green);
      margin-bottom: 1rem;
    }

    .empty-practice h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }

    .empty-practice p {
      color: var(--muted);
      margin-bottom: 2rem;
    }

    .btn-primary {
      background: var(--ink);
      color: white;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
    }

    .nav-right {
      display: flex;
      justify-content: flex-end;
    }

    .mobile-only-btn {
      display: none;
    }

    @media (max-width: 600px) {
      .mobile-only-btn {
        display: flex;
      }
      .word-list-header .sort-btn {
        display: none;
      }
      .hero-header {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        padding-bottom: 1.5rem;
      }
      .progress-container.compact {
        height: 42px;
      }
      .progress-text {
        font-size: 0.7rem;
        padding: 0 0.5rem;
      }
      .lesson-header-main h2 {
        font-size: 1.8rem;
      }
      .lesson-header-main {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
      .lesson-nav {
        grid-template-columns: 80px 1fr 80px;
        gap: 0.5rem;
      }
      .nav-right { 
        display: flex;
        justify-content: flex-end;
      }
      .view-toggle button {
        padding: 0.4rem 0.8rem;
        font-size: 0.75rem;
      }
      .word-row {
        grid-template-columns: 1fr auto;
        padding: 1rem;
      }
      .col-english {
        grid-column: 1 / 2;
        margin-top: 0.25rem;
      }
      .col-done {
        grid-column: 2 / 3;
        grid-row: 1 / 3;
      }
      .word-list-header {
        display: none;
      }
    }
  `],
})
export class CommonWordsComponent {
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressService);

  protected readonly lessons = toSignal(this.content.commonWords(), {
    initialValue: [] as CommonWordLesson[],
  }) as Signal<CommonWordLesson[]>;

  protected readonly selectedLesson = signal<CommonWordLesson | null>(null);
  protected readonly viewMode = signal<'list' | 'practice'>('list');
  protected readonly hideMasteredLessons = signal(false);
  protected readonly sortMasteredLast = signal(false);
  protected helpOpen = false;

  // Mastery state from progress service
  protected readonly masteredIds = computed(() => [...this.progress.masteredCommonWords()]);

  protected readonly filteredLessons = computed(() => {
    const list = this.lessons();
    if (!this.hideMasteredLessons()) return list;
    return list.filter(l => !this.isLessonFullyMastered(l));
  });

  protected readonly masteredLessonsCount = computed(() => {
    return this.lessons().filter(l => this.isLessonFullyMastered(l)).length;
  });

  protected readonly masteryPct = computed(() => {
    const total = this.lessons().length;
    if (total === 0) return 0;
    return Math.round((this.masteredLessonsCount() / total) * 100);
  });

  protected readonly sortedCards = computed(() => {
    const lesson = this.selectedLesson();
    if (!lesson) return [];
    const cards = [...lesson.cards];
    if (!this.sortMasteredLast()) return cards;
    
    return cards.sort((a, b) => {
      const aDone = this.isMastered(a.id);
      const bDone = this.isMastered(b.id);
      if (aDone === bDone) return 0;
      return aDone ? 1 : -1;
    });
  });

  protected readonly lessonMasteryPct = computed(() => {
    const lesson = this.selectedLesson();
    if (!lesson) return 0;
    const masteredCount = this.getLessonMasteredCount(lesson);
    return Math.round((masteredCount / lesson.cards.length) * 100);
  });

  // Practice mode state
  protected readonly currentIdx = signal(0);
  protected readonly isFlipped = signal(false);
  protected readonly practiceCards = computed(() => {
    const lesson = this.selectedLesson();
    if (!lesson) return [];
    return lesson.cards;
  });

  selectLesson(lesson: CommonWordLesson | null): void {
    this.selectedLesson.set(lesson);
    this.currentIdx.set(0);
    this.isFlipped.set(false);
    this.viewMode.set('list');
    if (lesson) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  isMastered(id: string): boolean {
    return this.masteredIds().includes(id);
  }

  getLessonMasteredCount(lesson: CommonWordLesson): number {
    return lesson.cards.filter(c => this.isMastered(c.id)).length;
  }

  isLessonFullyMastered(lesson: CommonWordLesson): boolean {
    if (lesson.cards.length === 0) return false;
    return lesson.cards.every(c => this.isMastered(c.id));
  }

  toggleMastery(id: string): void {
    const current = new Set(this.progress.masteredCommonWords());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.progress.writeMasteredCommonWords(current);
    this.progress.syncCommonWords([...current]);
  }

  toggleFlip(): void {
    this.isFlipped.update(v => !v);
  }

  nextCard(event: MouseEvent): void {
    event.stopPropagation();
    if (this.currentIdx() < this.practiceCards().length - 1) {
      this.isFlipped.set(false);
      setTimeout(() => this.currentIdx.update(i => i + 1), 150);
    }
  }

  prevCard(event: MouseEvent): void {
    event.stopPropagation();
    if (this.currentIdx() > 0) {
      this.isFlipped.set(false);
      setTimeout(() => this.currentIdx.update(i => i - 1), 150);
    }
  }
}
