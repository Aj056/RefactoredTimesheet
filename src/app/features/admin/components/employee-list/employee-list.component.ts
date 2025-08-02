import { Component, inject, computed, signal, OnInit, OnDestroy, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { EmployeeService, Employee } from '../../../../core/services/employee.service';
import { EmployeeFilterService } from '../../services/employee-filter.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { WFHRequestsComponent } from '../wfh-requests/wfh-requests.component';
import { LeaveRequestsComponent } from '../leave-requests/leave-requests.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, WFHRequestsComponent, LeaveRequestsComponent],
  styles: [`
    /* Custom scrollbar styles */
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }
    
    .dark .custom-scrollbar::-webkit-scrollbar-track {
      background: #374151;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
      transition: all 0.2s;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #6b7280;
    }
    
    .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
    
    /* For Firefox */
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 #f1f5f9;
    }
    
    .dark .custom-scrollbar {
      scrollbar-color: #6b7280 #374151;
    }
    
    /* Smooth scroll loading animation */
    .loading-more {
      animation: fadeInUp 0.5s ease-out;
    }
    
    /* New row highlight animation */
    .new-row {
      animation: highlightNew 2s ease-out;
      background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
    }
    
    @keyframes highlightNew {
      0% {
        background-color: rgba(59, 130, 246, 0.2);
        transform: translateX(-10px);
      }
      50% {
        background-color: rgba(59, 130, 246, 0.1);
      }
      100% {
        background-color: transparent;
        transform: translateX(0);
      }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Progress bar animation for loading */
    @keyframes progressBar {
      0% {
        transform: translateX(-100%);
        opacity: 0.6;
      }
      50% {
        opacity: 1;
      }
      100% {
        transform: translateX(100%);
        opacity: 0.6;
      }
    }
    
    /* Enhanced loading state */
    .loading-state {
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
    
    /* Enhanced action buttons */
    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease-in-out;
      border: 1px solid transparent;
      cursor: pointer;
      text-decoration: none;
    }
    
    .action-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .action-btn:active {
      transform: translateY(0);
    }
    
    .btn-view {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border-color: #3b82f6;
    }
    
    .btn-view:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    
    .btn-edit {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
      border-color: #8b5cf6;
    }
    
    .btn-edit:hover {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
    }
    
    .btn-delete {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      border-color: #ef4444;
    }
    
    .btn-delete:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    }
    
    /* Dark mode button styles */
    .dark .btn-view {
      background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    }
    
    .dark .btn-edit {
      background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
    }
    
    .dark .btn-delete {
      background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
    }
    
    /* Mobile action buttons */
    .mobile-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      transition: all 0.2s ease-in-out;
      border: 1px solid transparent;
      cursor: pointer;
    }
    
    .mobile-action-btn:hover {
      transform: translateY(-1px);
    }
    
    /* Action button icons */
    .action-btn svg, .mobile-action-btn svg {
      flex-shrink: 0;
    }
    
    /* Responsive action layout */
    @media (max-width: 640px) {
      .action-btn {
        padding: 0.375rem 0.5rem;
        font-size: 0.75rem;
      }
      
      .action-btn svg {
        width: 0.875rem;
        height: 0.875rem;
      }
    }
    
    /* Focus states for accessibility */
    .action-btn:focus, .mobile-action-btn:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
      ring: 2px;
      ring-offset: 2px;
    }
    
    .btn-view:focus {
      ring-color: #3b82f6;
    }
    
    .btn-edit:focus {
      ring-color: #8b5cf6;
    }
    
    .btn-delete:focus {
      ring-color: #ef4444;
    }
  `],
  template: `
    <div class="relative">
      <!-- Desktop Table View (hidden on mobile) -->
      <div class="hidden lg:block bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors">
        <div class="overflow-x-auto max-h-[70vh] overflow-y-auto custom-scrollbar" #scrollContainer>
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700 transition-colors sticky top-0 z-10">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors">
                  Employee
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors">
                  Department
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors">
                  Status
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors">
                  <span class="flex items-center justify-end gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
              @if (employeeService.isLoading() && displayedEmployees().length === 0) {
                <tr>
                  <td colspan="4" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400 transition-colors">
                    <div class="flex justify-center items-center space-x-2">
                      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
                      <span>Loading employees...</span>
                    </div>
                  </td>
                </tr>
              } @else if (employeeService.error()) {
                <tr>
                  <td colspan="4" class="px-6 py-12 text-center text-red-500 dark:text-red-400 transition-colors">
                    {{ employeeService.error() }}
                  </td>
                </tr>
              } @else if (filteredEmployees().length === 0) {
                <tr>
                  <td colspan="4" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400 transition-colors">
                    @if (filterService.hasActiveFilters()) {
                      No employees match your search criteria
                    } @else {
                      No employees found
                    }
                  </td>
                </tr>
              } @else {
                @for (employee of displayedEmployees(); track employee._id; let i = $index) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                      [style.animation-delay]="(i % pageSize < 5) ? (i % pageSize * 50) + 'ms' : '0ms'"
                      [class.loading-more]="i >= (currentPage() - 1) * pageSize"
                      [class.new-row]="i >= (currentPage() - 1) * pageSize && isLoadingMore()">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                            <span class="text-sm font-medium text-white">
                              {{ getInitials(employee.employeeName) }}
                            </span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900 dark:text-white transition-colors">
                            {{ employee.employeeName }}
                          </div>
                          <div class="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                            {{ employee.employeeEmail }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white transition-colors">
                        {{ employee.department }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                        {{ employee.designation }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors"
                            [ngClass]="{
                              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': employee.status,
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': !employee.status
                            }">
                        {{ employee.status ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      @defer (on viewport) {
                        <div class="flex justify-end space-x-3">
                          <button
                            (click)="viewEmployee(employee._id)"
                            class="action-btn btn-view"
                            title="View employee details">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button
                            (click)="editEmployee(employee._id)"
                            class="action-btn btn-edit"
                            title="Edit employee">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            (click)="confirmDeleteEmployee(employee)"
                            class="action-btn btn-delete"
                            title="Delete employee">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      } @placeholder {
                        <div class="flex justify-end space-x-3">
                          <div class="h-8 w-16 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                          <div class="h-8 w-16 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                          <div class="h-8 w-20 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                        </div>
                      }
                    </td>
                  </tr>
                }
                
                <!-- Load More Trigger -->
                @if (hasMoreToLoad()) {
                  <tr #loadMoreTrigger class="h-1">
                    <td colspan="4" class="p-0">
                      @defer (on viewport(loadMoreTrigger)) {
                        <div class="flex flex-col items-center py-8 loading-more">
                          <div class="flex items-center space-x-3 mb-3">
                            <div class="animate-spin rounded-full h-6 w-6 border-3 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Loading more employees...</span>
                          </div>
                          <!-- Progress bar animation -->
                          <div class="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" 
                                 style="animation: progressBar 1.2s ease-in-out infinite;"></div>
                          </div>
                        </div>
                        {{ loadMoreData() }}
                      }
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Card View (visible on mobile only) -->
      <div class="lg:hidden max-h-[70vh] overflow-y-auto space-y-4 custom-scrollbar" #mobileScrollContainer>
        @if (employeeService.isLoading() && displayedEmployees().length === 0) {
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 text-center transition-colors">
            <div class="flex justify-center items-center space-x-2 text-gray-500 dark:text-gray-400">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span>Loading employees...</span>
            </div>
          </div>
        } @else if (employeeService.error()) {
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 text-center text-red-500 dark:text-red-400 transition-colors">
            {{ employeeService.error() }}
          </div>
        } @else if (filteredEmployees().length === 0) {
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 text-center text-gray-500 dark:text-gray-400 transition-colors">
            @if (filterService.hasActiveFilters()) {
              No employees match your search criteria
            } @else {
              No employees found
            }
          </div>
        } @else {
          @for (employee of displayedEmployees(); track employee._id; let i = $index) {
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md duration-300"
                 [style.animation-delay]="(i % pageSize < 5) ? (i % pageSize * 50) + 'ms' : '0ms'"
                 [class.loading-more]="i >= (currentPage() - 1) * pageSize"
                 [class.new-row]="i >= (currentPage() - 1) * pageSize && isLoadingMore()">
              <!-- Employee Header -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="h-12 w-12 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                    <span class="text-white font-medium">
                      {{ getInitials(employee.employeeName) }}
                    </span>
                  </div>
                  <div>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white transition-colors">
                      {{ employee.employeeName }}
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                      {{ employee.employeeEmail }}
                    </p>
                  </div>
                </div>
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors"
                      [ngClass]="{
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': employee.status,
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': !employee.status
                      }">
                  {{ employee.status ? 'Active' : 'Inactive' }}
                </span>
              </div>

              <!-- Employee Details -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-white transition-colors">{{ employee.department }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Designation</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-white transition-colors">{{ employee.designation }}</p>
                </div>
              </div>

              <!-- Actions with @defer -->
              @defer (on viewport) {
                <div class="flex justify-end space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    (click)="viewEmployee(employee._id)"
                    class="mobile-action-btn btn-view"
                    title="View employee details">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>
                  <button
                    (click)="editEmployee(employee._id)"
                    class="mobile-action-btn btn-edit"
                    title="Edit employee">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    (click)="confirmDeleteEmployee(employee)"
                    class="mobile-action-btn btn-delete"
                    title="Delete employee">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              } @placeholder {
                <div class="flex justify-end space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div class="h-7 w-14 bg-gray-200 dark:bg-gray-600 rounded-md animate-pulse"></div>
                  <div class="h-7 w-14 bg-gray-200 dark:bg-gray-600 rounded-md animate-pulse"></div>
                  <div class="h-7 w-18 bg-gray-200 dark:bg-gray-600 rounded-md animate-pulse"></div>
                </div>
              }
            </div>
          }
          
          <!-- Mobile Load More Trigger -->
          @if (hasMoreToLoad()) {
            <div #mobileLoadMoreTrigger class="h-1">
              @defer (on viewport(mobileLoadMoreTrigger)) {
                <div class="flex flex-col items-center py-8 loading-more">
                  <div class="flex items-center space-x-3 mb-3">
                    <div class="animate-spin rounded-full h-6 w-6 border-3 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Loading more employees...</span>
                  </div>
                  <!-- Progress bar animation -->
                  <div class="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" 
                         style="animation: progressBar 1.2s ease-in-out infinite;"></div>
                  </div>
                </div>
                {{ loadMoreData() }}
              }
            </div>
          }
        }
      </div>

      <!-- Scroll to Top Button -->
      @if (showScrollToTop()) {
        <button
          (click)="scrollToTop()"
          class="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Scroll to top">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      }

      <!-- New Items Notification -->
      @if (showNewItemsNotification()) {
        <div class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="text-sm font-medium">{{ pageSize }} new employees loaded!</span>
          </div>
        </div>
      }
    </div>

    <!-- Additional Sections: Work from Home & Leave Requests -->
    <div class="mt-8 space-y-6 request-section">
      <!-- Work from Home Requests Component -->
      <app-wfh-requests></app-wfh-requests>

      <!-- Leave Requests Component -->
      <app-leave-requests></app-leave-requests>
    </div>
  `
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @ViewChild('mobileScrollContainer', { static: false }) mobileScrollContainer!: ElementRef;
  @ViewChild('loadMoreTrigger', { static: false }) loadMoreTrigger!: ElementRef;
  @ViewChild('mobileLoadMoreTrigger', { static: false }) mobileLoadMoreTrigger!: ElementRef;
  
  readonly employeeService = inject(EmployeeService);
  readonly filterService = inject(EmployeeFilterService);
  readonly modalService = inject(ModalService);
  private readonly router = inject(Router);
  
  private destroy$ = new Subject<void>();
  private loadMoreSubject = new Subject<void>();
  
  // Infinite scroll state
  public pageSize = 20;
  public currentPage = signal(1);
  public isLoadingMore = signal(false);
  private hasReachedEnd = signal(false);
  public showScrollToTop = signal(false);
  public showNewItemsNotification = signal(false);
  
  // Setup filter effect in injection context
  private filterEffect = effect(() => {
    // Track the actual filtered employees length to detect real changes
    const currentFiltered = this.filteredEmployees();
    const currentDisplayed = this.displayedEmployees();
    
    // Reset pagination only if we have fewer displayed items than available
    // This prevents unnecessary resets when just viewing the same data
    if (currentDisplayed.length > currentFiltered.length && this.currentPage() > 1) {
      this.currentPage.set(1);
      this.hasReachedEnd.set(false);
    }
  }, { allowSignalWrites: true });
  
  // Computed signals
  public displayedEmployees = computed(() => {
    const filtered = this.filteredEmployees();
    const currentPageValue = this.currentPage();
    return filtered.slice(0, currentPageValue * this.pageSize);
  });
  
  public hasMoreToLoad = computed(() => {
    const filtered = this.filteredEmployees();
    const displayed = this.displayedEmployees();
    return displayed.length < filtered.length && !this.hasReachedEnd();
  });

  // Filtered employees based on search criteria
  readonly filteredEmployees = computed(() => 
    this.filterService.filterEmployees(this.employeeService.employees())
  );

  /**
   * Get initials from employee name
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Format date string
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Navigate to view employee
   */
  viewEmployee(employeeId: string): void {
    this.router.navigate(['/admin/employee/view', employeeId]);
  }

  /**
   * Navigate to edit employee
   */
  editEmployee(employeeId: string): void {
    this.router.navigate(['/admin/employee/edit', employeeId]);
  }

  /**
   * Confirm delete employee
   */
  confirmDeleteEmployee(employee: Employee): void {
    this.modalService.confirmDelete(
      employee.employeeName,
      async () => {
        await this.employeeService.deleteEmployee(employee._id);
      }
    );
  }

  /**
   * Load more data for infinite scroll
   */
  loadMoreData(): string {
    if (!this.isLoadingMore() && this.hasMoreToLoad()) {
      this.isLoadingMore.set(true);
      
      // Add longer delay for better infinite scroll experience
      setTimeout(() => {
        this.currentPage.set(this.currentPage() + 1);
        
        // Show notification for new items
        this.showNewItemsNotification.set(true);
        
        // Add additional delay before hiding loading state
        setTimeout(() => {
          this.isLoadingMore.set(false);
          
          // Hide notification after showing new items
          setTimeout(() => {
            this.showNewItemsNotification.set(false);
          }, 2000);
        }, 300);
      }, 1200); // Increased delay from 500ms to 1200ms
    }
    return ''; // Return empty string for template
  }

  /**
   * Component initialization
   */
  ngOnInit(): void {
    this.setupScrollListener();
  }

  /**
   * Component cleanup
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup scroll listener for scroll-to-top button
   */
  private setupScrollListener(): void {
    // Use setTimeout to ensure ViewChild is available
    setTimeout(() => {
      const containers = [this.scrollContainer?.nativeElement, this.mobileScrollContainer?.nativeElement];
      
      containers.forEach(container => {
        if (container) {
          container.addEventListener('scroll', () => {
            this.showScrollToTop.set(container.scrollTop > 300);
          });
        }
      });
    }, 100);
  }

  /**
   * Scroll to top of the container
   */
  scrollToTop(): void {
    const container = this.scrollContainer?.nativeElement || this.mobileScrollContainer?.nativeElement;
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
