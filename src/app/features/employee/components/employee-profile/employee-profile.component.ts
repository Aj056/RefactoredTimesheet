import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  CardComponent, 
  ReusableButtonComponent, 
  ThemeToggleComponent,
  ToastService,
  ConfirmationModalComponent 
} from '../../../../shared/components';
import { Employee, EmployeeService } from '../../../../core/services/employee.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ModalService } from '../../../../shared/services/modal.service';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [
    CommonModule, 
    CardComponent, 
    ReusableButtonComponent, 
    ThemeToggleComponent,
    ConfirmationModalComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <!-- Navigation Header -->
      <header class="bg-white dark:bg-gray-800 shadow transition-colors">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white transition-colors">
                My Profile
              </h1>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                View and manage your personal information
              </p>
            </div>
            <div class="flex items-center space-x-4">
              <app-theme-toggle />
              <app-reusable-button
                text="Back to Dashboard"
                variant="secondary"
                icon="arrow-left"
                (click)="goToDashboard()" />
              <app-reusable-button
                text="Logout"
                variant="danger"
                icon="logout"
                (click)="logout()" />
            </div>
          </div>
        </div>
      </header>

      <!-- Profile Content -->
      <main class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          @if (isLoading()) {
            <div class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span class="ml-3 text-gray-600 dark:text-gray-400">Loading profile...</span>
            </div>
          } @else if (currentEmployee()) {
            <!-- Profile Header Card -->
            <app-card class="mb-6">
              <div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <!-- Avatar -->
                <div class="h-24 w-24 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                  <span class="text-2xl font-bold text-white">
                    {{ getInitials(currentEmployee()!.employeeName) }}
                  </span>
                </div>
                
                <!-- Basic Info -->
                <div class="flex-1 text-center sm:text-left">
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                    {{ currentEmployee()!.employeeName }}
                  </h2>
                  <p class="text-gray-600 dark:text-gray-300 transition-colors">
                    {{ currentEmployee()!.designation }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                    {{ currentEmployee()!.department }}
                  </p>
                  <div class="mt-2">
                    <span class="inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors"
                          [ngClass]="{
                            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': currentEmployee()!.status,
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': !currentEmployee()!.status
                          }">
                      {{ currentEmployee()!.status ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
                
                <!-- Action Button -->
                <div class="flex-shrink-0">
                  <app-reusable-button
                    text="Edit Profile"
                    variant="primary"
                    icon="edit"
                    (click)="editProfile()" />
                </div>
              </div>
            </app-card>

            <!-- Profile Details Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Personal Information -->
              <app-card>
                <div class="space-y-6">
                  <div class="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white transition-colors">
                      Personal Information
                    </h3>
                  </div>
                  
                  <div class="space-y-4">
                    <div class="profile-field">
                      <label class="profile-label">Full Name</label>
                      <p class="profile-value">{{ currentEmployee()!.employeeName }}</p>
                    </div>
                    
                    <div class="profile-field">
                      <label class="profile-label">Email Address</label>
                      <p class="profile-value">{{ currentEmployee()!.employeeEmail }}</p>
                    </div>
                    
                    <div class="profile-field">
                      <label class="profile-label">Phone Number</label>
                      <p class="profile-value">{{ currentEmployee()!.phone }}</p>
                    </div>
                    
                    <div class="profile-field">
                      <label class="profile-label">Address</label>
                      <p class="profile-value">{{ currentEmployee()!.address }}</p>
                    </div>
                    
                    <div class="profile-field">
                      <label class="profile-label">Work Location</label>
                      <p class="profile-value">{{ currentEmployee()!.workLocation }}</p>
                    </div>
                  </div>
                </div>
              </app-card>

              <!-- Employment Details -->
              <app-card>
                <div class="space-y-6">
                  <div class="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white transition-colors">
                      Employment Details
                    </h3>
                  </div>
                  
                  <div class="space-y-4">
                    <div class="profile-field">
                      <label class="profile-label">Employee ID</label>
                      <p class="profile-value font-mono">{{ currentEmployee()!.username }}</p>
                    </div>
                    
                    <div class="profile-field">
                      <label class="profile-label">Department</label>
                      <p class="profile-value">{{ currentEmployee()!.department }}</p>
                    </div>
                    
                    <div class="profile-field">
                      <label class="profile-label">Designation</label>
                      <p class="profile-value">{{ currentEmployee()!.designation }}</p>
                    </div>
                    
                    <div class="profile-field">
                      <label class="profile-label">Join Date</label>
                      <p class="profile-value">{{ formatDate(currentEmployee()!.joinDate) }}</p>
                    </div>
                    
                    <div class="profile-field">
                      <label class="profile-label">Resource Type</label>
                      <p class="profile-value">{{ currentEmployee()!.resourceType }}</p>
                    </div>
                    
                    <div class="profile-field">
                      <label class="profile-label">Role</label>
                      <p class="profile-value capitalize">{{ currentEmployee()!.role }}</p>
                    </div>
                  </div>
                </div>
              </app-card>

              <!-- Financial Information -->
              <app-card>
                <div class="space-y-6">
                  <div class="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white transition-colors">
                      Financial Information
                    </h3>
                  </div>
                  
                  <div class="space-y-4">
                    <div class="profile-field">
                      <label class="profile-label">Bank Account</label>
                      <p class="profile-value font-mono">{{ maskBankAccount(currentEmployee()!.bankAccount) }}</p>
                    </div>
                    
                    <div class="profile-field">
                      <label class="profile-label">PAN Number</label>
                      <p class="profile-value font-mono">{{ currentEmployee()!.panNumber }}</p>
                    </div>
                    
                    <div class="profile-field">
                      <label class="profile-label">UAN Number</label>
                      <p class="profile-value font-mono">{{ currentEmployee()!.uanNumber || 'Not Available' }}</p>
                    </div>
                    
                    <div class="profile-field">
                      <label class="profile-label">ESI Number</label>
                      <p class="profile-value font-mono">{{ currentEmployee()!.esiNumber || 'Not Available' }}</p>
                    </div>
                  </div>
                </div>
              </app-card>
            </div>
          } @else {
            <div class="text-center py-12">
              <p class="text-gray-500 dark:text-gray-400">Unable to load profile information</p>
            </div>
          }
        </div>
      </main>
    </div>

    <!-- Confirmation Modal -->
    <app-confirmation-modal />
  `,
  styles: [`
    .profile-field {
      @apply space-y-1;
    }
    
    .profile-label {
      @apply block text-sm font-medium text-gray-500 dark:text-gray-300 transition-colors;
    }
    
    .profile-value {
      @apply text-sm text-gray-900 dark:text-gray-100 font-medium transition-colors;
    }
  `]
})
export class EmployeeProfileComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);

  readonly isLoading = signal(true);
  readonly currentEmployee = signal<Employee | null>(null);

  ngOnInit(): void {
    this.loadCurrentEmployee();
  }

  private async loadCurrentEmployee(): Promise<void> {
    try {
      this.isLoading.set(true);
      
      // Get current user from auth service
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.router.navigate(['/login']);
        return;
      }

      // Load employees and find current user
      await this.employeeService.loadEmployees();
      const employees = this.employeeService.employees();
      const currentEmployee = employees.find((emp: Employee) => emp._id === currentUser.id);
      
      if (currentEmployee) {
        this.currentEmployee.set(currentEmployee);
      } else {
        this.toastService.error('Unable to load profile information');
      }
    } catch (error) {
      console.error('Error loading employee profile:', error);
      this.toastService.error('Failed to load profile information');
    } finally {
      this.isLoading.set(false);
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  maskBankAccount(accountNumber: string): string {
    if (!accountNumber || accountNumber.length < 4) return accountNumber;
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  }

  editProfile(): void {
    this.router.navigate(['/employee/profile/edit']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.modalService.confirmLogout(() => {
      this.authService.logout();
      this.toastService.success('Logged out successfully');
      this.router.navigate(['/login']);
    });
  }
}
