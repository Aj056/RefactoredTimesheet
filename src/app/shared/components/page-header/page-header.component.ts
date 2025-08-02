import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

export interface PageHeaderAction {
  label: string;
  action: () => void;
  variant: 'primary' | 'secondary';
  icon?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white dark:bg-gray-800 shadow transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ title() }}</h1>
            @if (subtitle()) {
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ subtitle() }}</p>
            }
          </div>
          
          <div class="flex items-center space-x-3">
            <!-- Action Buttons -->
            @if (actions().length > 0) {
              @for (action of actions(); track action.label) {
                <button
                  [class]="getButtonClasses(action.variant)"
                  (click)="action.action()">
                  @if (action.icon) {
                    <i [class]="action.icon + ' mr-2'"></i>
                  }
                  {{ action.label }}
                </button>
              }
            }
          </div>
        </div>
      </div>
    </header>
  `
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly actions = input<PageHeaderAction[]>([]);

  getButtonClasses(variant: 'primary' | 'secondary'): string {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600`;
      case 'secondary':
        return `${baseClasses} bg-gray-600 hover:bg-gray-700 text-white dark:bg-gray-500 dark:hover:bg-gray-600`;
      default:
        return baseClasses;
    }
  }
}
