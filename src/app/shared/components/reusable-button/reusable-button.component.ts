import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reusable-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="getButtonClasses()"
      (click)="onClick()">
      @if (loading()) {
        <div class="flex items-center">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          {{ loadingText() || text() }}
        </div>
      } @else {
        @if (icon()) {
          <i [class]="icon() + ' mr-2'"></i>
        }
        {{ text() }}
      }
    </button>
  `
})
export class ReusableButtonComponent {
  readonly text = input.required<string>();
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly variant = input<'primary' | 'secondary' | 'danger' | 'success'>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly loadingText = input<string>('');
  readonly icon = input<string>('');
  readonly fullWidth = input<boolean>(false);

  readonly click = output<void>();

  onClick(): void {
    if (!this.disabled() && !this.loading()) {
      this.click.emit();
    }
  }

  getButtonClasses(): string {
    const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    // Size classes
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    // Variant classes with dark mode support
    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 disabled:opacity-50 dark:bg-gray-500 dark:hover:bg-gray-600',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600',
      success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600'
    };

    const widthClass = this.fullWidth() ? 'w-full' : '';

    return `${baseClasses} ${sizeClasses[this.size()]} ${variantClasses[this.variant()]} ${widthClass}`.trim();
  }
}
