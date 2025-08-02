import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DeleteConfirmationData {
  employeeId: string;
  employeeName: string;
}

@Component({
  selector: 'app-delete-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 transition-colors">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 transition-colors">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700 transition-colors">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white transition-colors">Delete Employee</h3>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0">
              <svg class="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">
                Are you sure you want to delete employee 
                <span class="font-semibold text-gray-900">{{ data().employeeName }}</span>?
              </p>
              <p class="text-sm text-gray-500 mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            (click)="onCancel()">
            Cancel
          </button>
          <button
            type="button"
            [disabled]="isDeleting()"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            (click)="onConfirm()">
            @if (isDeleting()) {
              <div class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </div>
            } @else {
              Delete Employee
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class DeleteConfirmationComponent {
  readonly data = input.required<DeleteConfirmationData>();
  readonly isDeleting = input<boolean>(false);
  
  readonly confirm = output<string>();
  readonly cancel = output<void>();

  onConfirm(): void {
    this.confirm.emit(this.data().employeeId);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
