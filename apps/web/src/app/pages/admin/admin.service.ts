import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { 
  AdminUserDto, 
  AdminStatsDto, 
  AdminSignupChartDto, 
  AdminAttemptsChartDto,
  AdminAuditLogDto,
  AdminUserPatchDto,
  PaginatedResult,
  AdminChartRange
} from '@moredutch/shared';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/admin`;

  getUsers(page: number, limit: number, search: string): Observable<PaginatedResult<AdminUserDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search) params = params.set('search', search);

    return this.http.get<PaginatedResult<AdminUserDto>>(`${this.apiUrl}/users`, { params });
  }

  getUser(id: string): Observable<AdminUserDto> {
    return this.http.get<AdminUserDto>(`${this.apiUrl}/users/${id}`);
  }

  patchUser(id: string, dto: AdminUserPatchDto): Observable<AdminUserDto> {
    return this.http.patch<AdminUserDto>(`${this.apiUrl}/users/${id}`, dto);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  exportUsers(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/users-export`, { responseType: 'blob' });
  }

  getStats(): Observable<AdminStatsDto> {
    return this.http.get<AdminStatsDto>(`${this.apiUrl}/stats`);
  }

  getSignupChart(range: AdminChartRange): Observable<AdminSignupChartDto[]> {
    return this.http.get<AdminSignupChartDto[]>(`${this.apiUrl}/stats/signups`, { params: { range } });
  }

  getAttemptsChart(range: AdminChartRange): Observable<AdminAttemptsChartDto[]> {
    return this.http.get<AdminAttemptsChartDto[]>(`${this.apiUrl}/stats/attempts`, { params: { range } });
  }

  getAuditLogs(page: number, limit: number, event?: string): Observable<PaginatedResult<AdminAuditLogDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (event) params = params.set('event', event);

    return this.http.get<PaginatedResult<AdminAuditLogDto>>(`${this.apiUrl}/audit-logs`, { params });
  }
}
