import { Component, Input, Output, EventEmitter, signal, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../../core/services/employee.service';

export interface TimesheetRecord {
  _id: string;
  date: string;
  checkin: string;
  checkout: string;
  totalhours: string;
  autocheckout: boolean;
}

export interface TimesheetSummary {
  totalRecords: number;
  presentDays: number;
  totalHours: string;
  avgHoursPerDay: string;
}

export interface TimesheetData {
  data: TimesheetRecord[];
}

@Component({
  selector: 'app-timesheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors mt-6">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white transition-colors">{{ title || 'Employee Timesheet' }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 transition-colors">{{ subtitle || 'View monthly attendance records' }}</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Month:</label>
              <select 
                [(ngModel)]="selectedMonth" 
                (ngModelChange)="onMonthYearChange()"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Year:</label>
              <select 
                [(ngModel)]="selectedYear" 
                (ngModelChange)="onMonthYearChange()"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
            @if (!autoLoad) {
              <button
                (click)="loadTimesheetData()"
                [disabled]="isLoadingTimesheet()"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium text-sm transition-colors disabled:cursor-not-allowed">
                @if (isLoadingTimesheet()) {
                  <span class="flex items-center gap-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Loading...
                  </span>
                } @else {
                  Load Data
                }
              </button>
            }
          </div>
        </div>
      </div>

      <div class="p-6">
        @if (isLoadingTimesheet()) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span class="ml-2 text-gray-600 dark:text-gray-400 transition-colors">Loading timesheet data...</span>
          </div>
        } @else if (timesheetData()) {
          <div class="space-y-6">
            <!-- Summary Cards -->
            @if (timesheetSummary() && showSummary) {
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700/50">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-blue-700 dark:text-blue-300">Total Records</p>
                      <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ timesheetSummary()?.totalRecords || 0 }}</p>
                    </div>
                    <div class="h-12 w-12 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-700/50">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-green-700 dark:text-green-300">Present Days</p>
                      <p class="text-2xl font-bold text-green-900 dark:text-green-100">{{ timesheetSummary()?.presentDays || 0 }}</p>
                    </div>
                    <div class="h-12 w-12 bg-green-500/10 dark:bg-green-400/10 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700/50">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-purple-700 dark:text-purple-300">Total Hours</p>
                      <p class="text-2xl font-bold text-purple-900 dark:text-purple-100">{{ timesheetSummary()?.totalHours || '0:00' }}</p>
                    </div>
                    <div class="h-12 w-12 bg-purple-500/10 dark:bg-purple-400/10 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-xl border border-orange-200 dark:border-orange-700/50">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-orange-700 dark:text-orange-300">Avg Hours/Day</p>
                      <p class="text-2xl font-bold text-orange-900 dark:text-orange-100">{{ timesheetSummary()?.avgHoursPerDay || '0:00' }}</p>
                    </div>
                    <div class="h-12 w-12 bg-orange-500/10 dark:bg-orange-400/10 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Timesheet Table -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Attendance Records - {{ getMonthName(getMonthNumber(selectedMonth)) }} {{ selectedYear }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Detailed check-in and check-out records</p>
              </div>

              <!-- Desktop Table View -->
              <div class="hidden md:block overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check In</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check Out</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Hours</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    @for (record of getTimesheetRecords(); track record._id) {
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="h-10 w-10 flex-shrink-0">
                              <div class="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <span class="text-sm font-medium text-indigo-600 dark:text-indigo-400">{{ formatDayOfWeek(record.date) }}</span>
                              </div>
                            </div>
                            <div class="ml-4">
                              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ formatDisplayDate(record.date) }}</div>
                              <div class="text-sm text-gray-500 dark:text-gray-400">{{ formatFullDayName(record.date) }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <svg class="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                            </svg>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatTime(record.checkin) }}</span>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <svg class="h-4 w-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ formatTime(record.checkout) }}</span>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="h-8 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span class="text-xs font-semibold text-blue-800 dark:text-blue-300">{{ record.totalhours }}</span>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          @if (record.autocheckout) {
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                              Auto Checkout
                            </span>
                          } @else {
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Manual
                            </span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Mobile Card View -->
              <div class="md:hidden">
                @for (record of getTimesheetRecords(); track record._id) {
                  <div class="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex items-center">
                        <div class="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
                          <span class="text-sm font-bold text-indigo-600 dark:text-indigo-400">{{ formatDayOfWeek(record.date) }}</span>
                        </div>
                        <div>
                          <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatDisplayDate(record.date) }}</p>
                          <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatFullDayName(record.date) }}</p>
                        </div>
                      </div>
                      @if (record.autocheckout) {
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                          Auto
                        </span>
                      } @else {
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Manual
                        </span>
                      }
                    </div>
                    
                    <div class="grid grid-cols-3 gap-4">
                      <div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <svg class="h-5 w-5 text-green-500 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"/>
                        </svg>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Check In</p>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatTime(record.checkin) }}</p>
                      </div>
                      
                      <div class="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <svg class="h-5 w-5 text-red-500 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"/>
                        </svg>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Check Out</p>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatTime(record.checkout) }}</p>
                      </div>
                      
                      <div class="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <svg class="h-5 w-5 text-blue-500 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Total</p>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ record.totalhours }}</p>
                      </div>
                    </div>
                  </div>
                }
              </div>

              @if (getTimesheetRecords().length === 0) {
                <div class="text-center py-12">
                  <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <p class="text-gray-500 dark:text-gray-400 text-lg font-medium">No attendance records found</p>
                  <p class="text-gray-400 dark:text-gray-500 text-sm mt-1">Try selecting a different month or year</p>
                </div>
              }
            </div>
          </div>
        } @else if (timesheetError()) {
          <div class="text-center py-8">
            <div class="text-red-500 dark:text-red-400 text-lg mb-2">{{ timesheetError() }}</div>
            <button 
              (click)="loadTimesheetData()"
              class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
              Try Again
            </button>
          </div>
        } @else {
          <div class="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>{{ emptyMessage || 'Select month and year, then click "Load Data" to view timesheet records' }}</p>
          </div>
        }
      </div>
    </div>
  `
})
export class TimesheetComponent implements OnInit, OnChanges {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly employeeService = inject(EmployeeService);

  // Input properties
  @Input() employeeId?: string; // If not provided, uses current user
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() showSummary: boolean = true;
  @Input() autoLoad: boolean = false; // Auto-load when month/year changes
  @Input() emptyMessage?: string;

  // Output events
  @Output() dataLoaded = new EventEmitter<TimesheetData>();
  @Output() dataError = new EventEmitter<string>();
  @Output() monthYearChanged = new EventEmitter<{month: number, year: number}>();

  // Component state signals
  readonly timesheetData = signal<TimesheetData | null>(null);
  readonly isLoadingTimesheet = signal(false);
  readonly timesheetError = signal<string | null>(null);
  readonly timesheetSummary = signal<TimesheetSummary | null>(null);

  // Filter controls
  selectedMonth: number | string = new Date().getMonth() + 1; // Current month
  selectedYear: number | string = new Date().getFullYear(); // Current year

  ngOnInit(): void {
    // Auto-load current month's timesheet data if autoLoad is enabled
    if (this.autoLoad) {
      this.loadTimesheetData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reload data when employeeId changes
    if (changes['employeeId'] && !changes['employeeId'].firstChange) {
      if (this.autoLoad) {
        this.loadTimesheetData();
      }
    }
  }

  async onMonthYearChange(): Promise<void> {
    const monthNumber = typeof this.selectedMonth === 'string' ? parseInt(this.selectedMonth, 10) : this.selectedMonth;
    const yearNumber = typeof this.selectedYear === 'string' ? parseInt(this.selectedYear, 10) : this.selectedYear;
    
    this.monthYearChanged.emit({ month: monthNumber, year: yearNumber });
    
    if (this.autoLoad) {
      await this.loadTimesheetData();
    }
  }

  async loadTimesheetData(): Promise<void> {
    const targetEmployeeId = this.employeeId || this.getCurrentUserId();
    
    if (!targetEmployeeId) {
      this.timesheetError.set('Employee ID not available');
      this.dataError.emit('Employee ID not available');
      return;
    }

    this.isLoadingTimesheet.set(true);
    this.timesheetError.set(null);
    this.timesheetData.set(null);
    this.timesheetSummary.set(null);

    try {
      // Ensure month and year are numbers
      const monthNumber = typeof this.selectedMonth === 'string' ? parseInt(this.selectedMonth, 10) : this.selectedMonth;
      const yearNumber = typeof this.selectedYear === 'string' ? parseInt(this.selectedYear, 10) : this.selectedYear;
      
      console.log('Loading timesheet with payload:', { 
        id: targetEmployeeId, 
        month: monthNumber, 
        year: yearNumber 
      });
      
      const data = await this.employeeService.getEmployeeTimesheet(
        targetEmployeeId, 
        monthNumber, 
        yearNumber
      );
      
      if (data) {
        this.timesheetData.set(data);
        this.generateTimesheetSummary(data);
        this.dataLoaded.emit(data);
      } else {
        const errorMessage = 'No timesheet data found for the selected period';
        this.timesheetError.set(errorMessage);
        this.dataError.emit(errorMessage);
      }
    } catch (error) {
      console.error('Error loading timesheet data:', error);
      const errorMessage = 'Failed to load timesheet data';
      this.timesheetError.set(errorMessage);
      this.dataError.emit(errorMessage);
    } finally {
      this.isLoadingTimesheet.set(false);
    }
  }

  private getCurrentUserId(): string | null {
    const currentUser = this.authService.user();
    return currentUser?.id || null;
  }

  private generateTimesheetSummary(data: TimesheetData): void {
    if (!data || !data.data || !Array.isArray(data.data)) return;
    
    const records = data.data;
    const totalRecords = records.length;
    const presentDays = records.length; // All records represent present days
    
    // Calculate total hours
    let totalMinutes = 0;
    records.forEach((record: TimesheetRecord) => {
      if (record.totalhours) {
        const [hours, minutes] = record.totalhours.split(':').map(Number);
        totalMinutes += (hours * 60) + (minutes || 0);
      }
    });
    
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const totalHoursFormatted = `${totalHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
    
    // Calculate average hours per day
    const avgMinutesPerDay = totalRecords > 0 ? totalMinutes / totalRecords : 0;
    const avgHours = Math.floor(avgMinutesPerDay / 60);
    const avgMinutes = Math.floor(avgMinutesPerDay % 60);
    const avgHoursFormatted = `${avgHours.toString().padStart(2, '0')}:${avgMinutes.toString().padStart(2, '0')}`;

    const summary: TimesheetSummary = {
      totalRecords,
      presentDays,
      totalHours: totalHoursFormatted,
      avgHoursPerDay: avgHoursFormatted
    };

    this.timesheetSummary.set(summary);
  }

  getTimesheetRecords(): TimesheetRecord[] {
    const data = this.timesheetData();
    return data?.data || [];
  }

  formatDisplayDate(dateStr: string): string {
    // Input format: "07/08/2025" (DD/MM/YYYY)
    const [day, month, year] = dateStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  formatDayOfWeek(dateStr: string): string {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  }

  formatFullDayName(dateStr: string): string {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  formatTime(isoString: string): string {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
  }

  getMonthNumber(month: number | string): number {
    return typeof month === 'string' ? parseInt(month, 10) : month;
  }
}