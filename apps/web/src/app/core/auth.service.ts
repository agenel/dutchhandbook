import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import type { LoginDto, RegisterDto } from '@moredutch/shared';
import type { PublicUser } from '@moredutch/shared';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly base = `${environment.apiBaseUrl}/auth`;

  private readonly _user = signal<PublicUser | null>(null);
  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => this._user() !== null);
  /** True once the initial session bootstrap has resolved (success or not). */
  readonly ready = signal(false);

  /** Shared, single-flight bootstrap so guards and the shell don't each fire a request. */
  private bootstrap$?: Observable<PublicUser | null>;

  bootstrap(): Observable<PublicUser | null> {
    if (!this.isBrowser) return of(null);
    if (!this.bootstrap$) {
      // `/auth/session` answers 200 with `{ user: null }` for anonymous visitors,
      // so normal page views don't log a red 401 in the console.
      this.bootstrap$ = this.http.get<{ user: PublicUser | null }>(`${this.base}/session`).pipe(
        map((r) => r?.user ?? null),
        tap((u) => {
          this._user.set(u);
          this.ready.set(true);
        }),
        catchError(() => {
          this._user.set(null);
          this.ready.set(true);
          return of(null);
        }),
        shareReplay(1),
      );
    }
    return this.bootstrap$;
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

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.base}/password/change`, { currentPassword, newPassword });
  }

  updateProfile(displayName: string | null): Observable<PublicUser> {
    return this.http
      .patch<PublicUser>(`${this.base}/profile`, { displayName })
      .pipe(tap((u) => this._user.set(u)));
  }

  /** Permanently delete the signed-in account (server clears the session cookies). */
  deleteAccount(password: string): Observable<void> {
    return this.http
      .post<void>(`${this.base}/account/delete`, { password })
      .pipe(tap(() => this._user.set(null)));
  }
}
