import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastComponent, ConfirmationModalComponent } from './shared/components';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastComponent, ConfirmationModalComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <router-outlet></router-outlet>
      
      <!-- Global Toast Notifications -->
      <app-toast />
      
      <!-- Global Confirmation Modal -->
      <app-confirmation-modal />
    </div>
  `
})
export class AppComponent {
  title = 'Modern Timesheet App';
  
  // Initialize theme service to ensure theme system works
  private themeService = inject(ThemeService);
}
