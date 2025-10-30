import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePickerComponent, ReusableButtonComponent } from '../../../../shared/components';
import { Router } from '@angular/router';


@Component({
  selector: 'app-apply',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ReusableButtonComponent],
  styles: [`
    /* Custom date input styling for weekend highlighting */
    input[type="date"] {
      position: relative;
    }
    
    /* Mobile-optimized date input styling */
    .date-input-container {
      position: relative;
    }
    
    .date-input-container input[type="date"] {
      font-size: 16px; /* Prevents zoom on iOS */
      min-height: 48px; /* Touch-friendly minimum height */
      padding: 12px 16px;
      border-radius: 8px;
      transition: all 0.3s ease;
      -webkit-tap-highlight-color: transparent;
    }
    
    .weekend-notice {
      font-size: 0.875rem; /* Larger for mobile readability */
      color: #6b7280;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background: rgba(59, 130, 246, 0.05);
      border-radius: 6px;
      border: 1px solid rgba(59, 130, 246, 0.1);
    }
    
    .weekend-notice svg {
      width: 1rem;
      height: 1rem;
      margin-right: 0.5rem;
      color: #f59e0b;
      flex-shrink: 0;
    }
    
    /* Mobile-specific enhancements */
    @media (max-width: 768px) {
      .date-input-container input[type="date"] {
        font-size: 16px;
        min-height: 52px;
        padding: 14px 18px;
        border-radius: 10px;
      }
      
      .weekend-notice {
        font-size: 0.875rem;
        padding: 12px 16px;
        margin-top: 0.75rem;
      }
      
      .weekend-notice svg {
        width: 1.125rem;
        height: 1.125rem;
      }
    }
    
    /* Enhanced focus states for better UX */
    input[type="date"]:focus {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      border-color: #3b82f6;
      outline: none;
    }
    
    /* Dark mode date input improvements */
    .dark input[type="date"] {
      color-scheme: dark;
    }
    
    .dark .weekend-notice {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.2);
      color: #9ca3af;
    }
    
    /* Working days highlight */
    .working-days-highlight {
      background: linear-gradient(90deg, #dbeafe 0%, #bfdbfe 100%);
      border: 1px solid #93c5fd;
    }
    
    .dark .working-days-highlight {
      background: linear-gradient(90deg, #1e3a8a 0%, #1e40af 100%);
      border: 1px solid #3b82f6;
    }
    
    /* Mobile-specific improvements */
    @media (max-width: 768px) {
      /* Better touch targets for radio buttons */
      input[type="radio"] + label {
        min-height: 56px;
        padding: 12px 16px;
      }
      
      /* Larger text areas on mobile */
      textarea {
        min-height: 120px;
        font-size: 16px;
        padding: 14px 16px;
      }
      
      /* Better button sizing */
      button {
        min-height: 48px;
        font-size: 16px;
        padding: 12px 20px;
      }
      
      /* Prevent horizontal scroll */
      .overflow-x-auto {
        -webkit-overflow-scrolling: touch;
      }
      
      /* Better select dropdowns */
      select {
        min-height: 48px;
        font-size: 16px;
        padding: 12px 16px;
      }
      
      /* Form spacing on mobile */
      .form-section {
        margin-bottom: 24px;
      }
      
      /* Card padding adjustments */
      .mobile-card {
        padding: 16px;
        margin: 12px;
        border-radius: 12px;
      }
    }
    
    /* iOS specific fixes */
    @supports (-webkit-touch-callout: none) {
      input[type="date"]::-webkit-datetime-edit {
        padding: 0;
        margin: 0;
      }
      
      input[type="date"]::-webkit-calendar-picker-indicator {
        margin-left: auto;
      }
    }
  `],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <!-- Header - Mobile Optimized -->
      <header class="bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div class="text-center sm:text-left">
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white transition-colors">Apply Request</h1>
              <p class="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base transition-colors">Submit your leave or work from home request</p>
            </div>
            <div class="flex justify-center sm:justify-end">
              <app-reusable-button
                text="Back to Dashboard"
                variant="secondary" 
                (click)="goToDashboard()" />
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content - Mobile Optimized -->
      <main class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <!-- Quick Stats Banner - Mobile Responsive -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 transition-colors">
            <div class="flex items-center">
              <div class="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg class="w-6 h-6 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="ml-3 sm:ml-4">
                <p class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Available Leave Days</p>
                <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ availableLeaveDays() }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">WFH Days Used</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ wfhDaysUsed() }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Requests</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ pendingRequests() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Request Type Selection -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 transition-colors">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white transition-colors">Select Request Type</h2>
            @if (selectedRequestType()) {
              <button 
                (click)="clearSelection()"
                class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Change Selection
              </button>
            }
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Leave Request Card -->
            <div class="relative cursor-pointer group" (click)="setRequestType('leave')">
              <div class="border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                   [class]="selectedRequestType() === 'leave' 
                   ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                   : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800'">
                
                @if (selectedRequestType() === 'leave') {
                  <div class="absolute top-4 right-4">
                    <div class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                }

                <div class="flex items-start space-x-4">
                  <div class="w-14 h-14 rounded-xl flex items-center justify-center transition-colors"
                       [class]="selectedRequestType() === 'leave' 
                       ? 'bg-blue-500 dark:bg-blue-600' 
                       : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40'">
                    <svg class="w-7 h-7 transition-colors"
                         [class]="selectedRequestType() === 'leave' 
                         ? 'text-white' 
                         : 'text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors">Leave Request</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed transition-colors">
                      Apply for vacation, sick leave, personal time off, or other types of leave with proper documentation
                    </p>
                    <div class="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Requires manager approval
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Work From Home Card -->
            <div class="relative cursor-pointer group" (click)="setRequestType('wfh')">
              <div class="border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                   [class]="selectedRequestType() === 'wfh' 
                   ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 shadow-lg' 
                   : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 bg-white dark:bg-gray-800'">
                
                @if (selectedRequestType() === 'wfh') {
                  <div class="absolute top-4 right-4">
                    <div class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                }

                <div class="flex items-start space-x-4">
                  <div class="w-14 h-14 rounded-xl flex items-center justify-center transition-colors"
                       [class]="selectedRequestType() === 'wfh' 
                       ? 'bg-green-500 dark:bg-green-600' 
                       : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-green-100 dark:group-hover:bg-green-900/40'">
                    <svg class="w-7 h-7 transition-colors"
                         [class]="selectedRequestType() === 'wfh' 
                         ? 'text-white' 
                         : 'text-gray-600 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400'"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M8 21l4-4 4 4M3 7l9-4 9 4"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors">Work From Home</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed transition-colors">
                      Request to work remotely from home with flexible scheduling and productivity tracking
                    </p>
                    <div class="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Auto-approved for eligible employees
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Application Form -->
        @if (selectedRequestType()) {
          <div class="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm transition-colors">
            <!-- Form Header - Mobile Optimized -->
            <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2 sm:space-x-3">
                  <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center"
                       [class]="selectedRequestType() === 'leave' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5"
                         [class]="selectedRequestType() === 'leave' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      @if (selectedRequestType() === 'leave') {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      } @else {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 21l4-4 4 4M3 7l9-4 9 4"></path>
                      }
                    </svg>
                  </div>
                  <h2 class="text-xl font-semibold text-gray-900 dark:text-white transition-colors">
                    {{ selectedRequestType() === 'leave' ? 'Leave' : 'Work From Home' }} Application
                  </h2>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Step {{ getFormStep() }} of 3
                </div>
              </div>
            </div>

            <form [formGroup]="applicationForm" (ngSubmit)="onSubmit()" class="p-6">
              <div class="space-y-8">
                <!-- Step 1: Request Details -->
                <div class="space-y-6">
                  @if (selectedRequestType() === 'leave') {
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Leave Type *</label>
                        <select formControlName="leaveType" 
                                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                          <option value="">Select leave type</option>
                          <option value="sick">🤒 Sick Leave</option>
                          <option value="vacation">🏖️ Vacation Leave</option>
                          <option value="personal">👤 Personal Leave</option>
                          <option value="emergency">🚨 Emergency Leave</option>
                          <option value="maternity">👶 Maternity Leave</option>
                          <option value="paternity">👨‍👶 Paternity Leave</option>
                        </select>
                        @if (applicationForm.get('leaveType')?.invalid && applicationForm.get('leaveType')?.touched) {
                          <p class="text-red-500 dark:text-red-400 text-sm mt-1">Please select a leave type</p>
                        }
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration *</label>
                        <select formControlName="duration" 
                                (change)="onDurationChange($event)"
                                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                          <option value="">Select duration</option>
                          <option value="half-day">Half Day</option>
                          <option value="full-day">Full Day</option>
                          <option value="multiple-days">Multiple Days</option>
                        </select>
                        @if (applicationForm.get('duration')?.invalid && applicationForm.get('duration')?.touched) {
                          <p class="text-red-500 dark:text-red-400 text-sm mt-1">Please select duration</p>
                        }
                      </div>
                    </div>
                  }

                  @if (selectedRequestType() === 'wfh') {
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">WFH Duration *</label>
                      <select formControlName="duration" 
                              (change)="onDurationChange($event)"
                              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors">
                        <option value="">Select duration</option>
                        <option value="full-day">Full Day</option>
                        <option value="multiple-days">Multiple Days</option>
                      </select>
                      @if (applicationForm.get('duration')?.invalid && applicationForm.get('duration')?.touched) {
                        <p class="text-red-500 dark:text-red-400 text-sm mt-1">Please select duration</p>
                      }
                    </div>
                  }
                </div>

                <!-- Step 2: Date Selection -->
                <div class="space-y-6">
                  <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Date Selection</h3>
                    
                    <!-- Mobile-optimized date inputs -->
                    <div class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div class="date-input-container">
                        <label class="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {{ isMultipleDays() ? 'From Date *' : 'Date *' }}
                        </label>
                        <input type="date" 
                               formControlName="fromDate"
                               [min]="getTodayDate()"
                               (change)="onDateChange()"
                               class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                        @if (applicationForm.get('fromDate')?.invalid && applicationForm.get('fromDate')?.touched) {
                          <p class="text-red-500 dark:text-red-400 text-sm mt-1">Please select a date</p>
                        } @else if (applicationForm.get('fromDate')?.value) {
                          @if (isSelectedDateWeekend(applicationForm.get('fromDate')?.value)) {
                            <div class="weekend-notice text-amber-600 dark:text-amber-400">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                              </svg>
                              Selected date is a weekend - no working day will be deducted
                            </div>
                          }
                        }
                        <div class="weekend-notice">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Weekends (Sat-Sun) are excluded from working day calculations
                        </div>
                      </div>

                      @if (isMultipleDays()) {
                        <div class="date-input-container">
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Date *</label>
                          <input type="date" 
                                 formControlName="toDate"
                                 [min]="applicationForm.get('fromDate')?.value"
                                 (change)="onDateChange()"
                                 class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                          @if (applicationForm.get('toDate')?.invalid && applicationForm.get('toDate')?.touched) {
                            <p class="text-red-500 dark:text-red-400 text-sm mt-1">Please select end date</p>
                          } @else if (applicationForm.get('toDate')?.value) {
                            <div class="weekend-notice text-blue-600 dark:text-blue-400">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              Only working days (Mon-Fri) will be counted
                            </div>
                          }
                        </div>
                      }
                    </div>

                    @if (applicationForm.get('duration')?.value === 'half-day') {
                      <div class="mt-6">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Half Day Period *</label>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <label class="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <input type="radio" 
                                   formControlName="halfDayPeriod" 
                                   value="morning"
                                   class="sr-only">
                            <div class="flex items-center space-x-3">
                              <div class="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center"
                                   [class]="applicationForm.get('halfDayPeriod')?.value === 'morning' ? 'border-blue-500 bg-blue-500' : ''">
                                @if (applicationForm.get('halfDayPeriod')?.value === 'morning') {
                                  <div class="w-2 h-2 rounded-full bg-white"></div>
                                }
                              </div>
                              <div>
                                <p class="font-medium text-gray-900 dark:text-white">Morning</p>
                                <p class="text-sm text-gray-500 dark:text-gray-400">First half of the day</p>
                              </div>
                            </div>
                          </label>
                          
                          <label class="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <input type="radio" 
                                   formControlName="halfDayPeriod" 
                                   value="afternoon"
                                   class="sr-only">
                            <div class="flex items-center space-x-3">
                              <div class="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center"
                                   [class]="applicationForm.get('halfDayPeriod')?.value === 'afternoon' ? 'border-blue-500 bg-blue-500' : ''">
                                @if (applicationForm.get('halfDayPeriod')?.value === 'afternoon') {
                                  <div class="w-2 h-2 rounded-full bg-white"></div>
                                }
                              </div>
                              <div>
                                <p class="font-medium text-gray-900 dark:text-white">Afternoon</p>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Second half of the day</p>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Step 3: Additional Information -->
                <div class="space-y-6">
                  <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Additional Information</h3>
                    
                    <div class="space-y-6">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Reason for {{ selectedRequestType() === 'leave' ? 'Leave' : 'Work From Home' }} *
                        </label>
                        <textarea formControlName="reason" 
                                  rows="4"
                                  placeholder="Please provide a detailed reason for your request. Include any relevant information that will help in the approval process..."
                                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"></textarea>
                        <div class="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            @if (applicationForm.get('reason')?.invalid && applicationForm.get('reason')?.touched) {
                              <span class="text-red-500 dark:text-red-400">Please provide a detailed reason (minimum 10 characters)</span>
                            }
                          </span>
                          <span>{{ applicationForm.get('reason')?.value?.length || 0 }}/500</span>
                        </div>
                      </div>

                      @if (isMultipleDays()) {
                        <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Emergency Contact *</label>
                          <input type="tel" 
                                 formControlName="emergencyContact"
                                 placeholder="Enter emergency contact number"
                                 class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                          @if (applicationForm.get('emergencyContact')?.invalid && applicationForm.get('emergencyContact')?.touched) {
                            <p class="text-red-500 dark:text-red-400 text-sm mt-1">Please provide emergency contact</p>
                          }
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <!-- Request Summary -->
                @if (showSummary()) {
                  <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div class="rounded-xl p-6 transition-colors"
                         [class]="selectedRequestType() === 'leave' 
                         ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                         : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'">
                      <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                             [class]="selectedRequestType() === 'leave' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-green-100 dark:bg-green-900/40'">
                          <svg class="w-5 h-5"
                               [class]="selectedRequestType() === 'leave' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'"
                               fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Request Summary</h3>
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p class="text-gray-500 dark:text-gray-400">Request Type</p>
                              <p class="font-medium text-gray-900 dark:text-white">{{ getRequestTypeLabel() }}</p>
                            </div>
                            @if (selectedRequestType() === 'leave' && applicationForm.get('leaveType')?.value) {
                              <div>
                                <p class="text-gray-500 dark:text-gray-400">Leave Type</p>
                                <p class="font-medium text-gray-900 dark:text-white">{{ getLeaveTypeLabel() }}</p>
                              </div>
                            }
                            <div>
                              <p class="text-gray-500 dark:text-gray-400">Duration</p>
                              <p class="font-medium text-gray-900 dark:text-white">{{ getDurationLabel() }}</p>
                            </div>
                            @if (applicationForm.get('fromDate')?.value) {
                              <div>
                                <p class="text-gray-500 dark:text-gray-400">Date(s)</p>
                                <p class="font-medium text-gray-900 dark:text-white">{{ formatDateRange() }}</p>
                              </div>
                            }
                            @if (calculateWorkingDays() > 0) {
                              <div>
                                <p class="text-gray-500 dark:text-gray-400">Working Days</p>
                                <p class="font-medium text-gray-900 dark:text-white">
                                  {{ calculateWorkingDays() }} {{ calculateWorkingDays() === 1 ? 'day' : 'days' }}
                                  @if (isHalfDay()) {
                                    <span class="text-xs text-gray-500 dark:text-gray-400">(half day)</span>
                                  } @else {
                                    <span class="text-xs text-gray-500 dark:text-gray-400">(excluding weekends)</span>
                                  }
                                </p>
                              </div>
                            }
                            @if (applicationForm.get('duration')?.value === 'half-day' && applicationForm.get('halfDayPeriod')?.value) {
                              <div>
                                <p class="text-gray-500 dark:text-gray-400">Half Day Period</p>
                                <p class="font-medium text-gray-900 dark:text-white">
                                  {{ applicationForm.get('halfDayPeriod')?.value === 'morning' ? 'Morning (First Half)' : 'Afternoon (Second Half)' }}
                                </p>
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0 sm:space-x-4">
                  <app-reusable-button
                    text="Reset Form"
                    variant="secondary"
                    (click)="resetForm()" />

                  <app-reusable-button
                    [text]="'Submit ' + (selectedRequestType() === 'leave' ? 'Leave' : 'WFH') + ' Request'"
                    [variant]="selectedRequestType() === 'leave' ? 'primary' : 'success'"
                    [disabled]="applicationForm.invalid"
                    [loading]="isSubmitting()"
                    loadingText="Submitting..."
                    type="submit" />
                </div>
              </div>
            </form>
          </div>
        }
      </main>
    </div>
  `
})
export class ApplyComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Signals for reactive state management
  selectedRequestType = signal<'leave' | 'wfh' | null>(null);
  isSubmitting = signal<boolean>(false);
  
  // Mock data signals (replace with actual service calls)
  availableLeaveDays = signal<number>(15);
  wfhDaysUsed = signal<number>(8);
  pendingRequests = signal<number>(2);

  // Form group for the application
  applicationForm: FormGroup;

  constructor() {
    this.applicationForm = this.fb.group({
      leaveType: [''],
      duration: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: [''],
      halfDayPeriod: [''],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      emergencyContact: ['']
    });
  }

  // Set the request type (leave or WFH)
  setRequestType(type: 'leave' | 'wfh'): void {
    this.selectedRequestType.set(type);
    this.resetForm();
    
    // Update form validators based on request type
    if (type === 'leave') {
      this.applicationForm.get('leaveType')?.setValidators([Validators.required]);
    } else {
      this.applicationForm.get('leaveType')?.clearValidators();
    }
    this.applicationForm.get('leaveType')?.updateValueAndValidity();
  }

  // Handle duration change
  onDurationChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const duration = target.value;
    
    // Update validators based on duration
    if (duration === 'multiple-days') {
      this.applicationForm.get('toDate')?.setValidators([Validators.required]);
      this.applicationForm.get('emergencyContact')?.setValidators([Validators.required]);
    } else {
      this.applicationForm.get('toDate')?.clearValidators();
      this.applicationForm.get('emergencyContact')?.clearValidators();
    }
    
    if (duration === 'half-day') {
      this.applicationForm.get('halfDayPeriod')?.setValidators([Validators.required]);
    } else {
      this.applicationForm.get('halfDayPeriod')?.clearValidators();
    }
    
    this.applicationForm.get('toDate')?.updateValueAndValidity();
    this.applicationForm.get('emergencyContact')?.updateValueAndValidity();
    this.applicationForm.get('halfDayPeriod')?.updateValueAndValidity();
  }

  // Check if multiple days is selected
  isMultipleDays(): boolean {
    return this.applicationForm.get('duration')?.value === 'multiple-days';
  }

  // Get today's date in YYYY-MM-DD format
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Show summary if form has enough data
  showSummary(): boolean {
    const form = this.applicationForm;
    return !!(form.get('duration')?.value && form.get('fromDate')?.value);
  }

  // Get request type label
  getRequestTypeLabel(): string {
    return this.selectedRequestType() === 'leave' ? 'Leave Request' : 'Work From Home Request';
  }

  // Get leave type label
  getLeaveTypeLabel(): string {
    const leaveType = this.applicationForm.get('leaveType')?.value;
    const labels: { [key: string]: string } = {
      'sick': 'Sick Leave',
      'vacation': 'Vacation Leave',
      'personal': 'Personal Leave',
      'emergency': 'Emergency Leave',
      'maternity': 'Maternity Leave',
      'paternity': 'Paternity Leave'
    };
    return labels[leaveType] || leaveType;
  }

  // Get duration label
  getDurationLabel(): string {
    const duration = this.applicationForm.get('duration')?.value;
    const labels: { [key: string]: string } = {
      'half-day': 'Half Day',
      'full-day': 'Full Day',
      'multiple-days': 'Multiple Days'
    };
    return labels[duration] || duration;
  }

  // Format date range for display
  formatDateRange(): string {
    const fromDate = this.applicationForm.get('fromDate')?.value;
    const toDate = this.applicationForm.get('toDate')?.value;
    
    if (!fromDate) return '';
    
    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    
    if (this.isMultipleDays() && toDate) {
      return `${formatDate(fromDate)} to ${formatDate(toDate)}`;
    }
    
    return formatDate(fromDate);
  }

  // Submit the form
  onSubmit(): void {
    if (this.applicationForm.valid) {
      this.isSubmitting.set(true);
      
      const formData = {
        requestType: this.selectedRequestType(),
        ...this.applicationForm.value,
        submittedAt: new Date().toISOString()
      };
      
      console.log('Form submitted:', formData);
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting.set(false);
        alert(`${this.getRequestTypeLabel()} submitted successfully!`);
        this.resetForm();
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.applicationForm.controls).forEach(key => {
        this.applicationForm.get(key)?.markAsTouched();
      });
    }
  }

  // Reset the form
  resetForm(): void {
    this.applicationForm.reset();
    Object.keys(this.applicationForm.controls).forEach(key => {
      this.applicationForm.get(key)?.setErrors(null);
    });
  }

  // Clear the current selection
  clearSelection(): void {
    this.selectedRequestType.set(null);
    this.resetForm();
  }

  // Get current form step for progress indicator
  getFormStep(): number {
    if (!this.applicationForm.get('duration')?.value) return 1;
    if (!this.applicationForm.get('fromDate')?.value) return 2;
    return 3;
  }

  // Check if current selection is half day
  isHalfDay(): boolean {
    return this.applicationForm.get('duration')?.value === 'half-day';
  }

  // Calculate working days (excluding weekends)
  calculateWorkingDays(): number {
    const fromDate = this.applicationForm.get('fromDate')?.value;
    const toDate = this.applicationForm.get('toDate')?.value;
    const duration = this.applicationForm.get('duration')?.value;

    if (!fromDate) return 0;

    if (duration === 'half-day') return 0.5;
    if (duration === 'full-day') return 1;

    if (duration === 'multiple-days' && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      let workingDays = 0;

      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay();
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDays++;
        }
      }
      return workingDays;
    }

    return 0;
  }

  // Get weekend dates for calendar highlighting
  getWeekendDates(): string[] {
    const weekends: string[] = [];
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(today.getMonth() + 6); // Next 6 months

    for (let date = new Date(today); date <= futureDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        weekends.push(date.toISOString().split('T')[0]);
      }
    }
    return weekends;
  }

  // Check if selected date is a weekend
  isSelectedDateWeekend(dateString: string): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  }

  // Handle date changes
  onDateChange(): void {
    // Trigger form validation and UI updates
    this.applicationForm.updateValueAndValidity();
  }

  // Navigate back to dashboard
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}