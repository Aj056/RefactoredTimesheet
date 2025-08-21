import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  CardComponent, 
  ReusableButtonComponent, 
  ThemeToggleComponent,
  ToastService 
} from '../../../shared/components';
import { Employee, EmployeeService, TimeLog } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeNavigationComponent } from '../components/employee-navigation/employee-navigation.component';
import { MotivationalQuotesComponent } from '../components/motivational-quotes/motivational-quotes.component';
import { LiveClockComponent } from '../components/live-clock/live-clock.component';
import { EmployeeCheckinComponent } from '../components/employee-checkin/employee-checkin.component';

interface TimeEntry {
  id: string;
  date: string;
  project: string;
  hours: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    CardComponent, 
    ReusableButtonComponent, 
    ThemeToggleComponent,
    EmployeeNavigationComponent,
    MotivationalQuotesComponent,
    LiveClockComponent,
    EmployeeCheckinComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-3 sm:gap-0">
            <div class="text-center sm:text-left">
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white transition-colors">
                Employee Dashboard
              </h1>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                Welcome back, {{ currentEmployee()?.employeeName || 'Employee' }}!
              </p>
            </div>
            <div class="flex items-center justify-center sm:justify-end space-x-3 sm:space-x-4">
              <app-theme-toggle />
              <app-employee-navigation />
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8">
        <div class="px-4 sm:px-6 lg:px-8">
          @if (isLoading()) {
            <div class="flex justify-center items-center py-16">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span class="ml-3 text-gray-600 dark:text-gray-400 font-medium">Loading dashboard...</span>
            </div>
          } @else {
            <!-- Top Section: Motivation & Clock -->
            <div class="mb-6 sm:mb-8 grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
              <!-- Daily Motivation (spans 3 columns on XL screens) -->
              <div class="xl:col-span-3 order-2 xl:order-1">
                <app-motivational-quotes />
              </div>
              
              <!-- Live Clock (1 column on XL screens) -->
              <div class="xl:col-span-1 order-1 xl:order-2">
                <app-live-clock />
              </div>
            </div>

            <!-- Daily Check-in/Check-out Section -->
            <div class="mb-6 sm:mb-8">
              <app-employee-checkin />
            </div>

            <!-- Recent Time Logs -->
            <app-card class="hover:shadow-lg transition-all duration-300">
              <div class="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200 dark:border-gray-700 transition-colors">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white transition-colors">
                  Recent Time Logs
                </h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400 transition-colors">
                  Your latest check-in and check-out records
                </p>
              </div>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-700 transition-colors">
                    <tr>
                      <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors">
                        Date
                      </th>
                      <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors">
                        Check In
                      </th>
                      <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors">
                        Check Out
                      </th>
                      <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors">
                        Total Hours
                      </th>
                      <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
                    @if (recentTimeLogs().length > 0) {
                      @for (log of recentTimeLogs(); track log._id) {
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white transition-colors">
                            {{ formatTimeLogDate(log.date) }}
                          </td>
                          <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white transition-colors">
                            {{ formatTime(log.checkin) }}
                          </td>
                          <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white transition-colors">
                            {{ log.checkout ? formatTime(log.checkout) : 'In Progress' }}
                          </td>
                          <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white transition-colors">
                            {{ log.totalhours || 'Calculating...' }}
                          </td>
                          <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap transition-colors">
                            @if (log.autocheckout) {
                              <span class="inline-flex px-1.5 sm:px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 transition-colors">
                                Auto Checkout
                              </span>
                            } @else if (!log.checkout) {
                              <span class="inline-flex px-1.5 sm:px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 transition-colors">
                                Active
                              </span>
                            } @else {
                              <span class="inline-flex px-1.5 sm:px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 transition-colors">
                                Completed
                              </span>
                            }
                          </td>
                        </tr>
                      }
                    } @else {
                      <tr>
                        <td colspan="5" class="px-3 sm:px-6 py-8 sm:py-12 text-center text-gray-500 dark:text-gray-400 transition-colors">
                          No time logs found
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </app-card>

            <!-- Quick Actions -->
            <div class="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
              <app-card class="hover:shadow-lg transition-all duration-300">
                <div class="p-4 sm:p-6 text-center">
                  <div class="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 transition-colors">
                    <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors">Reports</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors">View your timesheet reports</p>
                  <app-reusable-button
                    text="View Reports"
                    variant="secondary"
                    size="sm"
                    (click)="viewReports()" />
                </div>
              </app-card>

              <app-card class="hover:shadow-lg transition-all duration-300">
                <div class="p-4 sm:p-6 text-center">
                  <div class="mx-auto h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 transition-colors">
                    <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors">My Profile</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors">Manage your profile information</p>
                  <app-reusable-button
                    text="Edit Profile"
                    variant="secondary"
                    size="sm"
                    (click)="navigateToProfile()" />
                </div>
              </app-card>
            </div>
          }
        </div>
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly isLoading = signal(true);
  readonly currentEmployee = signal<Employee | null>(null);

  // Computed values based on real time logs
  readonly recentTimeLogs = computed(() => {
    const employee = this.currentEmployee();
    if (!employee?.timelog) return [];
    
    return employee.timelog
      .slice(-10) // Get last 10 entries
      .reverse(); // Show most recent first
  });

  ngOnInit(): void {
    this.loadEmployeeData();
  }

  private async loadEmployeeData(): Promise<void> {
    try {
      this.isLoading.set(true);
      
      // Get current user from auth service
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.router.navigate(['/login']);
        return;
      }

      // Load employees and find current user
      await this.employeeService.loadEmployees();
      const employees = this.employeeService.employees();
      const currentEmployee = employees.find((emp: Employee) => emp._id === currentUser.id);
      
      if (currentEmployee) {
        this.currentEmployee.set(currentEmployee);
      } else {
        this.toastService.error('Unable to load employee information');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
      this.toastService.error('Failed to load dashboard data');
    } finally {
      this.isLoading.set(false);
    }
  }

  formatTimeLogDate(dateString: string): string {
    try {
      let date: Date;
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = new Date(dateString);
      }
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    
    // Handle different time formats
    if (timeString.includes('T')) {
      // ISO format
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else if (timeString.includes(':')) {
      // HH:MM format
      return timeString;
    } else {
      return timeString;
    }
  }

  viewReports(): void {
    console.log('Navigating to reports...');
    // Navigate to the employee reports route
    this.router.navigate(['/employee/view-reports']).then(
      (success) => {
        console.log('Navigation result:', success);
        if (!success) {
          console.error('Navigation failed - component may not exist');
          this.toastService.error('Reports component not found.');
        }
      }
    ).catch((error) => {
      console.error('Navigation error:', error);
      this.toastService.error('Failed to navigate to reports.');
    });
  }

  navigateToProfile(): void {
    console.log('Navigating to profile...');
    console.log('Current user:', this.authService.getCurrentUser());
    
    // Try navigation with error handling
    this.router.navigate(['/employee/profile']).then(
      (success) => {
        if (success) {
          console.log('Navigation to profile successful');
        } else {
          console.error('Navigation to profile failed');
          // Try alternative approach
          console.log('Trying alternative navigation...');
          window.location.href = '/employee/profile';
        }
      }
    ).catch((error) => {
      console.error('Navigation error:', error);
      // Try direct navigation as fallback
      try {
        this.router.navigateByUrl('/employee/profile');
      } catch (fallbackError) {
        console.error('Fallback navigation also failed:', fallbackError);
        this.toastService.error('Unable to navigate to profile. Please try refreshing the page.');
      }
    });
  }
}
