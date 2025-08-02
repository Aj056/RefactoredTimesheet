import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center p-4">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <span class="ml-2 mt-2 text-gray-600 dark:text-gray-400 transition-colors">{{ message() }}</span>
      </div>
    </div>
  `
})
export class LoadingComponent {
  readonly message = input<string>('Loading...');
}
