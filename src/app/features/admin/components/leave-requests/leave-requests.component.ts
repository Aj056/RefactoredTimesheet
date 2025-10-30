import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

// Enhanced interface for Leave request data (matches employee apply component)
interface LeaveRequest {
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
  leaveType?: string;
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
  selector: 'app-leave-requests',
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
      background: linear-gradient(135deg, #1f2937 0%, #374151 100%) !important;
    }
  `],
  template: `
    <!-- Leave Requests Section -->
    <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg transition-color mt-12">
      <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 transition-colors section-header">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white transition-colors">Leave Requests</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 transition-colors">Employee leave applications and approvals</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
              {{ pendingCount() }} Pending
            </span>
            <button class="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm font-medium transition-colors">
              View All
            </button>
          </div>
        </div>
      </div>
      
      <div class="max-h-80 overflow-y-auto custom-scrollbar">
        <!-- Sample Leave Requests -->
        @for (request of requests(); track request.id) {
          <div class="px-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors request-item">
            <div class="flex items-center justify-between request-header">
              <div class="flex items-center space-x-4 flex-1">
                <div class="flex-shrink-0">
                  <div class="h-10 w-10 rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center">
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
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            [ngClass]="{
                              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': request.leaveType === 'Annual Leave',
                              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': request.leaveType === 'Personal Leave',
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': request.leaveType === 'Medical Leave',
                              'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300': request.leaveType === 'Emergency Leave'
                            }">
                        {{ request.leaveType }}
                      </span>
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No leave requests available</p>
          </div>
        }
      </div>
    </div>
  `
})
export class LeaveRequestsComponent {
  // Enhanced sample data for Leave requests (matches new apply component format)
  readonly requests = computed<LeaveRequest[]>(() => [
    {
      id: '1',
      employeeName: 'Alice Brown',
      employeeInitials: 'AB',
      employeeId: 'EMP001',
      department: 'Finance',
      type: 'leave',
      fromDate: '2024-12-23',
      toDate: '2024-12-27',
      duration: 'multiple-days',
      workingDays: 5,
      isHalfDay: false,
      leaveType: 'Annual Leave',
      reason: 'Christmas vacation with family',
      status: 'approved',
      submittedAt: '2024-12-15T10:30:00Z',
      priority: 'medium',
      approvedBy: 'Admin',
      approvedAt: '2024-12-15T14:20:00Z'
    },
    {
      id: '2',
      employeeName: 'Robert Taylor',
      employeeInitials: 'RT',
      employeeId: 'EMP002',
      department: 'Operations',
      type: 'leave',
      fromDate: '2025-01-02',
      toDate: '2025-01-03',
      duration: 'multiple-days',
      workingDays: 2,
      isHalfDay: false,
      leaveType: 'Personal Leave',
      reason: 'Wedding anniversary celebration',
      status: 'pending',
      submittedAt: '2024-12-20T09:15:00Z',
      priority: 'low'
    },
    {
      id: '3',
      employeeName: 'Lisa Garcia',
      employeeInitials: 'LG',
      employeeId: 'EMP003',
      department: 'Marketing',
      type: 'leave',
      fromDate: '2025-01-15',
      toDate: '2025-01-22',
      duration: 'multiple-days',
      workingDays: 6,
      isHalfDay: false,
      leaveType: 'Medical Leave',
      reason: 'Minor surgery and recovery',
      status: 'pending',
      submittedAt: '2025-01-05T11:45:00Z',
      priority: 'high'
    },
    {
      id: '4',
      employeeName: 'James Anderson',
      employeeInitials: 'JA',
      employeeId: 'EMP004',
      department: 'IT',
      type: 'leave',
      fromDate: '2025-02-14',
      duration: 'half-day',
      workingDays: 0.5,
      isHalfDay: true,
      leaveType: 'Personal Leave',
      reason: 'Valentine\'s Day with spouse',
      status: 'approved',
      submittedAt: '2025-02-01T08:30:00Z',
      priority: 'low',
      approvedBy: 'Admin',
      approvedAt: '2025-02-01T12:15:00Z'
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
   * Approve a leave request with enhanced functionality
   */
  approveRequest(requestId: string): void {
    console.log('Approving leave request:', requestId);
    // TODO: Implement actual approval logic with API call
    // Should update request status, add approval timestamp, and send notification
    
    // Simulating approval for now
    const request = this.requests().find(r => r.id === requestId);
    if (request) {
      // In real implementation, this would be handled by the state management/API
      console.log(`Leave request approved for ${request.employeeName}`);
      console.log(`Working days: ${request.workingDays}, Priority: ${request.priority}`);
    }
  }

  /**
   * Reject a leave request with enhanced functionality
   */
  rejectRequest(requestId: string): void {
    console.log('Rejecting leave request:', requestId);
    // TODO: Implement actual rejection logic with API call
    // Should update request status, add rejection timestamp, and send notification
    
    // Simulating rejection for now
    const request = this.requests().find(r => r.id === requestId);
    if (request) {
      // In real implementation, this would be handled by the state management/API
      console.log(`Leave request rejected for ${request.employeeName}`);
      // Could show a modal for rejection reason
    }
  }

  /**
   * View full request details
   */
  viewRequestDetails(requestId: string): void {
    const request = this.requests().find(r => r.id === requestId);
    if (request) {
      console.log('Viewing request details:', request);
      // TODO: Open modal or navigate to detailed view
    }
  }

  /**
   * Add comment to request
   */
  addComment(requestId: string): void {
    console.log('Adding comment to request:', requestId);
    // TODO: Implement comment functionality
  }
}
