import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="buttonClasses()"
      (click)="handleClick($event)">
      
      @if (loading()) {
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
      
      @if (icon() && !loading()) {
        <span [innerHTML]="icon()" class="mr-2"></span>
      }
      
      <ng-content></ng-content>
    </button>
  `,
  host: {
    'class': 'inline-block'
  }
})
export class ButtonComponent {
  // Inputs
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly icon = input<string>('');
  readonly fullWidth = input<boolean>(false);
  
  // Outputs
  readonly clicked = output<Event>();
  
  handleClick(event: Event): void {
    this.clicked.emit(event);
  }
  
  buttonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    
    const variantClasses = {
      primary: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white',
      success: 'bg-success-600 hover:bg-success-700 focus:ring-success-500 text-white',
      warning: 'bg-warning-600 hover:bg-warning-700 focus:ring-warning-500 text-white',
      error: 'bg-error-600 hover:bg-error-700 focus:ring-error-500 text-white',
      ghost: 'bg-transparent hover:bg-gray-100 focus:ring-gray-500 text-gray-700 border border-gray-300'
    };
    
    const widthClass = this.fullWidth() ? 'w-full' : '';
    
    return [
      baseClasses,
      sizeClasses[this.size()],
      variantClasses[this.variant()],
      widthClass
    ].filter(Boolean).join(' ');
  }
}
