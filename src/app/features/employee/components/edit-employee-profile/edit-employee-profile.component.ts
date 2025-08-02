import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  selector: 'app-edit-employee-profile',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
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
                Edit Profile
              </h1>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                Update your personal information
              </p>
            </div>
            <div class="flex items-center space-x-4">
              <app-theme-toggle />
              <app-reusable-button
                text="Cancel"
                variant="secondary"
                icon="x-mark"
                (click)="cancel()" />
            </div>
          </div>
        </div>
      </header>

      <!-- Edit Form Content -->
      <main class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          @if (isLoading()) {
            <div class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span class="ml-3 text-gray-600 dark:text-gray-400">Loading profile...</span>
            </div>
          } @else if (profileForm) {
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Personal Information -->
                <app-card>
                  <div class="space-y-6">
                    <div class="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <h3 class="text-lg font-medium text-gray-900 dark:text-white transition-colors">
                        Personal Information
                      </h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Update your personal details below
                      </p>
                    </div>
                    
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Full Name <span class="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          formControlName="employeeName"
                          placeholder="Enter your full name"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email Address <span class="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          formControlName="employeeEmail"
                          placeholder="Enter your email address"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                          readonly
                          required />
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone Number <span class="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          formControlName="phone"
                          placeholder="Enter your phone number"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Address <span class="text-red-500">*</span>
                        </label>
                        <textarea
                          formControlName="address"
                          placeholder="Enter your address"
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required></textarea>
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
                      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Employment information (read-only)
                      </p>
                    </div>
                    
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Employee ID
                        </label>
                        <input
                          type="text"
                          formControlName="username"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                          readonly />
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Employee ID cannot be changed</p>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Department
                        </label>
                        <input
                          type="text"
                          formControlName="department"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                          readonly />
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Department is managed by admin</p>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Designation
                        </label>
                        <input
                          type="text"
                          formControlName="designation"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                          readonly />
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Designation is managed by admin</p>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Work Location <span class="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          formControlName="workLocation"
                          placeholder="Enter your work location"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Join Date
                        </label>
                        <input
                          type="date"
                          formControlName="joinDate"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                          readonly />
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Join date cannot be changed</p>
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
                      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Update your financial details
                      </p>
                    </div>
                    
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Bank Account Number <span class="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          formControlName="bankAccount"
                          placeholder="Enter your bank account number"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          PAN Number <span class="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          formControlName="panNumber"
                          placeholder="Enter your PAN number"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          UAN Number
                        </label>
                        <input
                          type="text"
                          formControlName="uanNumber"
                          placeholder="Enter your UAN number (optional)"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          ESI Number
                        </label>
                        <input
                          type="text"
                          formControlName="esiNumber"
                          placeholder="Enter your ESI number (optional)"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                      </div>
                    </div>
                  </div>
                </app-card>

                <!-- Account Security -->
                <app-card>
                  <div class="space-y-6">
                    <div class="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <h3 class="text-lg font-medium text-gray-900 dark:text-white transition-colors">
                        Account Security
                      </h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Change your password
                      </p>
                    </div>
                    
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          formControlName="currentPassword"
                          placeholder="Enter your current password"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          formControlName="newPassword"
                          placeholder="Enter new password (leave blank to keep current)"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          formControlName="confirmPassword"
                          placeholder="Confirm your new password"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                      </div>
                    </div>
                  </div>
                </app-card>
              </div>

              <!-- Form Actions -->
              <div class="mt-8 flex justify-end space-x-4">
                <app-reusable-button
                  text="Cancel"
                  variant="secondary"
                  (click)="cancel()"
                  type="button" />
                
                <app-reusable-button
                  text="Save Changes"
                  variant="primary"
                  icon="check"
                  [loading]="isSaving()"
                  [disabled]="profileForm.invalid || isSaving()"
                  type="submit" />
              </div>
            </form>
          } @else {
            <div class="text-center py-12">
              <p class="text-gray-500 dark:text-gray-400">Unable to load profile for editing</p>
            </div>
          }
        </div>
      </main>
    </div>

    <!-- Confirmation Modal -->
    <app-confirmation-modal />
  `
})
export class EditEmployeeProfileComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  
  profileForm!: FormGroup;
  private currentEmployee: Employee | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.loadCurrentEmployee();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      employeeName: ['', [Validators.required, Validators.minLength(2)]],
      employeeEmail: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      workLocation: ['', [Validators.required]],
      username: [{ value: '', disabled: true }],
      department: [{ value: '', disabled: true }],
      designation: [{ value: '', disabled: true }],
      joinDate: [{ value: '', disabled: true }],
      bankAccount: ['', [Validators.required, Validators.minLength(8)]],
      panNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],
      uanNumber: [''],
      esiNumber: [''],
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
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
      this.currentEmployee = employees.find((emp: Employee) => emp._id === currentUser.id) || null;
      
      if (this.currentEmployee) {
        this.populateForm(this.currentEmployee);
      } else {
        this.toastService.error('Unable to load profile information');
        this.router.navigate(['/employee/profile']);
      }
    } catch (error) {
      console.error('Error loading employee profile:', error);
      this.toastService.error('Failed to load profile information');
      this.router.navigate(['/employee/profile']);
    } finally {
      this.isLoading.set(false);
    }
  }

  private populateForm(employee: Employee): void {
    this.profileForm.patchValue({
      employeeName: employee.employeeName,
      employeeEmail: employee.employeeEmail,
      phone: employee.phone,
      address: employee.address,
      workLocation: employee.workLocation,
      username: employee.username,
      department: employee.department,
      designation: employee.designation,
      joinDate: employee.joinDate,
      bankAccount: employee.bankAccount,
      panNumber: employee.panNumber,
      uanNumber: employee.uanNumber || '',
      esiNumber: employee.esiNumber || ''
    });
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid || !this.currentEmployee) {
      this.markFormGroupTouched();
      this.toastService.error('Please fill in all required fields correctly');
      return;
    }

    this.modalService.confirm(
      'Save Changes',
      'Are you sure you want to save these changes to your profile?',
      async () => {
        await this.saveProfile();
      },
      {
        confirmText: 'Save',
        cancelText: 'Cancel',
        confirmVariant: 'primary'
      }
    );
  }

  private async saveProfile(): Promise<void> {
    if (!this.currentEmployee) return;

    try {
      this.isSaving.set(true);
      
      const formValue = this.profileForm.value;
      const updateData = {
        name: formValue.employeeName,
        email: this.currentEmployee.employeeEmail, // Keep original email
        joinDate: this.currentEmployee.joinDate, // Keep original join date
        role: this.currentEmployee.role, // Keep original role
        username: this.currentEmployee.username, // Keep original username
        address: formValue.address,
        bankAccount: formValue.bankAccount,
        department: this.currentEmployee.department, // Keep original department
        position: this.currentEmployee.designation, // Keep original designation
        esiNumber: formValue.esiNumber || 'N/A',
        panNumber: formValue.panNumber,
        phone: formValue.phone,
        resourceType: this.currentEmployee.resourceType, // Keep original resource type
        status: this.currentEmployee.status, // Keep original status
        uanNumber: formValue.uanNumber || 'NA',
        workLocation: formValue.workLocation,
        password: formValue.newPassword || this.currentEmployee.password // Only update if new password provided
      };

      await this.employeeService.updateEmployee(this.currentEmployee._id, updateData);
      
      this.toastService.success('Profile updated successfully');
      this.router.navigate(['/employee/profile']);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      this.toastService.error('Failed to update profile. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  cancel(): void {
    // Check if form has been modified
    if (this.profileForm.dirty) {
      this.modalService.confirm(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to leave without saving?',
        () => {
          this.router.navigate(['/employee/profile']);
        },
        {
          confirmText: 'Discard',
          cancelText: 'Stay',
          confirmVariant: 'danger'
        }
      );
    } else {
      this.router.navigate(['/employee/profile']);
    }
  }
}
