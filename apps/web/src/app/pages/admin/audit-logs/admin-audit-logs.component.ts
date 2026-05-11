import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../admin.service';
import type { AdminAuditLogDto, PaginatedResult } from '@moredutch/shared';

@Component({
  selector: 'md-admin-audit-logs',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page-header">
      <h1>Audit Logs</h1>
      <div class="filters">
        <select (change)="onEventFilterChange($event)">
          <option value="">All Events</option>
          <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
          <option value="LOGIN_FAILED">LOGIN_FAILED</option>
          <option value="REGISTER">REGISTER</option>
          <option value="PASSWORD_RESET_REQUEST">PASSWORD_RESET_REQUEST</option>
          <option value="PASSWORD_RESET_SUCCESS">PASSWORD_RESET_SUCCESS</option>
          <option value="EMAIL_VERIFY">EMAIL_VERIFY</option>
        </select>
      </div>
    </div>

    @if (result(); as res) {
      <div class="table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Event</th>
              <th>User</th>
              <th>IP / Agent</th>
            </tr>
          </thead>
          <tbody>
            @for (log of res.data; track log.id) {
              <tr class="clickable-row" (click)="showMeta(log)">
                <td class="mono muted">{{ formatDateTime(log.createdAt) }}</td>
                <td><span class="event-badge" [class]="getEventClass(log.event)">{{ log.event }}</span></td>
                <td>
                  @if (log.userEmail) {
                    <div class="user-email">{{ log.userEmail }}</div>
                  } @else {
                    <span class="muted-text">Anonymous</span>
                  }
                  <div class="mono muted small">{{ log.userId || '' }}</div>
                </td>
                <td>
                  <div class="mono small">{{ log.ip || 'Unknown IP' }}</div>
                  <div class="muted small truncate" [title]="log.userAgent">{{ log.userAgent || 'Unknown Agent' }}</div>
                </td>
              </tr>
            }
            @if (res.data.length === 0) {
              <tr>
                <td colspan="4" class="empty-state">No audit logs found.</td>
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
      <div class="loading-state">Loading logs...</div>
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
      .filters select {
        padding: 0.5rem 1rem;
        border-radius: 8px;
        border: 1.5px solid var(--border);
        background: var(--white);
        font-family: 'DM Sans', sans-serif;
        color: var(--ink);
        outline: none;
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
        vertical-align: middle;
      }
      .admin-table tr:last-child td {
        border-bottom: none;
      }
      .admin-table tr:hover {
        background: var(--stripe);
      }
      .clickable-row {
        cursor: pointer;
      }
      .clickable-row:hover {
        background: var(--stripe-hover, #f8f9fa);
      }

      .event-badge {
        display: inline-block;
        font-size: 0.7rem;
        font-family: 'DM Mono', monospace;
        font-weight: 600;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        background: var(--stripe);
        color: var(--muted);
      }
      .event-badge.success { background: var(--green-light); color: var(--green); }
      .event-badge.danger { background: var(--red-light); color: var(--red); }
      .event-badge.info { background: var(--blue-light); color: var(--blue); }
      .event-badge.warning { background: var(--gold-light); color: var(--gold); }

      .mono { font-family: 'DM Mono', monospace; }
      .muted { color: var(--muted); }
      .small { font-size: 0.75rem; }
      .muted-text { color: var(--muted); font-style: italic; }
      .user-email { font-weight: 600; font-size: 0.9rem; color: var(--ink); }
      .truncate { 
        max-width: 250px; 
        white-space: nowrap; 
        overflow: hidden; 
        text-overflow: ellipsis; 
      }

      .empty-state { text-align: center; padding: 3rem !important; color: var(--muted); font-style: italic; }
      .loading-state { text-align: center; padding: 3rem; color: var(--muted); background: var(--white); border: 1.5px dashed var(--border); border-radius: 12px; }

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
      .pagination button:hover:not([disabled]) { background: var(--stripe); }
      .pagination button[disabled] { opacity: 0.5; cursor: not-allowed; }
    `
  ]
})
export class AdminAuditLogsComponent implements OnInit {
  protected Math = Math;
  private readonly adminService = inject(AdminService);

  protected result = signal<PaginatedResult<AdminAuditLogDto> | null>(null);
  protected page = signal(1);
  protected eventFilter = signal<string | undefined>(undefined);
  
  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.adminService.getAuditLogs(this.page(), 30, this.eventFilter()).subscribe(res => {
      this.result.set(res);
    });
  }

  setPage(p: number) {
    this.page.set(p);
    this.loadLogs();
  }

  onEventFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.eventFilter.set(target.value || undefined);
    this.page.set(1);
    this.loadLogs();
  }

  formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toISOString().replace('T', ' ').substring(0, 19);
  }

  getEventClass(event: string): string {
    if (event.includes('SUCCESS') || event === 'REGISTER') return 'success';
    if (event.includes('FAIL') || event.includes('ERROR')) return 'danger';
    if (event.includes('WARNING') || event.includes('LOCK')) return 'warning';
    return 'info';
  }

  showMeta(log: AdminAuditLogDto) {
    if (!log.meta) {
      alert('No extra metadata for this event.');
      return;
    }
    alert(`Event: ${log.event}\n\nMetadata:\n${JSON.stringify(log.meta, null, 2)}`);
  }
}
