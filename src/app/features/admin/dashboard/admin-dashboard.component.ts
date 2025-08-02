import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../shared/services/modal.service';
import { 
  NavigationDropdownComponent,
  ThemeToggleComponent
} from '../../../shared/components';
import { EmployeeSearchComponent } from '../components/employee-search/employee-search.component';
import { EmployeeListComponent } from '../components/employee-list/employee-list.component';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NavigationDropdownComponent, ThemeToggleComponent, EmployeeSearchComponent, EmployeeListComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 shadow transition-colors">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Admin Dashboard</h1>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                Manage employees and oversee timesheet operations
              </p>
            </div>
            
            <!-- Modern Navigation Dropdown -->
            <div class="flex items-center space-x-4">
              <app-theme-toggle></app-theme-toggle>
              <app-navigation-dropdown></app-navigation-dropdown>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <!-- Quick Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-all duration-300">
              <div class="p-6 text-center">
                <div class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{{ employeeService.totalEmployees() }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Employees</div>
              </div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-all duration-300">
              <div class="p-6 text-center">
                <div class="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{{ employeeService.activeEmployees() }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Employees</div>
              </div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-all duration-300">
              <div class="p-6 text-center">
                <div class="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">{{ employeeService.inactiveEmployees() }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 font-medium">Inactive Employees</div>
              </div>
            </div>
          </div>

          <!-- Search and Filters -->
          <div class="mb-6">
            <app-employee-search />
          </div>

          <!-- Employee List (Responsive) -->
          <app-employee-list />
        </div>
      </main>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  readonly employeeService = inject(EmployeeService);
  readonly authService = inject(AuthService);
  readonly modalService = inject(ModalService);
  readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    await this.employeeService.loadEmployees();
  }

  async refreshEmployees(): Promise<void> {
    await this.employeeService.loadEmployees();
  }

  async addEmployee(): Promise<void> {
    await this.router.navigate(['/admin/employee/new']);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}
