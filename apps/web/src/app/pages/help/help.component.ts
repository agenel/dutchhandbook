import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
            Master Dutch grammar with purpose. This guide covers the science behind our tools, 
            how to track your journey, and strategies to reach B1 fluency faster.
          </p>
          <div class="hero-pills">
            <div class="pill">A1 — B1</div>
            <div class="pill">Science-Based</div>
            <div class="pill">Free Forever</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-title">
      The More Dutch Method
      <div class="title-line"></div>
    </div>

    <div class="help-grid">
      <div class="help-card">
        <span class="material-icons card-icon">psychology</span>
        <h3>Active Recall</h3>
        <p>
          Don't just read. Use the <strong>Test Mode</strong> (eye icon in header) to hide English 
          translations. Forcing your brain to remember a word strengthens the neural path 
          far better than passive reading.
        </p>
      </div>
      <div class="help-card">
        <span class="material-icons card-icon">update</span>
        <h3>Micro-Learning</h3>
        <p>
          Language is a muscle. Use the <a routerLink="/tools/de-het">de/het Trainer</a> 
          for 5 minutes every morning. Small, daily sessions beat a 3-hour weekend cramming session every time.
        </p>
      </div>
    </div>

    <div class="section-title" style="margin-top:3rem;">
      Mastering the Tools
      <div class="title-line"></div>
    </div>

    <div class="tool-help-section">
      <div class="tool-info">
        <h3><span class="material-icons">explore</span> Verb Explorer</h3>
        <p>
          Master the 200 most common Dutch verbs. 
          <strong>Pro Tip:</strong> Pay attention to the "Helper" column. Verbs like <em>gaan</em> or 
          <em>komen</em> use <strong>zijn</strong> in the perfect tense instead of the usual <strong>hebben</strong>.
        </p>
      </div>

      <div class="tool-info">
        <h3><span class="material-icons">donut_large</span> Conjugation Wheel</h3>
        <p>
          See all three tenses — Present, Past, and Perfect — arranged spatially around the infinitive.
          <strong>Pro Tip:</strong> Use <strong>Drill Mode</strong> and set the Type filter to 
          <em>Irregular</em> only. Mastering the ~40 most common irregular verbs covers 80% of real conversations.
        </p>
      </div>

      <div class="tool-info">
        <h3><span class="material-icons">architecture</span> Sentence Builder</h3>
        <p>
          The hardest part of Dutch is the word order. 
          <strong>Pro Tip:</strong> Practice the <strong>V2 Rule</strong> (verb is always second) and 
          <strong>Inversion</strong> (when time/place comes first, the verb and subject swap).
        </p>
      </div>

      <div class="tool-info">
        <h3><span class="material-icons">quiz</span> de / het Trainer</h3>
        <p>
          There are no perfect rules for noun gender, but there are patterns! 
          <strong>Pro Tip:</strong> All diminutives (ending in <em>-je</em>) and all infinitives 
          used as nouns are always <strong>het</strong>.
        </p>
      </div>

      <div class="tool-info">
        <h3><span class="material-icons">style</span> Flashcards</h3>
        <p>
          Perfect for building your core vocabulary. 
          <strong>Pro Tip:</strong> Say the words out loud. Linking the visual word with the 
          auditory sound of your own voice significantly improves retention.
        </p>
      </div>

      <div class="tool-info">
        <h3><span class="material-icons">assignment</span> KNM Mock Exam</h3>
        <p>
          Preparing for your Inburgering? Our KNM exam covers all 10 chapters of Dutch society. 
          <strong>Pro Tip:</strong> Focus on the "Werk" and "Onderwijs" chapters, as they often 
          feature heavily in the real DUO exam.
        </p>
      </div>
    </div>

    <div class="section-title" style="margin-top:3rem;">
      Common Questions
      <div class="title-line"></div>
    </div>

    <div class="faq-section">
      <details>
        <summary>How does Mastery Tracking work?</summary>
        <p>
          Every cheat sheet has a "Mark as Mastered" button. When you feel confident in a topic, 
          mark it. Your dashboard and homepage will update with your progress percentage. 
          Try to reach 100% for each CEFR level (A1, A2, B1).
        </p>
      </details>
      <details>
        <summary>Is my progress saved?</summary>
        <p>
          Yes! By default, we save everything to your local browser storage. If you want to sync 
          your progress to your phone or tablet, just <a routerLink="/auth/register">create a free account</a>.
        </p>
      </details>
      <details>
        <summary>What is "Test Mode"?</summary>
        <p>
          Click the eye icon in the top header. It blurs out English meanings on all cheat sheets 
          and tools. Hover over a blurred word to reveal it. This is the best way to test if you 
          actually know the material.
        </p>
      </details>
    </div>
  `,
  styles: [`
    .help-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-top: 1rem;
    }
    .help-card {
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
    }
    .card-icon {
      color: var(--orange);
      font-size: 2.2rem;
      margin-bottom: 1rem;
    }
    .help-card h3 {
      font-family: 'Playfair Display', serif;
      margin-bottom: 0.75rem;
    }
    .help-card p {
      font-size: 0.9rem;
      color: var(--muted);
      line-height: 1.6;
    }

    .tool-help-section {
      display: grid;
      gap: 2rem;
      margin-top: 1rem;
    }
    .tool-info h3 {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-family: 'Playfair Display', serif;
      margin-bottom: 0.6rem;
    }
    .tool-info h3 .material-icons {
      color: var(--orange);
      font-size: 1.3rem;
    }
    .tool-info p {
      font-size: 0.95rem;
      color: var(--ink);
      line-height: 1.6;
    }
    .tool-info strong {
      color: var(--orange);
    }

    .faq-section {
      margin-top: 1rem;
    }
    details {
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: 12px;
      margin-bottom: 0.75rem;
      overflow: hidden;
    }
    summary {
      padding: 1rem 1.5rem;
      font-weight: 600;
      cursor: pointer;
      list-style: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.95rem;
    }
    summary::after {
      content: '+';
      color: var(--orange);
      font-size: 1.2rem;
    }
    details[open] summary::after {
      content: '−';
    }
    details p {
      padding: 0 1.5rem 1.2rem;
      font-size: 0.9rem;
      color: var(--muted);
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .help-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class HelpComponent {}
