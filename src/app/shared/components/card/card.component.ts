import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses()">
      @if (header()) {
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white transition-colors">{{ header() }}</h3>
          @if (subtitle()) {
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">{{ subtitle() }}</p>
          }
        </div>
      }
      
      <div [class]="contentClasses()">
        <ng-content></ng-content>
      </div>
      
      @if (showFooter()) {
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 transition-colors">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      }
    </div>
  `,
  host: {
    'class': 'block'
  }
})
export class CardComponent {
  // Inputs
  readonly header = input<string>('');
  readonly subtitle = input<string>('');
  readonly padding = input<boolean>(true);
  readonly shadow = input<'none' | 'sm' | 'md' | 'lg'>('md');
  readonly rounded = input<boolean>(true);
  readonly border = input<boolean>(true);
  readonly hoverable = input<boolean>(false);
  readonly showFooter = input<boolean>(false); // Simple boolean input to control footer visibility
  
  cardClasses(): string {
    const baseClasses = 'bg-white dark:bg-gray-800 overflow-hidden transition-colors';
    
    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg'
    };
    
    const roundedClass = this.rounded() ? 'rounded-lg' : '';
    const borderClass = this.border() ? 'border border-gray-200 dark:border-gray-700' : '';
    const hoverClass = this.hoverable() ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : '';
    
    return [
      baseClasses,
      shadowClasses[this.shadow()],
      roundedClass,
      borderClass,
      hoverClass
    ].filter(Boolean).join(' ');
  }
  
  contentClasses(): string {
    return this.padding() ? 'p-6' : '';
  }
}
