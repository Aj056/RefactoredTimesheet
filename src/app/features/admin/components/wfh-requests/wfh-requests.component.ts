import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interface for WFH request data
interface WFHRequest {
  id: string;
  employeeName: string;
  employeeInitials: string;
  department: string;
  date: string;
  duration: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

@Component({
  selector: 'app-wfh-requests',
  standalone: true,
  imports: [CommonModule],
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

    /* Request sections responsive styles */
    @media (max-width: 768px) {
      .request-item {
        padding: 1rem;
      }
      
      .request-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }
      
      .request-details {
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      
      .request-actions {
        margin-top: 0.75rem;
        justify-content: flex-start;
      }
    }

    /* Enhanced sections */
    .dark .section-header {
      background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
    }
  `],
  template: `
    <!-- Work from Home Requests Section -->
    <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg transition-colors">
      <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 transition-colors section-header">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm0 0V7a2 2 0 012-2h1m0 0V5a2 2 0 012-2h6a2 2 0 012 2v0M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white transition-colors">Work from Home Requests</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 transition-colors">Recent work from home requests from employees</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {{ pendingCount() }} Pending
            </span>
            <button class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors">
              View All
            </button>
          </div>
        </div>
      </div>
      
      <div class="max-h-80 overflow-y-auto custom-scrollbar">
        <!-- Sample WFH Requests -->
        @for (request of requests(); track request.id) {
          <div class="px-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors request-item">
            <div class="flex items-center justify-between request-header">
              <div class="flex items-center space-x-4 flex-1">
                <div class="flex-shrink-0">
                  <div class="h-10 w-10 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
                    <span class="text-sm font-medium text-white">{{ request.employeeInitials }}</span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white transition-colors truncate">{{ request.employeeName }}</h4>
                    <span class="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">•</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 transition-colors">{{ request.department }}</span>
                  </div>
                  <div class="mt-1 flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500 dark:text-gray-400 request-details">
                    <div class="flex items-center space-x-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{{ request.date }}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ request.duration }}</span>
                    </div>
                  </div>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-300 transition-colors">{{ request.reason }}</p>
                </div>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-3 request-actions">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors mb-2 sm:mb-0"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300': request.status === 'pending',
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': request.status === 'approved',
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': request.status === 'rejected'
                      }">
                  {{ request.status | titlecase }}
                </span>
                @if (request.status === 'pending') {
                  <div class="flex space-x-2">
                    <button 
                      (click)="approveRequest(request.id)"
                      class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors" 
                      title="Approve">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button 
                      (click)="rejectRequest(request.id)"
                      class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors" 
                      title="Reject">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        }
        
        @if (requests().length === 0) {
          <div class="px-4 py-8 text-center text-gray-500 dark:text-gray-400 transition-colors">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm0 0V7a2 2 0 012-2h1m0 0V5a2 2 0 012-2h6a2 2 0 012 2v0M7 7h10" />
            </svg>
            <p>No work from home requests available</p>
          </div>
        }
      </div>
    </div>
  `
})
export class WFHRequestsComponent {
  // Sample data for WFH requests
  readonly requests = computed<WFHRequest[]>(() => [
    {
      id: '1',
      employeeName: 'John Smith',
      employeeInitials: 'JS',
      department: 'Engineering',
      date: 'Dec 15, 2024',
      duration: 'Full Day',
      reason: 'Personal appointment with family physician',
      status: 'pending'
    },
    {
      id: '2',
      employeeName: 'Sarah Johnson',
      employeeInitials: 'SJ',
      department: 'Marketing',
      date: 'Dec 16, 2024',
      duration: 'Half Day',
      reason: 'Home internet technician visit',
      status: 'approved'
    },
    {
      id: '3',
      employeeName: 'Mike Davis',
      employeeInitials: 'MD',
      department: 'Design',
      date: 'Dec 17, 2024',
      duration: 'Full Day',
      reason: 'Avoiding heavy traffic due to construction',
      status: 'pending'
    },
    {
      id: '4',
      employeeName: 'Emily Chen',
      employeeInitials: 'EC',
      department: 'HR',
      date: 'Dec 18, 2024',
      duration: 'Full Day',
      reason: 'Child care - school closure',
      status: 'approved'
    },
    {
      id: '5',
      employeeName: 'David Wilson',
      employeeInitials: 'DW',
      department: 'Engineering',
      date: 'Dec 19, 2024',
      duration: 'Half Day',
      reason: 'Focus time for project deadline',
      status: 'pending'
    }
  ]);

  // Computed pending count
  readonly pendingCount = computed(() => 
    this.requests().filter(request => request.status === 'pending').length
  );

  /**
   * Approve a WFH request
   */
  approveRequest(requestId: string): void {
    console.log('Approving WFH request:', requestId);
    // TODO: Implement actual approval logic
  }

  /**
   * Reject a WFH request
   */
  rejectRequest(requestId: string): void {
    console.log('Rejecting WFH request:', requestId);
    // TODO: Implement actual rejection logic
  }
}
