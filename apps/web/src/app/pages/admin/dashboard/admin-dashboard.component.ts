import { ChangeDetectionStrategy, Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../admin.service';
import type { AdminStatsDto, AdminSignupChartDto, AdminAttemptsChartDto, AdminChartRange } from '@moredutch/shared';

@Component({
  selector: 'md-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page-header">
      <div class="header-left">
        <h1>Dashboard Overview</h1>
        <div class="range-selector">
          @for (r of ranges; track r.val) {
            <button 
              [class.active]="selectedRange() === r.val"
              (click)="selectedRange.set(r.val)"
            >{{ r.label }}</button>
          }
        </div>
      </div>
      <button class="refresh-btn" (click)="loadAll()">
        <span class="material-icons">refresh</span>
      </button>
    </div>

    @if (stats(); as s) {
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon bg-ink-light"><span class="material-icons">people</span></div>
          <div class="kpi-content">
            <div class="kpi-title">Total Users</div>
            <div class="kpi-value">{{ s.totalUsers }}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon bg-blue-light"><span class="material-icons">bolt</span></div>
          <div class="kpi-content">
            <div class="kpi-title">Active (24h)</div>
            <div class="kpi-value text-blue">{{ s.activeUsers24h }}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon bg-green-light"><span class="material-icons">trending_up</span></div>
          <div class="kpi-content">
            <div class="kpi-title">Active (7d)</div>
            <div class="kpi-value text-green">{{ s.activeUsers7d }}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon bg-orange-light"><span class="material-icons">quiz</span></div>
          <div class="kpi-content">
            <div class="kpi-title">Quiz Runs</div>
            <div class="kpi-value text-orange">{{ s.totalQuizAttempts }}</div>
          </div>
        </div>
      </div>
    } @else {
      <div class="loading-placeholder kpi-shimmer"></div>
    }

    <div class="charts-grid">
      <div class="chart-container">
        <div class="chart-header">
          <h3>User Growth</h3>
          <div class="chart-value-main">{{ totalRangeSignups }} <small>new</small></div>
        </div>
        @if (signupChart(); as data) {
          <div class="svg-chart-wrapper">
            <svg viewBox="0 0 400 120" class="bar-chart" preserveAspectRatio="none">
              @for (point of data; track $index; let i = $index) {
                <rect
                  [attr.x]="(i * (400 / data.length)) + 1"
                  [attr.y]="120 - (point.count / maxSignupCount) * 110 - 5"
                  [attr.width]="(400 / data.length) - 2"
                  [attr.height]="(point.count / maxSignupCount) * 110 + 5"
                  fill="var(--orange)"
                  fill-opacity="0.8"
                  rx="2"
                >
                  <title>{{ point.date }}: {{ point.count }}</title>
                </rect>
              }
            </svg>
            <div class="chart-x-axis">
              <span>{{ data[0]?.date }}</span>
              <span>{{ data[data.length-1]?.date }}</span>
            </div>
          </div>
        } @else if (signupChart()) {
          <div class="empty-chart-state">
            <span class="material-icons">analytics</span>
            <p>No new signups in this period</p>
          </div>
        } @else {
          <div class="loading-state">Calculating growth...</div>
        }
      </div>

      <div class="chart-container">
        <div class="chart-header">
          <h3>Activity Volume</h3>
          <div class="chart-legend-inline">
             <span class="legend-item"><span class="dot bg-blue"></span> Quiz</span>
             <span class="legend-item"><span class="dot bg-orange"></span> KNM</span>
          </div>
        </div>
        @if (attemptsChart(); as data) {
          <div class="svg-chart-wrapper">
            <svg viewBox="0 0 400 120" class="line-chart" preserveAspectRatio="none">
              <!-- Grid lines -->
              <line x1="0" y1="30" x2="400" y2="30" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="4,4"/>
              <line x1="0" y1="60" x2="400" y2="60" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="4,4"/>
              <line x1="0" y1="90" x2="400" y2="90" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="4,4"/>

              <!-- Quiz line -->
              <polyline
                [attr.points]="quizPoints"
                fill="none"
                stroke="var(--blue)"
                stroke-width="2.5"
                stroke-linejoin="round"
              />
              <!-- KNM line -->
              <polyline
                [attr.points]="knmPoints"
                fill="none"
                stroke="var(--orange)"
                stroke-width="2.5"
                stroke-linejoin="round"
              />
            </svg>
            <div class="chart-x-axis">
              <span>{{ data[0]?.date }}</span>
              <span>{{ data[data.length-1]?.date }}</span>
            </div>
          </div>
        } @else if (attemptsChart()) {
          <div class="empty-chart-state">
            <span class="material-icons">history</span>
            <p>No activity recorded in this period</p>
          </div>
        } @else {
          <div class="loading-state">Analyzing activity...</div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .admin-page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }
      .header-left {
        display: flex;
        align-items: center;
        gap: 2rem;
      }
      .admin-page-header h1 {
        font-family: 'Playfair Display', serif;
        font-size: 1.8rem;
        color: var(--ink);
        margin: 0;
      }

      .range-selector {
        display: flex;
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 8px;
        padding: 2px;
      }
      .range-selector button {
        padding: 0.4rem 0.8rem;
        font-size: 0.75rem;
        font-weight: 600;
        border: none;
        background: transparent;
        color: var(--muted);
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.2s;
      }
      .range-selector button.active {
        background: var(--ink);
        color: var(--white);
      }
      .refresh-btn {
        background: var(--white);
        border: 1.5px solid var(--border);
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--muted);
      }

      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
      }
      .kpi-card {
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 16px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1.2rem;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      .kpi-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .kpi-icon .material-icons { font-size: 1.5rem; }
      .bg-ink-light { background: #f1f1f1; color: var(--ink); }
      .bg-blue-light { background: #eef6ff; color: var(--blue); }
      .bg-green-light { background: #effaf3; color: var(--green); }
      .bg-orange-light { background: #fff7ed; color: var(--orange); }

      .kpi-title { font-size: 0.8rem; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
      .kpi-value { font-family: 'DM Mono', monospace; font-size: 1.8rem; font-weight: 700; color: var(--ink); line-height: 1.2; }
      .text-blue { color: var(--blue); }
      .text-green { color: var(--green); }
      .text-orange { color: var(--orange); }

      .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
        gap: 2rem;
      }
      .chart-container {
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 20px;
        padding: 2rem;
      }
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2rem;
      }
      .chart-header h3 { font-size: 1.1rem; margin: 0; color: var(--ink); }
      .chart-value-main { font-family: 'DM Mono', monospace; font-size: 1.5rem; font-weight: 700; }
      .chart-value-main small { font-size: 0.8rem; color: var(--muted); font-weight: 500; margin-left: 0.2rem; }

      .svg-chart-wrapper { position: relative; width: 100%; height: 200px; padding-bottom: 20px; }
      .bar-chart, .line-chart { width: 100%; height: 100%; overflow: visible; }
      
      .chart-x-axis {
        display: flex;
        justify-content: space-between;
        margin-top: 1rem;
        font-family: 'DM Mono', monospace;
        font-size: 0.7rem;
        color: var(--muted);
      }

      .chart-legend-inline { display: flex; gap: 1rem; }
      .legend-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 600; color: var(--muted); }
      .dot { width: 8px; height: 8px; border-radius: 50%; }
      .bg-blue { background: var(--blue); }
      .bg-orange { background: var(--orange); }

      .loading-placeholder { height: 120px; background: var(--white); border: 1.5px solid var(--border); border-radius: 16px; margin-bottom: 3rem; }
      .kpi-shimmer { background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
      
      .empty-chart-state {
        height: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--muted);
        gap: 0.5rem;
      }
      .empty-chart-state .material-icons { font-size: 2.5rem; opacity: 0.3; }
      .empty-chart-state p { margin: 0; font-size: 0.9rem; font-style: italic; }

      @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

      @media (max-width: 768px) {
        .charts-grid { grid-template-columns: 1fr; }
        .header-left { flex-direction: column; align-items: flex-start; gap: 1rem; }
      }
    `
  ]
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  protected readonly ranges: { label: string, val: AdminChartRange }[] = [
    { label: '1H', val: '1h' },
    { label: '1D', val: '1d' },
    { label: '1W', val: '1w' },
    { label: '1M', val: '1m' },
    { label: '1Y', val: '1y' },
    { label: 'ALL', val: 'all' },
  ];

  protected selectedRange = signal<AdminChartRange>('1m');
  protected stats = signal<AdminStatsDto | null>(null);
  protected signupChart = signal<AdminSignupChartDto[] | null>(null);
  protected attemptsChart = signal<AdminAttemptsChartDto[] | null>(null);

  protected maxSignupCount = 1;
  protected maxAttemptCount = 1;
  protected totalRangeSignups = 0;

  protected quizPoints = '';
  protected knmPoints = '';

  constructor() {
    // Re-load charts when range changes
    effect(() => {
      this.loadCharts(this.selectedRange());
    });
  }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.adminService.getStats().subscribe(s => this.stats.set(s));
    this.loadCharts(this.selectedRange());
  }

  loadCharts(range: AdminChartRange) {
    this.signupChart.set(null);
    this.attemptsChart.set(null);

    this.adminService.getSignupChart(range).subscribe(data => {
      this.maxSignupCount = Math.max(...data.map(d => d.count), 1);
      this.totalRangeSignups = data.reduce((acc, curr) => acc + curr.count, 0);
      this.signupChart.set(data);
    });

    this.adminService.getAttemptsChart(range).subscribe(data => {
      if (data.length === 0) {
        this.attemptsChart.set([]);
        return;
      }
      
      this.maxAttemptCount = Math.max(...data.map(d => Math.max(d.quizCount, d.knmCount)), 1);
      
      const width = 400;
      const height = 120;
      const padding = 10;

      this.quizPoints = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (d.quizCount / this.maxAttemptCount) * (height - padding) - padding/2;
        return `${x},${y}`;
      }).join(' ');

      this.knmPoints = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (d.knmCount / this.maxAttemptCount) * (height - padding) - padding/2;
        return `${x},${y}`;
      }).join(' ');

      this.attemptsChart.set(data);
    });
  }
}

