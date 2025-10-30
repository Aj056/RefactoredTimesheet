import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

// Enhanced interface for WFH request data (matches employee apply component)
interface WFHRequest {
  id: string;
  employeeName: string;
  employeeInitials: string;
  employeeId: string;
  department: string;
  type: 'leave' | 'wfh';
  fromDate: string;
  toDate?: string;
  duration: 'half-day' | 'full-day' | 'multiple-days';
  workingDays: number;
  isHalfDay: boolean;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  priority: 'low' | 'medium' | 'high';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  comments?: string;
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
                      <span>{{ formatDate(request.fromDate) }}{{ request.toDate ? ' - ' + formatDate(request.toDate) : '' }}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ request.workingDays }} {{ request.workingDays === 1 ? 'day' : 'days' }}{{ request.isHalfDay ? ' (Half)' : '' }}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <svg class="w-4 h-4" [ngClass]="{
                        'text-red-500': request.priority === 'high',
                        'text-yellow-500': request.priority === 'medium',
                        'text-green-500': request.priority === 'low'
                      }" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                      <span class="text-xs font-medium"
                            [ngClass]="{
                              'text-red-600 dark:text-red-400': request.priority === 'high',
                              'text-yellow-600 dark:text-yellow-400': request.priority === 'medium',
                              'text-green-600 dark:text-green-400': request.priority === 'low'
                            }">
                        {{ request.priority | titlecase }} Priority
                      </span>
                    </div>
                  </div>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-300 transition-colors">{{ request.reason }}</p>
                  <div class="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Submitted {{ getTimeAgo(request.submittedAt) }}</span>
                  </div>
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
                <!-- Action buttons based on status -->
                @if (request.status === 'pending') {
                  <div class="flex flex-wrap gap-2">
                    <button 
                      (click)="approveRequest(request.id)"
                      class="flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors" 
                      title="Approve Request">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button 
                      (click)="rejectRequest(request.id)"
                      class="flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors" 
                      title="Reject Request">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                    <button 
                      (click)="viewRequestDetails(request.id)"
                      class="flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors" 
                      title="View Details">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  </div>
                } @else {
                  <div class="flex flex-col items-end text-xs text-gray-500 dark:text-gray-400">
                    @if (request.status === 'approved' && request.approvedBy) {
                      <span>Approved by {{ request.approvedBy }}</span>
                      @if (request.approvedAt) {
                        <span>{{ getTimeAgo(request.approvedAt) }}</span>
                      }
                    } @else if (request.status === 'rejected' && request.rejectedBy) {
                      <span>Rejected by {{ request.rejectedBy }}</span>
                      @if (request.rejectedAt) {
                        <span>{{ getTimeAgo(request.rejectedAt) }}</span>
                      }
                    }
                    <button 
                      (click)="viewRequestDetails(request.id)"
                      class="mt-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                      View Details
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
  // Enhanced sample data for WFH requests (matches new apply component format)
  readonly requests = computed<WFHRequest[]>(() => [
    {
      id: '1',
      employeeName: 'John Smith',
      employeeInitials: 'JS',
      employeeId: 'EMP005',
      department: 'Engineering',
      type: 'wfh',
      fromDate: '2024-12-15',
      duration: 'full-day',
      workingDays: 1,
      isHalfDay: false,
      reason: 'Personal appointment with family physician',
      status: 'pending',
      submittedAt: '2024-12-10T14:20:00Z',
      priority: 'medium'
    },
    {
      id: '2',
      employeeName: 'Sarah Johnson',
      employeeInitials: 'SJ',
      employeeId: 'EMP006',
      department: 'Marketing',
      type: 'wfh',
      fromDate: '2024-12-16',
      duration: 'half-day',
      workingDays: 0.5,
      isHalfDay: true,
      reason: 'Home internet technician visit',
      status: 'approved',
      submittedAt: '2024-12-12T09:30:00Z',
      priority: 'low',
      approvedBy: 'Admin',
      approvedAt: '2024-12-12T11:45:00Z'
    },
    {
      id: '3',
      employeeName: 'Mike Davis',
      employeeInitials: 'MD',
      employeeId: 'EMP007',
      department: 'Design',
      type: 'wfh',
      fromDate: '2024-12-17',
      duration: 'full-day',
      workingDays: 1,
      isHalfDay: false,
      reason: 'Avoiding heavy traffic due to construction',
      status: 'pending',
      submittedAt: '2024-12-14T16:15:00Z',
      priority: 'low'
    },
    {
      id: '4',
      employeeName: 'Emily Chen',
      employeeInitials: 'EC',
      employeeId: 'EMP008',
      department: 'HR',
      type: 'wfh',
      fromDate: '2024-12-18',
      toDate: '2024-12-19',
      duration: 'multiple-days',
      workingDays: 2,
      isHalfDay: false,
      reason: 'Child care - school closure',
      status: 'approved',
      submittedAt: '2024-12-11T13:00:00Z',
      priority: 'high',
      approvedBy: 'Admin',
      approvedAt: '2024-12-11T15:30:00Z'
    },
    {
      id: '5',
      employeeName: 'David Wilson',
      employeeInitials: 'DW',
      employeeId: 'EMP009',
      department: 'Engineering',
      type: 'wfh',
      fromDate: '2024-12-19',
      duration: 'half-day',
      workingDays: 0.5,
      isHalfDay: true,
      reason: 'Focus time for project deadline',
      status: 'pending',
      submittedAt: '2024-12-16T10:45:00Z',
      priority: 'medium'
    }
  ]);

  // Computed pending count
  readonly pendingCount = computed(() => 
    this.requests().filter(request => request.status === 'pending').length
  );

  /**
   * Format date string for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  /**
   * Get time ago string
   */
  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return this.formatDate(dateString);
  }

  /**
   * Approve a WFH request with enhanced functionality
   */
  approveRequest(requestId: string): void {
    console.log('Approving WFH request:', requestId);
    // TODO: Implement actual approval logic with API call
    
    const request = this.requests().find(r => r.id === requestId);
    if (request) {
      console.log(`WFH request approved for ${request.employeeName}`);
      console.log(`Working days: ${request.workingDays}, Priority: ${request.priority}`);
    }
  }

  /**
   * Reject a WFH request with enhanced functionality
   */
  rejectRequest(requestId: string): void {
    console.log('Rejecting WFH request:', requestId);
    // TODO: Implement actual rejection logic with API call
    
    const request = this.requests().find(r => r.id === requestId);
    if (request) {
      console.log(`WFH request rejected for ${request.employeeName}`);
    }
  }

  /**
   * View full request details
   */
  viewRequestDetails(requestId: string): void {
    const request = this.requests().find(r => r.id === requestId);
    if (request) {
      console.log('Viewing WFH request details:', request);
      // TODO: Open modal or navigate to detailed view
    }
  }

  /**
   * Add comment to request
   */
  addComment(requestId: string): void {
    console.log('Adding comment to WFH request:', requestId);
    // TODO: Implement comment functionality
  }
}
