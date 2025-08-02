import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          [class]="getToastClasses(toast.type)"
          class="min-w-80 p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out animate-slide-up">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              @let icon = getIcon(toast.type);
              <span [innerHTML]="icon" class="flex-shrink-0"></span>
              <span class="font-medium">{{ toast.message }}</span>
            </div>
            <button 
              (click)="toastService.remove(toast.id)"
              class="text-gray-400 hover:text-gray-600 transition-colors ml-4 flex-shrink-0">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
  
  getToastClasses(type: string): string {
    const baseClasses = 'border-l-4';
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-success-50 border-success-500 text-success-800`;
      case 'error':
        return `${baseClasses} bg-error-50 border-error-500 text-error-800`;
      case 'warning':
        return `${baseClasses} bg-warning-50 border-warning-500 text-warning-800`;
      default:
        return `${baseClasses} bg-primary-50 border-primary-500 text-primary-800`;
    }
  }
  
  getIcon(type: string): string {
    const iconClasses = 'w-5 h-5';
    
    switch (type) {
      case 'success':
        return `<svg class="${iconClasses} text-success-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`;
      case 'error':
        return `<svg class="${iconClasses} text-error-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>`;
      case 'warning':
        return `<svg class="${iconClasses} text-warning-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`;
      default:
        return `<svg class="${iconClasses} text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>`;
    }
  }
}
