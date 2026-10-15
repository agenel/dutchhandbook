import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait for the session bootstrap to resolve before deciding — reading the
  // signal synchronously bounces legitimate admins on a hard refresh / deep
  // link, because `/auth/me` hasn't come back yet. `bootstrap()` is single-flight
  // (shareReplay), so this reuses the shell's in-flight request.
  return auth.bootstrap().pipe(
    map((user) => (user?.isAdmin ? true : router.createUrlTree(['/']))),
  );
};
