import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppRole } from '../models/database.models';
import { canAccess } from '../shared/utils/roles';

export const roleGuard: CanActivateFn = async (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'] as AppRole[] | undefined;
  const role = await authService.getRole();

  if (!canAccess(role, allowedRoles)) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};