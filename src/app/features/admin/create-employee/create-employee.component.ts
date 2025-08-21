import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmployeeService, CreateEmployeeRequest } from '../../../core/services/employee.service';
import { ToastService } from '../../../shared/components';
import { 
  EmployeeFormComponent, 
  type EmployeeFormData,
  PageHeaderComponent, 
  type PageHeaderAction 
} from '../../../shared/components';

@Component({
  selector: 'app-create-employee',
  standalone: true,
  imports: [CommonModule, EmployeeFormComponent, PageHeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <!-- Page Header -->
      <app-page-header
        title="Create New Employee"
        subtitle="Add a new employee to the system"
        [actions]="headerActions" />

      <!-- Main Content -->
      <main class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <app-employee-form
            mode="create"
            [isSubmitting]="isSubmitting()"
            (formSubmit)="onFormSubmit($event)"
            (formCancel)="onFormCancel()" />
        </div>
      </main>
    </div>
  `
})
export class CreateEmployeeComponent {
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly toastService = inject(ToastService);
  readonly isSubmitting = signal(false);

  readonly headerActions: PageHeaderAction[] = [
    {
      label: 'Back to List',
      action: () => this.goBack(),
      variant: 'secondary'
    }
  ];

  async onFormSubmit(formData: EmployeeFormData): Promise<void> {
    this.isSubmitting.set(true);

    try {
      const createData: CreateEmployeeRequest = {
        employeeName: formData.name,
        employeeEmail: formData.email,
        joinDate: formData.joinDate,
        role: formData.role,
        username: formData.username,
        address: formData.address,
        bankAccount: formData.bankAccount,
        department: formData.department,
        designation: formData.position,
        esiNumber: formData.esiNumber || '',
        panNumber: formData.panNumber,
        phone: formData.phone,
        resourceType: formData.resourceType || '',
        uanNumber: formData.uanNumber || '',
        workLocation: formData.workLocation,
        password: formData.password
      };

      const success = await this.employeeService.createEmployee(createData);
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

  private async goBack(): Promise<void> {
    await this.router.navigate(['/admin']);
  }
}
