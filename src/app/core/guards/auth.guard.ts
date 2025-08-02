import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Authentication Guard - Protects routes that require user authentication
 * Redirects to login if user is not authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store attempted URL for redirect after login
  const returnUrl = state.url;
  router.navigate(['/login'], { queryParams: { returnUrl } });
  return false;
};

/**
 * Login Guard - Prevents authenticated users from accessing login page
 * Redirects to appropriate dashboard based on role
 */
export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Redirect to appropriate dashboard
  const user = authService.user();
  const redirectUrl = user?.role === 'admin' ? '/admin' : '/dashboard';
  router.navigate([redirectUrl]);
  return false;
};
