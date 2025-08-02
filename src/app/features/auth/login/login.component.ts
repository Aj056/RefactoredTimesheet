import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeToggleComponent } from '../../../shared/components';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ThemeToggleComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <!-- Theme Toggle in top right -->
      <div class="fixed top-4 right-4">
        <app-theme-toggle />
      </div>
      
      <div class="max-w-md w-full space-y-8">
        <!-- Company Logo -->
        <div class="text-center">
          <img 
            src="https://willwaretech.com/wp-content/uploads/2025/01/Untitled-1140-x-350-px-1.png" 
            alt="WillwareTech Logo" 
            class="mx-auto h-16 sm:h-20 w-auto object-contain mb-6"
          />
        </div>
        
        <!-- Header -->
        <div class="text-center">
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white transition-colors">
            Sign in to your account
          </h2>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
            Welcome back to WillwareTech Timesheet
          </p>
        </div>

        <!-- Login Form -->
        <div class=" p-8 rounded-lg shadow-lg">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Username Field -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
                Username
                <span class="text-red-500 ml-1">*</span>
              </label>
              <div class="relative">
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username (admin001)"
                  formControlName="username"
                  class="block w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                  [class.border-red-300]="getFieldError('username')"
                  [class.focus:border-red-500]="getFieldError('username')"
                  [class.focus:ring-red-500]="getFieldError('username')"
                  [class.border-gray-300]="!getFieldError('username')"
                  [class.focus:border-blue-500]="!getFieldError('username')"
                  [class.focus:ring-blue-500]="!getFieldError('username')" />
              </div>
              @if (getFieldError('username')) {
                <p class="mt-1 text-sm text-red-600">{{ getFieldError('username') }}</p>
              }
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Password
                <span class="text-red-500 ml-1">*</span>
              </label>
              <div class="relative">
                <input
                  id="password"
                  [type]="passwordVisible ? 'text' : 'password'"
                  placeholder="Enter your password (password123)"
                  formControlName="password"
                  class="block w-full px-3 py-2 pr-10 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                  [class.border-red-300]="getFieldError('password')"
                  [class.focus:border-red-500]="getFieldError('password')"
                  [class.focus:ring-red-500]="getFieldError('password')"
                  [class.border-gray-300]="!getFieldError('password')"
                  [class.focus:border-blue-500]="!getFieldError('password')"
                  [class.focus:ring-blue-500]="!getFieldError('password')" />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                  (click)="togglePasswordVisibility()">
                  @if (passwordVisible) {
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  } @else {
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  }
                </button>
              </div>
              @if (getFieldError('password')) {
                <p class="mt-1 text-sm text-red-600">{{ getFieldError('password') }}</p>
              }
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading()"
              class="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              @if (isLoading()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              } @else {
                Sign in
              }
            </button>

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="rounded-md bg-red-50 p-4">
                <div class="flex">
                  <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                  </svg>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">
                      Authentication failed
                    </h3>
                    <div class="mt-2 text-sm text-red-700">
                      <p>{{ errorMessage() }}</p>
                    </div>
                  </div>
                </div>
              </div>
            }
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Signals for reactive state
  readonly isLoading = this.authService.isLoading;
  readonly errorMessage = this.authService.error;
  
  // Local state
  passwordVisible = false;

  // Reactive form with demo credentials
  readonly loginForm = this.fb.group({
    username: ['admin001', [Validators.required, Validators.minLength(3)]],
    password: ['nimda', [Validators.required, Validators.minLength(3)]]
  });

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    try {
      const credentials = {
        username: this.loginForm.value.username!,
        password: this.loginForm.value.password!
      };

      const success = await this.authService.login(credentials.username, credentials.password);
      
      if (!success) {
        // Error message is handled by AuthService
        console.log('Login failed');
      }
      // Success navigation is handled by AuthService
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  getInputClasses(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    const hasError = field?.errors && field.touched;
    return hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      username: 'Username',
      password: 'Password'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}
