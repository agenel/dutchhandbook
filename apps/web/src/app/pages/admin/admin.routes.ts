import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-shell.component').then(m => m.AdminShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        data: { title: 'Admin Dashboard — More Dutch' }
      },
      {
        path: 'users',
        loadComponent: () => import('./users/admin-users.component').then(m => m.AdminUsersComponent),
        data: { title: 'Manage Users — More Dutch' }
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./audit-logs/admin-audit-logs.component').then(m => m.AdminAuditLogsComponent),
        data: { title: 'Audit Logs — More Dutch' }
      },
      {
        path: 'mail-templates',
        loadComponent: () => import('./mail-templates/admin-mail-templates.component').then(m => m.AdminMailTemplatesComponent),
        data: { title: 'Email Templates — More Dutch' }
      },
      {
        path: 'dev-tools',
        loadComponent: () => import('./dev-tools/admin-dev-tools.component').then(m => m.AdminDevToolsComponent),
        data: { title: 'Developer Tools — More Dutch' }
      },
      {
        path: 'system',
        loadComponent: () => import('./system/admin-system.component').then(m => m.AdminSystemComponent),
        data: { title: 'System Health — More Dutch' }
      }
    ]
  }
];

