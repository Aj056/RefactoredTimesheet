import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { 
  CardComponent, 
  ReusableButtonComponent,
  ToastService 
} from '../../../../shared/components';
import { AuthService } from '../../../../core/services/auth.service';
import { LocationService } from '../../../../core/services/location.service';

interface TimeLog {
  date: string;
  checkin: string;
  checkout: string;
  totalhours: string;
  autocheckout: boolean;
  _id: string;
}

interface Employee {
  _id: string;
  employeeName: string;
  status: boolean;
  timelog: TimeLog[];
}

interface CheckinResponse {
  message: string;
  timelog: TimeLog[];
}

@Component({
  selector: 'app-employee-checkin',
  standalone: true,
  imports: [CommonModule, CardComponent, ReusableButtonComponent],
  template: `
    <app-card class="relative overflow-hidden hover:shadow-lg transition-all duration-300">
      <!-- Background decoration -->
      <div class="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/10 dark:via-emerald-900/10 dark:to-teal-900/10 transition-colors"></div>
      <div class="absolute top-0 right-0 w-20 sm:w-28 h-20 sm:h-28 bg-green-100 dark:bg-green-800/10 rounded-full -translate-y-10 sm:-translate-y-14 translate-x-10 sm:translate-x-14 opacity-30 dark:opacity-20"></div>
      <div class="absolute bottom-0 left-0 w-16 sm:w-20 h-16 sm:h-20 bg-teal-100 dark:bg-teal-800/10 rounded-full translate-y-8 sm:translate-y-10 -translate-x-8 sm:-translate-x-10 opacity-30 dark:opacity-20"></div>
      
      <!-- Content -->
      <div class="relative z-10 p-4 sm:p-6">
        <!-- Current Status -->
        <div class="mb-6">
          @if (isCheckedIn()) {
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg p-4 text-center">
              <div class="flex items-center justify-center mb-2">
                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span class="text-sm font-medium text-green-600 dark:text-green-400">Currently Working</span>
              </div>
              <p class="text-xs text-green-600 dark:text-green-400 mb-3">
                Started at {{ checkInTime() || '9:00 AM' }}
              </p>
              <div class="text-2xl font-bold text-green-800 dark:text-green-300 font-mono">
                {{ workingHours() }}
              </div>
              <p class="text-xs text-green-600 dark:text-green-400 mt-1">Hours worked today</p>
            </div>
          } @else {
            <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-4 text-center">
              <div class="flex items-center justify-center mb-2">
                <div class="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  @if (lastAction()?.type === 'Check-out') {
                    Work Completed
                  } @else {
                    Not Working
                  }
                </span>
              </div>
              @if (lastAction()?.type === 'Check-out') {
                <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">You have completed your work for today</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Total time worked: {{ workingHours() }}
                </p>
              } @else {
                <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">Ready to start your day?</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Click the button below to check in</p>
              }
            </div>
          }
        </div>

        <!-- Action Button -->
        <div class="flex justify-center flex-col items-center">
          @if (isCheckedIn()) {
            <app-reusable-button
              text="Check Out"
              variant="danger"
              size="lg"
              icon="logout"
              [disabled]="isLoading()"
              (click)="checkOut()"
              class="min-w-[140px]" />
          } @else {
            <!-- Location Verification Status -->
            @if (locationService.locationError()) {
              <div class="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                <div class="flex items-center text-amber-700 dark:text-amber-300 text-sm">
                  <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                  <span>{{ locationService.locationError() }}</span>
                </div>
                <button 
                  (click)="verifyLocation()" 
                  [disabled]="locationService.isCheckingLocation()"
                  class="mt-2 text-xs bg-amber-100 dark:bg-amber-800/20 text-amber-800 dark:text-amber-200 px-2 py-1 rounded hover:bg-amber-200 dark:hover:bg-amber-700/30 transition-colors disabled:opacity-50">
                  @if (locationService.isCheckingLocation()) {
                    <span class="flex items-center">
                      <div class="animate-spin rounded-full h-3 w-3 border border-amber-600 border-t-transparent mr-1"></div>
                      Checking...
                    </span>
                  } @else {
                    Try Again
                  }
                </button>
              </div>
            }

            <!-- Check In Button -->
            <app-reusable-button
              text="Check In"
              variant="primary"
              size="lg"
              icon="login"
              [disabled]="isLoading() || (lastAction()?.type === 'Check-out') || !locationService.isInOfficeNetwork() || locationService.isCheckingLocation()"
              (click)="checkIn()"
              class="min-w-[140px]" />
              
            <!-- Location Status Indicator -->
            <div class="mt-3 text-center">
              @if (locationService.isCheckingLocation()) {
                <div class="flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs">
                  <div class="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent mr-2"></div>
                  Verifying office location...
                </div>
              } @else if (locationService.isInOfficeNetwork()) {
                <div class="flex items-center justify-center text-green-600 dark:text-green-400 text-xs">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Connected to office network
                </div>
              } @else {
                <div class="flex items-center justify-center text-red-600 dark:text-red-400 text-xs">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  Not in office network
                </div>
              }
            </div>
          }
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex items-center justify-center mt-4">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 dark:border-green-400"></div>
            <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Processing...</span>
          </div>
        }

        <!-- Last Action -->
        @if (lastAction()) {
          <div class="text-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Last {{ lastAction()?.type }}: {{ lastAction()?.time }}
            </p>
          </div>
        }
      </div>
    </app-card>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class EmployeeCheckinComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  readonly locationService = inject(LocationService);

  // API configuration
  private readonly API_BASE_URL = 'https://attendance-three-lemon.vercel.app';

  // Get current employee ID from auth service
  private get EMPLOYEE_ID(): string {
    const currentUser = this.authService.user();
    if (!currentUser?.id) {
      console.error('No authenticated user found');
      this.toastService.error('Please log in again');
      throw new Error('No authenticated user');
    }
    return currentUser.id;
  }

  // Component state signals
  readonly isLoading = signal(false);
  readonly isCheckedIn = signal(false);
  readonly checkInTime = signal<string>('');
  readonly workingHours = signal<string>('00:00:00');
  readonly lastAction = signal<{type: string, time: string} | null>(null);
  readonly currentTimeLog = signal<TimeLog | null>(null);

  // Timer for working hours calculation
  private workingTimeInterval: number | null = null;

  ngOnInit(): void {
    // Check if user is authenticated before loading status
    if (!this.authService.isAuthenticated()) {
      this.toastService.error('Please log in to access this feature');
      return;
    }
    
    this.loadEmployeeStatus();
    // Verify office location on component load
    this.verifyLocation();
  }

  ngOnDestroy(): void {
    this.stopWorkingTimeCounter();
  }

  async verifyLocation(): Promise<void> {
    try {
      await this.locationService.checkOfficeNetwork();
    } catch (error) {
      console.error('Location verification failed:', error);
      this.toastService.error('Unable to verify office location');
    }
  }

  async checkIn(): Promise<void> {
    if (this.isCheckedIn() || this.isLoading()) return;

    // Verify location before check-in
    const isInOffice = await this.locationService.checkOfficeNetwork();
    if (!isInOffice) {
      this.toastService.error('You must be connected to office WiFi to check in');
      return;
    }

    this.isLoading.set(true);

    try {
      const employeeId = this.EMPLOYEE_ID;
      const response = await this.http.post<CheckinResponse>(
        `${this.API_BASE_URL}/checkin`,
        { id: employeeId }
      ).toPromise();

      if (response && response.timelog.length > 0) {
        const timeLog = response.timelog[0];
        this.currentTimeLog.set(timeLog);
        this.isCheckedIn.set(true);
        
        // Format check-in time
        const checkInDate = new Date(timeLog.checkin);
        const timeString = checkInDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        this.checkInTime.set(timeString);
        this.lastAction.set({
          type: 'Check-in',
          time: timeString
        });

        // Start working time counter
        this.startWorkingTimeCounter(checkInDate);
        
        this.toastService.success(`${response.message} at ${timeString}`);
      }
    } catch (authError: any) {
      if (authError.message === 'No authenticated user') {
        // User needs to log in again
        return;
      }
      
      console.error('Check-in failed:', authError);
      
      // Handle specific API error messages
      if (authError.status === 400 && authError.error?.message === 'Already checked in today') {
        this.toastService.error('You have already completed your work for today. Check-in is not allowed after checkout.');
      } else if (authError.error?.message) {
        this.toastService.error(authError.error.message);
      } else {
        this.toastService.error('Check-in failed. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async checkOut(): Promise<void> {
    if (!this.isCheckedIn() || this.isLoading()) return;

    this.isLoading.set(true);

    try {
      const employeeId = this.EMPLOYEE_ID;
      const response = await this.http.post<CheckinResponse>(
        `${this.API_BASE_URL}/checkout`,
        { id: employeeId }
      ).toPromise();

      if (response) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        // Stop working time counter
        this.stopWorkingTimeCounter();
        
        this.isCheckedIn.set(false);
        this.lastAction.set({
          type: 'Check-out',
          time: timeString
        });

        // Get final working time before reset
        const totalTime = this.workingHours();
        
        this.toastService.success(`Checked out successfully at ${timeString}. Total working time: ${totalTime}`);
        
        // Reset for next day
        this.checkInTime.set('');
        this.workingHours.set('00:00:00');
        this.currentTimeLog.set(null);
      }
    } catch (authError: any) {
      if (authError.message === 'No authenticated user') {
        // User needs to log in again
        return;
      }
      
      console.error('Check-out failed:', authError);
      
      // Handle specific API error messages
      if (authError.status === 403 && authError.error?.message) {
        this.toastService.error(authError.error.message);
      } else if (authError.error?.message) {
        this.toastService.error(authError.error.message);
      } else {
        this.toastService.error('Check-out failed. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadEmployeeStatus(): Promise<void> {
    try {
      const employeeId = this.EMPLOYEE_ID;
      const employee = await this.http.get<Employee>(
        `${this.API_BASE_URL}/view/${employeeId}`
      ).toPromise();

      if (employee) {
        // Check if timelog is empty (new day)
        if (employee.timelog.length === 0) {
          // New day - reset all states to allow fresh check-in
          this.isCheckedIn.set(false);
          this.checkInTime.set('');
          this.workingHours.set('00:00:00');
          this.lastAction.set(null);
          this.currentTimeLog.set(null);
          return;
        }

        // Check if user is currently checked in (status: true and has active timelog)
        if (employee.status && employee.timelog.length > 0) {
          const activeTimeLog = employee.timelog.find(log => !log.checkout);
          
          if (activeTimeLog) {
            this.currentTimeLog.set(activeTimeLog);
            this.isCheckedIn.set(true);
            
            // Set check-in time
            const checkInDate = new Date(activeTimeLog.checkin);
            const timeString = checkInDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
            this.checkInTime.set(timeString);
            
            // Start working time counter
            this.startWorkingTimeCounter(checkInDate);
          }
        } else if (!employee.status && employee.timelog.length > 0) {
          // Employee has completed work for the day (checked out)
          const lastTimeLog = employee.timelog[employee.timelog.length - 1];
          if (lastTimeLog.checkout) {
            const checkOutDate = new Date(lastTimeLog.checkout);
            const timeString = checkOutDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
            
            this.lastAction.set({
              type: 'Check-out',
              time: timeString
            });
            
            // Set working hours to show completed time
            this.workingHours.set(lastTimeLog.totalhours + ':00');
          }
        }
      }
    } catch (authError) {
      if (authError instanceof Error && authError.message === 'No authenticated user') {
        // User needs to log in again
        return;
      }
      console.error('Failed to load employee status:', authError);
    }
  }

  private startWorkingTimeCounter(checkInDate: Date): void {
    if (this.workingTimeInterval) {
      clearInterval(this.workingTimeInterval);
    }

    this.workingTimeInterval = window.setInterval(() => {
      if (this.isCheckedIn()) {
        const now = new Date();
        const diff = now.getTime() - checkInDate.getTime();
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.workingHours.set(timeString);
      }
    }, 1000);
  }

  private stopWorkingTimeCounter(): void {
    if (this.workingTimeInterval) {
      clearInterval(this.workingTimeInterval);
      this.workingTimeInterval = null;
    }
  }
}
