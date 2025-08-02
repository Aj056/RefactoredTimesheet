import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService, Employee, UpdateEmployeeRequest } from '../../../core/services/employee.service';
import { 
  EmployeeFormComponent, 
  type EmployeeFormData,
  PageHeaderComponent, 
  type PageHeaderAction,
  LoadingComponent 
} from '../../../shared/components';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [CommonModule, EmployeeFormComponent, PageHeaderComponent, LoadingComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <!-- Page Header -->
      <app-page-header
        title="Edit Employee"
        subtitle="Update employee information"
        [actions]="headerActions" />

      <!-- Main Content -->
      <main class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          @if (isLoading()) {
            <app-loading message="Loading employee details..." />
          } @else if (employee()) {
            <app-employee-form
              mode="edit"
              [initialData]="employee()"
              [isSubmitting]="isSubmitting()"
              (formSubmit)="onFormSubmit($event)"
              (formCancel)="onFormCancel()" />
          } @else {
            <div class="text-center py-12">
              <div class="text-red-500 dark:text-red-400 text-lg transition-colors">Employee not found</div>
              <button 
                class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                (click)="goBack()">
                Back to List
              </button>
            </div>
          }
        </div>
      </main>
    </div>
  `
})
export class EditEmployeeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);

  readonly employee = signal<Employee | null>(null);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);

  readonly headerActions: PageHeaderAction[] = [
    {
      label: 'Cancel',
      action: () => this.goBack(),
      variant: 'secondary'
    }
  ];

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadEmployee(id);
    }
  }

  private async loadEmployee(id: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const employee = await this.employeeService.getEmployee(id);
      if (employee) {
        this.employee.set(employee);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async onFormSubmit(formData: EmployeeFormData): Promise<void> {
    const employee = this.employee();
    if (!employee) return;

    this.isSubmitting.set(true);

    try {
      const updateData: UpdateEmployeeRequest = {
        name: formData.name,
        email: formData.email,
        joinDate: formData.joinDate,
        role: formData.role,
        username: formData.username,
        address: formData.address,
        bankAccount: formData.bankAccount,
        department: formData.department,
        position: formData.position,
        esiNumber: formData.esiNumber || '',
        panNumber: formData.panNumber,
        phone: formData.phone,
        resourceType: formData.resourceType || '',
        status: formData.status,
        uanNumber: formData.uanNumber || '',
        workLocation: formData.workLocation,
        password: formData.password
      };

      const success = await this.employeeService.updateEmployee(employee._id, updateData);
      if (success) {
        await this.router.navigate(['/admin']);
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onFormCancel(): void {
    this.goBack();
  }

  async goBack(): Promise<void> {
    await this.router.navigate(['/admin']);
  }
}
