import { Component, input, output, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../../../core/services/employee.service';

export interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  username: string;
  department: string;
  position: string;
  workLocation: string;
  joinDate: string;
  bankAccount: string;
  panNumber: string;
  status: boolean;
  address: string;
  uanNumber?: string;
  esiNumber?: string;
  resourceType?: string;
  role: 'admin' | 'employee';
  password: string;
}

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors">
      <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Personal Information Section -->
          <div class="md:col-span-2">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h3>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              formControlName="name"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              [class.border-red-300]="employeeForm.get('name')?.invalid && employeeForm.get('name')?.touched">
            @if (employeeForm.get('name')?.invalid && employeeForm.get('name')?.touched) {
              <p class="mt-1 text-sm text-red-600 dark:text-red-400">Full name is required</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              type="email"
              formControlName="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-300]="employeeForm.get('email')?.invalid && employeeForm.get('email')?.touched">
            @if (employeeForm.get('email')?.invalid && employeeForm.get('email')?.touched) {
              <p class="mt-1 text-sm text-red-600">Valid email is required</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Phone <span class="text-red-500">*</span>
            </label>
            <input
              type="tel"
              formControlName="phone"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-300]="employeeForm.get('phone')?.invalid && employeeForm.get('phone')?.touched">
            @if (employeeForm.get('phone')?.invalid && employeeForm.get('phone')?.touched) {
              <p class="mt-1 text-sm text-red-600">Phone number is required</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Username <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              formControlName="username"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-300]="employeeForm.get('username')?.invalid && employeeForm.get('username')?.touched">
            @if (employeeForm.get('username')?.invalid && employeeForm.get('username')?.touched) {
              <p class="mt-1 text-sm text-red-600">Username is required</p>
            }
          </div>

          @if (mode() === 'create') {
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Password <span class="text-red-500">*</span>
              </label>
              <input
                type="password"
                formControlName="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-300]="employeeForm.get('password')?.invalid && employeeForm.get('password')?.touched">
              @if (employeeForm.get('password')?.invalid && employeeForm.get('password')?.touched) {
                <p class="mt-1 text-sm text-red-600">Password is required</p>
              }
            </div>
          }

          <!-- Work Information Section -->
          <div class="md:col-span-2 mt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Work Information</h3>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Department <span class="text-red-500">*</span>
            </label>
            <select
              formControlName="department"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select Department</option>
              <option value="Software Development">Software Development</option>
              <option value="Recruitment Department">Recruitment Department</option>
              <option value="Accounts and Finance Operations">Accounts and Finance Operations</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Designation <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              formControlName="position"
              placeholder="e.g., Software Engineer, HR Manager"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Work Location <span class="text-red-500">*</span>
            </label>
            <select
              formControlName="workLocation"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select Location</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Vridhachalam">Vridhachalam</option>
              <option value="Chennai">Chennai</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Join Date <span class="text-red-500">*</span>
            </label>
            <input
              type="date"
              formControlName="joinDate"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              formControlName="role"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              formControlName="status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option [value]="true">Active</option>
              <option [value]="false">Inactive</option>
            </select>
          </div>

          <!-- Financial Information Section -->
          <div class="md:col-span-2 mt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Financial Information</h3>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Bank Account <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              formControlName="bankAccount"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              PAN Number <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              formControlName="panNumber"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">UAN Number</label>
            <input
              type="text"
              formControlName="uanNumber"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ESI Number</label>
            <input
              type="text"
              formControlName="esiNumber"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
            <input
              type="text"
              formControlName="resourceType"
              placeholder="e.g., Full-time, Part-time, Contract"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>

          <!-- Address -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Address <span class="text-red-500">*</span>
            </label>
            <textarea
              formControlName="address"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            (click)="onCancel()">
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="employeeForm.invalid || isSubmitting()"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            @if (isSubmitting()) {
              <div class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {{ mode() === 'create' ? 'Creating...' : 'Updating...' }}
              </div>
            } @else {
              {{ mode() === 'create' ? 'Create Employee' : 'Update Employee' }}
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class EmployeeFormComponent implements OnInit {
  private readonly fb = new FormBuilder();

  // Inputs
  readonly mode = input.required<'create' | 'edit'>();
  readonly initialData = input<Employee | null>(null);
  readonly isSubmitting = input<boolean>(false);

  // Outputs
  readonly formSubmit = output<EmployeeFormData>();
  readonly formCancel = output<void>();

  // Form
  readonly employeeForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    username: ['', [Validators.required]],
    password: [''],
    department: ['', [Validators.required]],
    position: ['', [Validators.required]],
    workLocation: ['', [Validators.required]],
    joinDate: ['', [Validators.required]],
    role: ['employee', [Validators.required]],
    status: [true, [Validators.required]],
    bankAccount: ['', [Validators.required]],
    panNumber: ['', [Validators.required]],
    uanNumber: [''],
    esiNumber: [''],
    resourceType: [''],
    address: ['', [Validators.required]]
  });

  constructor() {
    // Add password validation for create mode
    effect(() => {
      if (this.mode() === 'create') {
        this.employeeForm.get('password')?.setValidators([Validators.required]);
      } else {
        this.employeeForm.get('password')?.clearValidators();
      }
      this.employeeForm.get('password')?.updateValueAndValidity();
    });

    // Populate form when initial data changes
    effect(() => {
      const data = this.initialData();
      if (data && this.mode() === 'edit') {
        this.populateForm(data);
      }
    });
  }

  ngOnInit(): void {
    // Initialize form based on mode
    if (this.mode() === 'create') {
      this.employeeForm.get('password')?.setValidators([Validators.required]);
    }
  }

  private populateForm(employee: Employee): void {
    this.employeeForm.patchValue({
      name: employee.employeeName,
      email: employee.employeeEmail,
      phone: employee.phone,
      username: employee.username,
      department: employee.department,
      position: employee.designation,
      workLocation: employee.workLocation,
      joinDate: employee.joinDate,
      role: employee.role,
      status: employee.status,
      bankAccount: employee.bankAccount,
      panNumber: employee.panNumber,
      uanNumber: employee.uanNumber,
      esiNumber: employee.esiNumber,
      resourceType: employee.resourceType,
      address: employee.address,
      password: employee.password
    });
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      this.formSubmit.emit(this.employeeForm.value as EmployeeFormData);
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
