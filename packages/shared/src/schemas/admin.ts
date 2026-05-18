export interface AdminUserPatchDto {
  displayName?: string | null;
  isBanned?: boolean;
  bannedReason?: string | null;
  isAdmin?: boolean;
}

export type AdminChartRange = '1h' | '1d' | '1w' | '1m' | '1y' | 'all';

export interface AdminUserDto {
  id: string;
  email: string;
  displayName: string | null;
  emailVerified: boolean;
  hasTotp: boolean;
  createdAt: string;
  isAdmin: boolean;
  isBanned: boolean;
  bannedReason: string | null;
  bannedAt: string | null;
  lastLoginAt: string | null;
  masteredSheets: number;
  masteredVerbs: number;
  totalAttempts: number;
}

export interface AdminStatsDto {
  totalUsers: number;
  activeUsers24h: number;
  activeUsers7d: number;
  totalQuizAttempts: number;
  totalKnmAttempts: number;
}

export interface AdminSignupChartDto {
  date: string;
  count: number;
}

export interface AdminAttemptsChartDto {
  date: string;
  quizCount: number;
  knmCount: number;
}

export interface AdminAuditLogDto {
  id: string;
  userId: string | null;
  userEmail: string | null;
  event: string;
  ip: string | null;
  userAgent: string | null;
  meta: any;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SystemSettingDto {
  key: string;
  value: string;
  updatedAt: string;
}

export type UpdateSettingsDto = Record<string, string>;

