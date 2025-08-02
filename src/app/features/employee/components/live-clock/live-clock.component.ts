import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../../shared/components';

@Component({
  selector: 'app-live-clock',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <app-card class="relative overflow-hidden hover:shadow-lg transition-all duration-300">
      <!-- Background decoration -->
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/10 dark:via-teal-900/10 dark:to-cyan-900/10 transition-colors"></div>
      <div class="absolute top-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-emerald-100 dark:bg-emerald-800/10 rounded-full -translate-y-10 sm:-translate-y-12 -translate-x-10 sm:-translate-x-12 opacity-30 dark:opacity-20"></div>
      <div class="absolute bottom-0 right-0 w-12 sm:w-16 h-12 sm:h-16 bg-cyan-100 dark:bg-cyan-800/10 rounded-full translate-y-6 sm:translate-y-8 translate-x-6 sm:translate-x-8 opacity-30 dark:opacity-20"></div>
      
      <!-- Content -->
      <div class="relative z-10 p-3 sm:p-4">
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <!-- Clock Icon and Title -->
          <div class="flex items-center space-x-2">
            <div class="p-1 sm:p-1.5 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg shadow-sm">
              <svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white transition-colors">Live Time</h3>
            </div>
          </div>
          
          <!-- Live indicator -->
          <div class="flex items-center space-x-1">
            <div class="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-xs text-green-600 dark:text-green-400 font-medium transition-colors">LIVE</span>
          </div>
        </div>

        <!-- Time Display -->
        <div class="space-y-2 sm:space-y-3">
          <!-- Digital Clock -->
          <div class="text-center">
            <div class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-wider transition-colors">
              {{ currentTime() }}
            </div>
          </div>
          
          <!-- Date Information -->
          <div class="grid grid-cols-2 gap-1.5 sm:gap-2">
            <div class="text-center p-1.5 sm:p-2 bg-white dark:bg-gray-800/50 rounded-lg transition-colors">
              <div class="text-xs text-gray-500 dark:text-gray-400 font-medium transition-colors">Date</div>
              <div class="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white transition-colors">
                {{ currentDate() }}
              </div>
            </div>
            <div class="text-center p-1.5 sm:p-2 bg-white dark:bg-gray-800/50 rounded-lg transition-colors">
              <div class="text-xs text-gray-500 dark:text-gray-400 font-medium transition-colors">Day</div>
              <div class="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white transition-colors">
                {{ currentDay() }}
              </div>
            </div>
          </div>
          
          <!-- Additional Info -->
          <div class="text-center text-xs text-gray-500 dark:text-gray-400 pt-1 transition-colors">
            Week {{ weekNumber() }} • Day {{ dayOfYear() }}
          </div>
        </div>
      </div>
    </app-card>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .font-mono {
      font-family: 'Courier New', monospace;
    }
  `]
})
export class LiveClockComponent implements OnInit, OnDestroy {
  private intervalId: number | null = null;

  readonly currentTime = signal<string>('');
  readonly currentDate = signal<string>('');
  readonly currentDay = signal<string>('');
  readonly currentTimeZone = signal<string>('');
  readonly weekNumber = signal<number>(0);
  readonly dayOfYear = signal<number>(0);
  readonly timeUntilEndOfDay = signal<string>('');

  ngOnInit(): void {
    this.updateTime();
    // Update every second
    this.intervalId = window.setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateTime(): void {
    const now = new Date();
    
    // Format time (12-hour format with AM/PM)
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    this.currentTime.set(now.toLocaleTimeString('en-US', timeOptions));
    
    // Format date
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    this.currentDate.set(now.toLocaleDateString('en-US', dateOptions));
    
    // Format day
    const dayOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long'
    };
    this.currentDay.set(now.toLocaleDateString('en-US', dayOptions));
    
    // Time zone
    const timeZoneOptions: Intl.DateTimeFormatOptions = {
      timeZoneName: 'short'
    };
    const timeZoneString = now.toLocaleDateString('en-US', timeZoneOptions);
    this.currentTimeZone.set(timeZoneString.split(', ')[1] || 'Local Time');
    
    // Week number
    this.weekNumber.set(this.getWeekNumber(now));
    
    // Day of year
    this.dayOfYear.set(this.getDayOfYear(now));
    
    // Time until end of day
    this.timeUntilEndOfDay.set(this.getTimeUntilEndOfDay(now));
  }

  private getWeekNumber(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.ceil(diff / oneDay);
  }

  private getTimeUntilEndOfDay(now: Date): string {
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const diff = endOfDay.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}
