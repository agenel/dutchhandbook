import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'md-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-layout">
      <nav class="admin-sidebar">
        <div class="sidebar-header">
          <a routerLink="/" class="hub-logo">More<span>Dutch</span></a>
          <div class="admin-badge">ADMIN</div>
        </div>
        <ul class="sidebar-menu">
          <li>
            <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
              <span class="material-icons">dashboard</span> Dashboard
            </a>
          </li>
          <li>
            <a routerLink="/admin/users" routerLinkActive="active">
              <span class="material-icons">people</span> Users
            </a>
          </li>
          <li>
            <a routerLink="/admin/mail-templates" routerLinkActive="active">
              <span class="material-icons">email</span> Email Templates
            </a>
          </li>
          <li>
            <a routerLink="/admin/audit-logs" routerLinkActive="active">
              <span class="material-icons">history</span> Audit Logs
            </a>
          </li>
          <li>
            <a routerLink="/admin/system" routerLinkActive="active">
              <span class="material-icons">monitor_heart</span> System
            </a>
          </li>
        </ul>
        <div class="sidebar-footer">
          <a routerLink="/profile" class="sidebar-link">
            <span class="material-icons">account_circle</span> Back to Profile
          </a>
        </div>
      </nav>
      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .admin-layout {
        display: flex;
        min-height: 100vh;
        margin: -2.5rem -1rem -2.5rem -1rem; /* Negate the padding from body/page layout if any */
      }
      .admin-sidebar {
        width: 260px;
        background: var(--white);
        border-right: 1.5px solid var(--border);
        display: flex;
        flex-direction: column;
        padding: 1.5rem 0;
        flex-shrink: 0;
      }
      .sidebar-header {
        padding: 0 1.5rem;
        margin-bottom: 2rem;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
      .hub-logo {
        font-family: 'Playfair Display', serif;
        font-size: 1.4rem;
        font-weight: 900;
        color: var(--ink);
        text-decoration: none;
        letter-spacing: -0.03em;
      }
      .hub-logo span {
        color: var(--orange);
      }
      .admin-badge {
        font-family: 'DM Mono', monospace;
        font-size: 0.65rem;
        font-weight: 600;
        background: var(--ink);
        color: var(--cream);
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        letter-spacing: 0.05em;
      }
      .sidebar-menu {
        list-style: none;
        padding: 0 1rem;
        flex: 1;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .sidebar-menu a {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        color: var(--muted);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        border-radius: 8px;
        transition: all 0.2s;
      }
      .sidebar-menu a .material-icons {
        font-size: 1.2rem;
      }
      .sidebar-menu a:hover {
        background: var(--stripe);
        color: var(--ink);
      }
      .sidebar-menu a.active {
        background: var(--orange-bg);
        color: var(--orange);
        font-weight: 600;
      }
      .sidebar-footer {
        padding: 0 1.5rem;
        border-top: 1px solid var(--border);
        padding-top: 1rem;
        margin-top: auto;
      }
      .sidebar-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--muted);
        text-decoration: none;
        font-size: 0.85rem;
        transition: color 0.2s;
      }
      .sidebar-link:hover {
        color: var(--ink);
      }
      .admin-content {
        flex: 1;
        padding: 2rem 3rem;
        background: var(--cream);
        overflow-y: auto;
      }

      @media (max-width: 768px) {
        .admin-layout {
          flex-direction: column;
        }
        .admin-sidebar {
          width: 100%;
          border-right: none;
          border-bottom: 1.5px solid var(--border);
          padding: 1rem;
        }
        .sidebar-header {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .sidebar-menu {
          flex-direction: row;
          flex-wrap: wrap;
          padding: 0;
        }
        .sidebar-menu a {
          padding: 0.5rem 0.75rem;
          font-size: 0.85rem;
        }
        .sidebar-menu a .material-icons {
          font-size: 1.1rem;
        }
        .admin-content {
          padding: 1.5rem 1rem;
        }
      }
    `,
  ],
})
export class AdminShellComponent {}
