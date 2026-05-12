import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';
import type { AdminUserDto, PaginatedResult } from '@moredutch/shared';

@Component({
  selector: 'md-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page-header">
      <div class="header-left">
        <h1>User Management</h1>
        <button class="action-btn text" (click)="loadUsers()" [disabled]="loading()">
          <span class="material-icons">refresh</span> Refresh
        </button>
        <button class="action-btn text" (click)="exportUsers()" [disabled]="loading()">
          <span class="material-icons">download</span> Export to CSV
        </button>
      </div>
      <div class="search-bar">
        <span class="material-icons search-icon">search</span>
        <input 
          type="text" 
          placeholder="Search by email or name..." 
          [ngModel]="searchQuery()" 
          (ngModelChange)="onSearchChange($event)"
        >
      </div>
    </div>

    @if (result(); as res) {
      <div class="table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Stats</th>
              <th>Joined / Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (user of res.data; track user.id) {
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="user-name">{{ user.displayName || 'No Name' }}</div>
                    <div class="user-email">{{ user.email }}</div>
                    @if (user.isAdmin) {
                      <span class="badge admin">ADMIN</span>
                    }
                  </div>
                </td>
                <td>
                  @if (user.isBanned) {
                    <span class="badge banned">BANNED</span>
                    <div class="small-muted">{{ user.bannedReason }}</div>
                  } @else {
                    <span class="badge active">ACTIVE</span>
                  }
                  <div class="verification-status">
                    @if (user.emailVerified) {
                      <span class="badge verified">
                        <span class="material-icons" style="font-size:0.7rem;">verified</span> VERIFIED
                      </span>
                    } @else {
                      <span class="badge unverified" [title]="getUnverifiedWarning(user)">
                        <span class="material-icons" style="font-size:0.7rem;">help_outline</span> UNVERIFIED
                        @if (isNearDeletion(user)) {
                          <span class="material-icons warning-pulse" style="font-size:0.8rem; color: var(--red);">warning</span>
                        }
                      </span>
                    }
                  </div>
                </td>
                <td>
                  <div class="stats-cell">
                    <span title="Sheets Mastered">📘 {{ user.masteredSheets }}</span>
                    <span title="Verbs Mastered">🗣️ {{ user.masteredVerbs }}</span>
                    <span title="Total Attempts">📝 {{ user.totalAttempts }}</span>
                  </div>
                </td>
                <td>
                  <div class="date-cell">
                    <div title="Joined">J: {{ formatDate(user.createdAt) }}</div>
                    <div title="Last Login">L: {{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never' }}</div>
                  </div>
                </td>
                <td>
                  <div class="actions-cell">
                    <button class="action-btn" [disabled]="loading()" title="Toggle Admin" (click)="toggleAdmin(user)">
                      <span class="material-icons">{{ user.isAdmin ? 'remove_moderator' : 'security' }}</span>
                    </button>
                    <button class="action-btn" [class.danger]="!user.isBanned" [disabled]="loading()" title="Toggle Ban" (click)="toggleBan(user)">
                      <span class="material-icons">{{ user.isBanned ? 'lock_open' : 'block' }}</span>
                    </button>
                    <button class="action-btn danger" [disabled]="loading()" title="Delete User" (click)="deleteUser(user)">
                      <span class="material-icons">delete_forever</span>
                    </button>
                  </div>
                </td>
              </tr>
            }
            @if (res.data.length === 0) {
              <tr>
                <td colspan="5" class="empty-state">No users found.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button [disabled]="page() === 1" (click)="setPage(page() - 1)">Previous</button>
        <span>Page {{ res.page }} of {{ Math.ceil(res.total / res.pageSize) || 1 }} ({{ res.total }} total)</span>
        <button [disabled]="page() * res.pageSize >= res.total" (click)="setPage(page() + 1)">Next</button>
      </div>
    } @else {
      <div class="loading-state">Loading users...</div>
    }
  `,
  styles: [
    `
      .admin-page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .admin-page-header h1 {
        font-family: 'Playfair Display', serif;
        font-size: 1.8rem;
        color: var(--ink);
        margin: 0;
      }
      .header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .action-btn.text {
        padding: 0.5rem 0.8rem;
        font-size: 0.85rem;
        font-family: 'DM Sans', sans-serif;
        font-weight: 500;
        gap: 0.4rem;
        border-color: var(--border);
      }
      .search-bar {
        display: flex;
        align-items: center;
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 8px;
        padding: 0.5rem 0.8rem;
        width: 300px;
        max-width: 100%;
      }
      .search-icon {
        color: var(--muted);
        font-size: 1.2rem;
        margin-right: 0.5rem;
      }
      .search-bar input {
        border: none;
        background: transparent;
        outline: none;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.9rem;
        width: 100%;
        color: var(--ink);
      }
      
      .table-container {
        background: var(--white);
        border: 1.5px solid var(--border);
        border-radius: 12px;
        overflow-x: auto;
      }
      .admin-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }
      .admin-table th {
        background: var(--stripe);
        padding: 1rem;
        font-size: 0.75rem;
        font-family: 'DM Mono', monospace;
        text-transform: uppercase;
        color: var(--muted);
        border-bottom: 1.5px solid var(--border);
      }
      .admin-table td {
        padding: 1rem;
        border-bottom: 1px solid var(--border);
        vertical-align: top;
      }
      .admin-table tr:last-child td {
        border-bottom: none;
      }
      .admin-table tr:hover {
        background: var(--stripe);
      }

      .user-cell {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }
      .user-name {
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--ink);
      }
      .user-email {
        font-size: 0.8rem;
        color: var(--muted);
      }

      .badge {
        display: inline-block;
        font-size: 0.65rem;
        font-family: 'DM Mono', monospace;
        font-weight: 600;
        padding: 0.15rem 0.4rem;
        border-radius: 4px;
        margin-top: 0.3rem;
        width: fit-content;
      }
      .badge.admin { background: var(--purple-light); color: var(--purple); }
      .badge.active { background: var(--green-light); color: var(--green); }
      .badge.banned { background: var(--red-light); color: var(--red); }
      .badge.verified { background: #e3f2fd; color: #1976d2; }
      .badge.unverified { background: #fff3e0; color: #ef6c00; }

      .verification-status {
        margin-top: 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .warning-pulse {
        animation: pulse 2s infinite;
        vertical-align: middle;
        margin-left: 2px;
      }

      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }

      .small-muted {
        font-size: 0.75rem;
        color: var(--muted);
        margin-top: 0.3rem;
      }

      .stats-cell {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        font-family: 'DM Mono', monospace;
        font-size: 0.8rem;
        color: var(--ink);
      }

      .date-cell {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        font-size: 0.8rem;
        color: var(--muted);
      }

      .actions-cell {
        display: flex;
        gap: 0.5rem;
      }
      .action-btn {
        background: transparent;
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 0.4rem;
        color: var(--muted);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .action-btn:hover {
        background: var(--border);
        color: var(--ink);
      }
      .action-btn.danger:hover {
        background: var(--red-light);
        color: var(--red);
        border-color: var(--red-border);
      }
      .action-btn .material-icons {
        font-size: 1.1rem;
      }

      .empty-state {
        text-align: center;
        padding: 3rem !important;
        color: var(--muted);
        font-style: italic;
      }
      .loading-state {
        text-align: center;
        padding: 3rem;
        color: var(--muted);
        background: var(--white);
        border: 1.5px dashed var(--border);
        border-radius: 12px;
      }

      .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1.5rem;
        font-size: 0.85rem;
        color: var(--muted);
      }
      .pagination button {
        background: var(--white);
        border: 1.5px solid var(--border);
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-family: 'DM Sans', sans-serif;
        font-weight: 500;
        cursor: pointer;
        color: var(--ink);
        transition: background 0.2s;
      }
      .pagination button:hover:not([disabled]) {
        background: var(--stripe);
      }
      .pagination button[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `
  ]
})
export class AdminUsersComponent implements OnInit {
  protected Math = Math;
  private readonly adminService = inject(AdminService);

  protected result = signal<PaginatedResult<AdminUserDto> | null>(null);
  protected page = signal(1);
  protected searchQuery = signal('');
  protected loading = signal(false);

  private searchTimeout: any;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.adminService.getUsers(this.page(), 20, this.searchQuery()).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setPage(p: number) {
    this.page.set(p);
    this.loadUsers();
  }

  onSearchChange(val: string) {
    this.searchQuery.set(val);
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.page.set(1);
      this.loadUsers();
    }, 400);
  }

  toggleAdmin(user: AdminUserDto) {
    if (!confirm(`Are you sure you want to ${user.isAdmin ? 'remove admin rights from' : 'make'} ${user.email} an admin?`)) return;
    this.loading.set(true);
    this.adminService.patchUser(user.id, { isAdmin: !user.isAdmin }).subscribe({
      next: () => this.loadUsers(),
      error: () => this.loading.set(false)
    });
  }

  toggleBan(user: AdminUserDto) {
    if (user.isBanned) {
      if (!confirm(`Unban ${user.email}?`)) return;
      this.loading.set(true);
      this.adminService.patchUser(user.id, { isBanned: false }).subscribe({
        next: () => this.loadUsers(),
        error: () => this.loading.set(false)
      });
    } else {
      const reason = prompt('Reason for ban (optional):');
      if (reason === null) return;
      this.loading.set(true);
      this.adminService.patchUser(user.id, { isBanned: true, bannedReason: reason }).subscribe({
        next: () => this.loadUsers(),
        error: () => this.loading.set(false)
      });
    }
  }

  deleteUser(user: AdminUserDto) {
    if (!confirm(`WARNING: This will permanently delete ${user.email} and all their data. Proceed?`)) return;
    if (!confirm(`Are you absolutely sure? This cannot be undone.`)) return;
    this.loading.set(true);
    this.adminService.deleteUser(user.id).subscribe({
      next: () => this.loadUsers(),
      error: () => this.loading.set(false)
    });
  }

  exportUsers() {
    this.loading.set(true);
    this.adminService.exportUsers().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  isNearDeletion(user: AdminUserDto): boolean {
    if (user.emailVerified) return false;
    const joined = new Date(user.createdAt);
    const elevenMonthsAgo = new Date();
    elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);
    return joined < elevenMonthsAgo;
  }

  getUnverifiedWarning(user: AdminUserDto): string {
    if (user.emailVerified) return '';
    if (this.isNearDeletion(user)) {
      return 'Account is older than 11 months and unverified. It will be deleted soon.';
    }
    return 'User has not verified their email.';
  }
}
