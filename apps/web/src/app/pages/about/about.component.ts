import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'md-about',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero" style="border-bottom:none; padding-top:1rem;">
      <div class="hero-layout">
        <div class="hero-title">
          <h1>Our<br /><em>Mission</em></h1>
        </div>
        <div class="hero-content">
          <p class="hero-desc">
            More Dutch is a dedicated tool for everyone enthusiastic about the Netherlands
            and aiming to integrate and become a Dutch citizen.
          </p>
        </div>
      </div>
    </div>

    <div class="section-title">
      The Journey
      <div class="title-line"></div>
    </div>

    <div class="help-section">
      <h3>Built by an expat, for expats</h3>
      <p>
        The path to naturalization in the Netherlands requires passing the KNM (Knowledge of Dutch Society) 
        and the official DUO Dutch language exams. As a developer who personally navigated this entire process, 
        I experienced firsthand the challenges of gathering study materials and mastering the grammar rules.
      </p>
      <p>
        I built <strong>More Dutch</strong> to provide future candidates with a streamlined, interactive, 
        and free tool to practice exactly what is needed for these exams.
      </p>
    </div>

    <div class="section-title" style="margin-top: 3rem;">
      How It Works
      <div class="title-line"></div>
    </div>

    <div class="help-section">
      <h3>1. Interactive Cheat Sheets</h3>
      <p>
        We've broken down Dutch grammar into bite-sized 
        <a routerLink="/cheatsheets">Cheat Sheets</a> covering everything from A1 to B1. 
        Track your mastery to see your progress grow.
      </p>
      
      <h3>2. Essential Tools</h3>
      <p>
        Use the <a routerLink="/tools/verb-explorer">Verb Explorer</a> to quickly find conjugations, 
        practice your nouns with the <a routerLink="/tools/de-het">de/het Trainer</a>, 
        or build your vocabulary with <a routerLink="/tools/flashcards">Flashcards</a>.
      </p>

      <h3>3. Exam Practice</h3>
      <p>
        Get ready for the integration exams using our dedicated 
        <a routerLink="/tools/knm-exam">KNM Practice Exam</a> simulator and 
        interactive <a routerLink="/tools/quiz">Grammar Quizzes</a>.
      </p>

      <h3>Need more info?</h3>
      <p>
        Check out our complete <a routerLink="/help">Learning Guide</a> for tips on using 
        Test Mode and syncing your progress across devices.
      </p>
    </div>
  `,
})
export class AboutComponent {}
