import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ModalService } from '../../../../shared/services/modal.service';

export interface EmployeeNavigationItem {
  label: string;
  icon: string;
  action: () => void;
  variant?: 'default' | 'primary' | 'danger';
}

@Component({
  selector: 'app-employee-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <!-- Trigger Button -->
      <button
        (click)="toggleDropdown()"
        class="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        [class.ring-2]="isOpen()"
        [class.ring-blue-500]="isOpen()"
        [class.ring-opacity-50]="isOpen()">
        
        <svg class="w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-200" 
             [class.rotate-90]="isOpen()" 
             fill="none" 
             stroke="currentColor" 
             viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
        </svg>
      </button>

      <!-- Dropdown Menu -->
      @if (isOpen()) {
        <div 
          class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in"
          (click)="$event.stopPropagation()">
          
          <!-- Header -->
          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
              <button 
                (click)="closeDropdown()"
                class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Navigation Items -->
          <div class="py-2">
            @for (item of navigationItems; track item.label) {
              <button
                (click)="executeAction(item)"
                class="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                [class]="getItemClasses(item.variant)">
                
                <div class="flex items-center space-x-3 flex-1">
                  <div class="p-2 rounded-lg transition-colors"
                       [class]="getIconClasses(item.variant)">
                    <i [class]="item.icon + ' w-4 h-4'"></i>
                  </div>
                  <span class="text-sm font-medium">{{ item.label }}</span>
                </div>
                
                <svg class="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            }
          </div>
        </div>
      }
    </div>

    <!-- Backdrop -->
    @if (isOpen()) {
      <div 
        class="fixed inset-0 z-40"
        (click)="closeDropdown()">
      </div>
    }
  `,
  styles: [`
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }
  `]
})
export class EmployeeNavigationComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);
  
  readonly isOpen = signal(false);
  
  readonly navigationItems: EmployeeNavigationItem[] = [
    {
      label: 'View Profile',
      icon: 'fas fa-user',
      action: () => this.viewProfile(),
      variant: 'primary'
    },
    {
      label: 'Logout',
      icon: 'fas fa-sign-out-alt',
      action: () => this.logout(),
      variant: 'danger'
    }
  ];

  toggleDropdown(): void {
    this.isOpen.update(open => !open);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  executeAction(item: EmployeeNavigationItem): void {
    item.action();
    this.closeDropdown();
  }

  getItemClasses(variant?: string): string {
    switch (variant) {
      case 'primary':
        return 'text-blue-700 dark:text-blue-300';
      case 'danger':
        return 'text-red-700 dark:text-red-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  }

  getIconClasses(variant?: string): string {
    switch (variant) {
      case 'primary':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50';
      case 'danger':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-900/50';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600';
    }
  }

  private viewProfile(): void {
    this.router.navigate(['/employee/profile']);
  }

  private logout(): void {
    this.modalService.confirmLogout(() => {
      this.authService.logout();
      this.toastService.success('Logged out successfully');
      this.router.navigate(['/login']);
    });
  }
}
