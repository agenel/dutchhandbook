import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import type { LoginDto, RegisterDto } from '@moredutch/shared';
import type { PublicUser } from '@moredutch/shared';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly base = `${environment.apiBaseUrl}/auth`;

  private readonly _user = signal<PublicUser | null>(null);
  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => this._user() !== null);

  bootstrap(): Observable<PublicUser | null> {
    if (!this.isBrowser) return of(null);
    return this.http.get<PublicUser>(`${this.base}/me`).pipe(
      tap((u) => this._user.set(u)),
      catchError(() => {
        this._user.set(null);
        return of(null);
      }),
    );
  }

  register(dto: RegisterDto): Observable<PublicUser> {
    return this.http
      .post<PublicUser>(`${this.base}/register`, dto)
      .pipe(tap((u) => this._user.set(u)));
  }

  login(dto: LoginDto): Observable<PublicUser> {
    return this.http
      .post<PublicUser>(`${this.base}/login`, dto)
      .pipe(tap((u) => this._user.set(u)));
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.base}/logout`, {})
      .pipe(tap(() => this._user.set(null)));
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`${this.base}/password/request-reset`, { email });
  }

  confirmPasswordReset(token: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.base}/password/confirm-reset`, { token, password });
  }

  verifyEmail(token: string): Observable<void> {
    return this.http.post<void>(`${this.base}/email/verify`, { token });
  }
}
