import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService, Employee } from '../../../core/services/employee.service';
import { ThemeService } from '../../../shared/services/theme.service';
import { 
  PageHeaderComponent, 
  type PageHeaderAction,
  LoadingComponent,
  ReusableButtonComponent 
} from '../../../shared/components';

@Component({
  selector: 'app-view-employee',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 shadow transition-colors">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Employee Details</h1>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">View employee information</p>
            </div>
            <div class="flex space-x-4">
              <button
                class="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                (click)="editEmployee()">
                Edit Employee
              </button>
              <button
                class="bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                (click)="goBack()">
                Back to List
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          @if (isLoading()) {
            <div class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span class="ml-2 text-gray-600 dark:text-gray-400 transition-colors">Loading employee details...</span>
            </div>
          } @else if (employee()) {
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors">
              <!-- Employee Header -->
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors">
                <div class="flex items-center">
                  <div class="h-16 w-16 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center transition-colors">
                    <span class="text-white font-bold text-xl">
                      {{ getEmployeeInitials(employee()!.employeeName) }}
                    </span>
                  </div>
                  <div class="ml-6">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{{ employee()!.employeeName }}</h2>
                    <p class="text-sm text-gray-600 dark:text-gray-400 transition-colors">{{ employee()!.designation }}</p>
                    <span [class]="getStatusClasses(employee()!.status)">
                      {{ getStatusText(employee()!.status) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Employee Details -->
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Personal Information -->
                  <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Personal Information</h3>
                    <div class="space-y-3">
                      <div>
                        <label class="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Email</label>
                        <p class="text-sm text-gray-900 dark:text-white transition-colors">{{ employee()!.employeeEmail }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Phone</label>
                        <p class="text-sm text-gray-900 dark:text-white transition-colors">{{ employee()!.phone }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Address</label>
                        <p class="text-sm text-gray-900 dark:text-white transition-colors">{{ employee()!.address }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Work Information -->
                  <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Work Information</h3>
                    <div class="space-y-3">
                      <div>
                        <label class="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Department</label>
                        <p class="text-sm text-gray-900 dark:text-white transition-colors">{{ employee()!.department }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Work Location</label>
                        <p class="text-sm text-gray-900 dark:text-white transition-colors">{{ employee()!.workLocation }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Join Date</label>
                        <p class="text-sm text-gray-900 dark:text-white transition-colors">{{ formatDate(employee()!.joinDate) }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Username</label>
                        <p class="text-sm text-gray-900 dark:text-white transition-colors">{{ employee()!.username }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Financial Information -->
                  <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Financial Information</h3>
                    <div class="space-y-3">
                      <div>
                        <label class="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Bank Account</label>
                        <p class="text-sm text-gray-900 dark:text-white transition-colors">{{ employee()!.bankAccount }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">PAN Number</label>
                        <p class="text-sm text-gray-900 dark:text-white transition-colors">{{ employee()!.panNumber }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">UAN Number</label>
                        <p class="text-sm text-gray-900 dark:text-white transition-colors">{{ employee()!.uanNumber }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">ESI Number</label>
                        <p class="text-sm text-gray-900 dark:text-white transition-colors">{{ employee()!.esiNumber }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Additional Information -->
                  <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Additional Information</h3>
                    <div class="space-y-3">
                      <div>
                        <label class="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Resource Type</label>
                        <p class="text-sm text-gray-900 dark:text-white transition-colors">{{ employee()!.resourceType }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Role</label>
                        <p class="text-sm text-gray-900 dark:text-white capitalize transition-colors">{{ employee()!.role }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } @else {
            <div class="text-center py-12">
              <div class="text-red-500 dark:text-red-400 text-lg transition-colors">Employee not found</div>
              <button 
                class="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
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
export class ViewEmployeeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  readonly themeService = inject(ThemeService);

  readonly employee = signal<Employee | null>(null);
  readonly isLoading = signal(false);

  readonly headerActions: PageHeaderAction[] = [
    {
      label: 'Back to List',
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
      this.employee.set(employee);
    } finally {
      this.isLoading.set(false);
    }
  }

  getEmployeeInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getStatusClasses(status: boolean): string {
    const baseClasses = 'inline-flex px-3 py-1 text-xs font-semibold rounded-full ml-2';
    return status 
      ? `${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300`
      : `${baseClasses} bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300`;
  }

  getStatusText(status: boolean): string {
    return status ? 'Active' : 'Inactive';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB');
  }

  async editEmployee(): Promise<void> {
    const emp = this.employee();
    if (emp) {
      await this.router.navigate(['/admin/employees/edit', emp._id]);
    }
  }

  async goBack(): Promise<void> {
    await this.router.navigate(['/admin']);
  }
}
