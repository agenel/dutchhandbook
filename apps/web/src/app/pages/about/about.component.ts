import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'md-about',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero" style="border-bottom:none; padding-top:1rem;">
      <div class="hero-layout">
        <div class="hero-title">
          <h1>The<br /><em>Mission</em></h1>
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

    <div class="section-title" style="margin-top: 3rem;">
      Get in Touch
      <div class="title-line"></div>
    </div>

    <div class="help-section">
      @if (submitted()) {
        <div class="auth-shell" style="max-width: 500px; margin: 1.5rem 0 0; padding: 2.5rem 2rem; text-align: center;">
          <div style="margin-bottom: 1rem;">
            <span class="material-icons" style="font-size: 3.5rem; color: var(--green);">check_circle</span>
          </div>
          <h3 style="font-family: 'Playfair Display', serif; font-size: 1.6rem; color: var(--ink); margin-bottom: 0.5rem; text-transform: none; letter-spacing: normal;">
            Thank you!
          </h3>
          <p style="color: var(--muted); margin-bottom: 0; font-size: 0.95rem; text-transform: none; letter-spacing: normal;">
            Your message has been successfully sent.
          </p>
        </div>
      } @else {
        <h3>Have questions or feedback?</h3>
        <p>
          Whether you have a suggestion for More Dutch, found a bug, or just want to say hello, feel free to reach out using the form below.
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form" style="max-width: 500px; margin-top: 1.5rem;">
          <label class="auth-label">
            Name
            <input
              class="auth-input"
              type="text"
              placeholder="Your name"
              formControlName="name"
            />
          </label>

          <label class="auth-label">
            Email
            <input
              class="auth-input"
              type="email"
              placeholder="you@example.com"
              formControlName="email"
            />
          </label>

          <label class="auth-label">
            Message
            <textarea
              class="auth-input"
              rows="5"
              placeholder="Your message..."
              formControlName="message"
              style="font-family: inherit; resize: vertical;"
            ></textarea>
          </label>

          @if (error()) {
            <div class="auth-alert error">
              <span class="material-icons">error_outline</span>
              {{ error() }}
            </div>
          }

          <button
            class="fc-btn auth-submit"
            type="submit"
            [disabled]="loading() || form.invalid"
            style="width: fit-content; padding: 0.75rem 2rem; cursor: pointer;"
          >
            @if (loading()) {
              <span class="material-icons spin">autorenew</span>
            }
            Send Message
          </button>
        </form>
      }
    </div>
  `,
})
export class AboutComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);

    try {
      const res = await fetch('https://formspree.io/f/mredgkjl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(this.form.getRawValue())
      });

      if (res.ok) {
        this.submitted.set(true);
      } else {
        const data = await res.json().catch(() => ({}));
        this.error.set(data.error || 'Oops! There was a problem submitting your form.');
      }
    } catch {
      this.error.set('Oops! There was a problem submitting your form.');
    } finally {
      this.loading.set(false);
    }
  }
}
