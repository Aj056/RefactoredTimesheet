import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Skip auth for login endpoint
  if (req.url.includes('/login')) {
    return next(req);
  }

  // Get token from auth service
  const token = authService.getToken();
  
  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle unauthorized responses
      if (error.status === 401) {
        console.warn('Unauthorized request, forcing logout');
        authService.forceLogout();
      }
      
      // Handle forbidden responses
      if (error.status === 403) {
        console.warn('Forbidden request');
      }
      
      return throwError(() => error);
    })
  );
};
