import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MetaService } from '../../core/meta.service';

@Component({
  selector: 'md-help',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero" style="border-bottom:none; padding-top:1rem;">
      <div class="hero-layout">
        <div class="hero-title">
          <h1>Learning<br /><em>Guide</em></h1>
        </div>
        <div class="hero-content">
          <p class="hero-desc">
            How to get the most out of More Dutch. Everything you need to know about
            mastery tracking, dark mode, flashcard mode, and the full curriculum.
          </p>
          <div class="hero-pills">
            <div class="pill">A1 — B1</div>
            <div class="pill">Self-paced</div>
            <div class="pill">Free forever</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-title">
      Quick Start
      <div class="title-line"></div>
    </div>

    <div class="help-section">
      <h3>1. Pick a starting point</h3>
      <p>
        New to Dutch? Start with the
        <a routerLink="/sheets/pronouns">Pronouns</a> sheet.
        Already comfortable? Jump to
        <a routerLink="/cheatsheets">the full library</a> and use the level pills
        to filter A1 / A2 / B1.
      </p>
    </div>

    <div class="help-section">
      <h3>2. Practice with tools</h3>
      <p>
        The <a routerLink="/tools/verb-explorer">Verb Explorer</a>,
        <a routerLink="/tools/de-het">de/het Trainer</a> and
        <a routerLink="/tools/flashcards">Flashcards</a> are designed to be used in 5-minute
        bursts. Build a daily habit.
      </p>
    </div>

    <div class="help-section">
      <h3>3. Track your mastery</h3>
      <p>
        Each cheat sheet has a <strong>Mark as Mastered</strong> button at the bottom.
        Once you mark a topic, it shows up with a green check and contributes to the
        progress bar on the home page.
      </p>
    </div>

    <div class="help-section">
      <h3>4. Test Mode</h3>
      <p>
        Click the toggle in the header to blur English translations across the site,
        mimicking a native "spoiler" blackout. Hover or tap to reveal — perfect for
        active recall.
      </p>
    </div>

    <div class="help-section">
      <h3>5. Sync across devices</h3>
      <p>
        Anonymous use saves all progress to your browser. To carry your mastery
        across devices, <a routerLink="/auth/register">create a free account</a>.
      </p>
    </div>
  `,
})
export class HelpComponent {
  constructor() {
    inject(MetaService).set({
      title: 'Learning Guide — More Dutch',
      description:
        'How to get the most out of More Dutch — full learning guide for the interactive Dutch grammar hub.',
      canonicalPath: '/help',
    });
  }
}
