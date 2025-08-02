import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Admin Role Guard - Protects admin-only routes
 * Ensures only users with admin role can access admin routes
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (authService.isAdmin()) {
    return true;
  }

  // Redirect non-admin users to their dashboard
  router.navigate(['/dashboard']);
  return false;
};

/**
 * Employee Role Guard - Protects employee-only routes
 * Ensures only users with employee role can access employee routes
 */
export const employeeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (authService.isEmployee()) {
    return true;
  }

  // Redirect non-employee users to admin dashboard
  router.navigate(['/admin']);
  return false;
};
