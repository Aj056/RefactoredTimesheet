import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { APP_CONFIG } from '../config/app.config';
import { ToastService } from '../../shared/services/toast.service';

export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: 'employee' | 'admin';
  readonly avatar?: string;
}

export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly message?: string;
  readonly error?: string;
}

export interface LoginCredentials {
  readonly username: string;
  readonly password: string;
}

export interface AuthData {
  readonly user: User;
  readonly token: string;
  readonly expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  
  private readonly API_BASE = APP_CONFIG.API.BASE_URL;
  private readonly AUTH_STORAGE_KEY = APP_CONFIG.AUTH.TOKEN_STORAGE_KEY;
  private readonly TOKEN_EXPIRY_HOURS = APP_CONFIG.AUTH.TOKEN_EXPIRY_HOURS;
  
  // Private signals for internal state
  private readonly _user = signal<User | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _token = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);
  
  // Public readonly signals
  readonly user = this._user.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null && this.isTokenValid());
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly isEmployee = computed(() => this._user()?.role === 'employee');
  
  constructor() {
    this.initializeFromStorage();
  }
  
  async login(username: string, password: string): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);
    
    try {
      // Validate input
      if (!username?.trim() || !password?.trim()) {
        this._error.set('Username and password are required');
        return false;
      }

      console.log('Attempting login with:', { username });
      
      const response = await firstValueFrom(
        this.http.post<any>(`${this.API_BASE}/login`, {
          username: username.trim(),
          password
        }).pipe(
          catchError(this.handleHttpError.bind(this))
        )
      );
      
      console.log('Login response:', response);
      
      if (response && response.data && response.token) {
        // Transform API response to our User interface
        const user: User = {
          id: response.data._id,
          email: response.data.employeeEmail,
          name: response.data.employeeName,
          role: response.data.role === 'admin' ? 'admin' : 'employee',
          avatar: undefined
        };
        
        console.log('Setting user:', user);
        console.log('Setting token:', response.token.tokens);
        
        const expiresAt = Date.now() + (this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
        
        this._user.set(user);
        this._token.set(response.token.tokens);
        this.saveToStorage({ user, token: response.token.tokens, expiresAt });
        
        // Show success message
        this.toastService.success(`Welcome back, ${user.name}!`);
        
        // Navigate based on role and return URL
        await this.navigateAfterLogin();
        
        return true;
      }
      
      this._error.set('Invalid response from server');
      console.error('Invalid response structure:', response);
      return false;
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      this._error.set(errorMessage);
      console.error('Login failed:', error);
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }
  
  async logout(): Promise<void> {
    this._isLoading.set(true);
    
    try {
      console.log('Logging out user...');
      
      // Optional: Call logout API endpoint if available
      // await firstValueFrom(this.http.post(`${this.API_BASE}/logout`, {}));
      
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearState();
      this._isLoading.set(false);
      await this.router.navigate(['/login']);
    }
  }

  /**
   * Force logout - clears all auth data and redirects to login
   * Used when token is invalid or expired
   */
  forceLogout(): void {
    console.log('Force logout triggered');
    this.clearState();
    this.toastService.info('Your session has expired. Please log in again.');
    this.router.navigate(['/login']);
  }

  /**
   * Check if current token is valid and not expired
   */
  private isTokenValid(): boolean {
    const stored = localStorage.getItem(this.AUTH_STORAGE_KEY);
    if (!stored) return false;

    try {
      const { expiresAt } = JSON.parse(stored);
      return Date.now() < expiresAt;
    } catch {
      return false;
    }
  }

  /**
   * Navigate user to appropriate dashboard after login
   */
  private async navigateAfterLogin(): Promise<void> {
    const user = this._user();
    if (!user) return;

    // Check for return URL in query params
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl');
    
    if (returnUrl && returnUrl !== '/login') {
      await this.router.navigateByUrl(returnUrl);
      return;
    }

    // Default navigation based on role
    const route = user.role === 'admin' ? '/admin' : '/dashboard';
    console.log('Navigating to:', route);
    await this.router.navigate([route]);
  }
  
  private initializeFromStorage(): void {
    const stored = localStorage.getItem(this.AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const { user, token, expiresAt }: AuthData = JSON.parse(stored);
        
        // Check if token is expired
        if (Date.now() >= expiresAt) {
          console.log('Stored token expired, clearing auth data');
          this.clearState();
          return;
        }
        
        this._user.set(user);
        this._token.set(token);
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
        this.clearState();
      }
    }
  }

  private saveToStorage(data: AuthData): void {
    try {
      localStorage.setItem(this.AUTH_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save auth data to storage:', error);
    }
  }

  private clearState(): void {
    this._user.set(null);
    this._token.set(null);
    this._error.set(null);
    localStorage.removeItem(this.AUTH_STORAGE_KEY);
  }

  /**
   * Handle HTTP errors with user-friendly messages
   */
  private handleHttpError(error: HttpErrorResponse) {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.status === 0) {
      errorMessage = 'Unable to connect to server. Please check your internet connection.';
    } else if (error.status === 401) {
      errorMessage = 'Invalid username or password';
    } else if (error.status === 403) {
      errorMessage = 'Access denied';
    } else if (error.status >= 400 && error.status < 500) {
      errorMessage = error.error?.message || 'Invalid request';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Get user-friendly error message from any error
   */
  private getErrorMessage(error: any): string {
    if (error?.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'An unexpected error occurred. Please try again.';
  }  getToken(): string | null {
    return this._token();
  }

  /**
   * Refresh token if needed (placeholder for future implementation)
   */
  async refreshToken(): Promise<boolean> {
    // TODO: Implement token refresh logic if API supports it
    console.log('Token refresh not implemented');
    return false;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: 'admin' | 'employee'): boolean {
    return this._user()?.role === role;
  }

  /**
   * Get current user data
   */
  getCurrentUser(): User | null {
    return this._user();
  }

  /**
   * Check if authentication data exists and is valid
   */
  isValidSession(): boolean {
    return this.isAuthenticated();
  }
}
