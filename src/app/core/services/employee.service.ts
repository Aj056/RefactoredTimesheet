import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastService } from '../../shared/services/toast.service';

export interface TimeLog {
  readonly _id: string;
  readonly date: string;
  readonly checkin: string;
  readonly checkout: string;
  readonly totalhours: string;
  readonly autocheckout: boolean;
}

export interface Employee {
  readonly _id: string;
  readonly employeeName: string;
  readonly employeeEmail: string;
  readonly workLocation: string;
  readonly department: string;
  readonly role: 'admin' | 'employee';
  readonly designation: string;
  readonly joinDate: string;
  readonly bankAccount: string;
  readonly uanNumber: string;
  readonly esiNumber: string;
  readonly panNumber: string;
  readonly resourceType: string;
  readonly username: string;
  readonly password: string;
  readonly address: string;
  readonly phone: string;
  readonly status: boolean;
  readonly timelog: TimeLog[];
  readonly __v: number;
}

export interface ApiResponse<T> {
  readonly data: T;
  readonly message?: string;
  readonly error?: string;
}

export interface CreateEmployeeRequest {
  readonly employeeName: string;
  readonly employeeEmail: string;
  readonly username: string;
  readonly password: string;
  readonly address: string;
  readonly bankAccount: string;
  readonly department: string;
  readonly designation: string;
  readonly esiNumber: string;
  readonly joinDate: string;
  readonly panNumber: string;
  readonly phone: string;
  readonly resourceType: string;
  readonly role: 'admin' | 'employee';
  readonly uanNumber: string;
  readonly workLocation: string;
}

export interface UpdateEmployeeRequest {
  readonly name: string;
  readonly email: string;
  readonly joinDate: string;
  readonly role: 'admin' | 'employee';
  readonly username: string;
  readonly address: string;
  readonly bankAccount: string;
  readonly department: string;
  readonly position: string; // designation
  readonly esiNumber: string;
  readonly panNumber: string;
  readonly phone: string;
  readonly resourceType: string;
  readonly uanNumber: string;
  readonly workLocation: string;
  readonly password: string;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly API_BASE = 'https://attendance-three-lemon.vercel.app';
  
  // Private signals for internal state
  private readonly _employees = signal<Employee[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  
  // Public readonly signals
  readonly employees = this._employees.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  
  // Computed statistics
  readonly totalEmployees = computed(() => this.employees().length);
  readonly activeEmployees = computed(() => 
    this.employees().filter(emp => emp.status).length
  );
  readonly inactiveEmployees = computed(() => 
    this.employees().filter(emp => !emp.status).length
  );
  
  async loadEmployees(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    
    try {
      console.log('Loading employees from:', `${this.API_BASE}/allemp`);
      
      const response = await firstValueFrom(
        this.http.get<any>(`${this.API_BASE}/allemp`).pipe(
          map(data => {
            // Filter out admin users, only show employees
            if (data && data.data) {
              data.data = data.data.filter((emp: Employee) => emp.role === 'employee');
              return data;
            } else if (Array.isArray(data)) {
              return data.filter((emp: Employee) => emp.role === 'employee');
            }
            return data;
          })
        )
      );
      
      console.log('Employees response (filtered):', response);
      
      if (response && response.data) {
        console.log('Setting employees from response.data:', response.data.length);
        this._employees.set(response.data);
      } else if (response && Array.isArray(response)) {
        console.log('Setting employees from direct array:', response.length);
        this._employees.set(response as Employee[]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to load employees:', error);
      const errorMessage = error?.error?.message || error?.message || 'Failed to load employees. Please try again.';
      this._error.set(errorMessage);
      this.toastService.error('Failed to load employee data');
    } finally {
      this._isLoading.set(false);
    }
  }
  
  async getEmployee(id: string): Promise<Employee | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<Employee>(`${this.API_BASE}/view/${id}`)
      );
      
      return response || null;
    } catch (error) {
      console.error('Failed to get employee:', error);
      this._error.set('Failed to load employee details. Please try again.');
      this.toastService.error('Failed to load employee details');
      return null;
    }
  }
  
  async createEmployee(employeeData: CreateEmployeeRequest): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);
    
    try {
      const response = await firstValueFrom(
        this.http.post<any>(`${this.API_BASE}/register`, employeeData)
      );
      
      if (response) {
        // Reload employees to get updated list
        await this.loadEmployees();
        this.toastService.show(`${response.msg}`);
        return true;
      }
      
      this.toastService.show('Failed to create employee', 'error');
      return false;
    } catch (error) {
      console.error('Failed to create employee:', error);
      const errorMessage = 'Failed to create employee. Please try again.';
      this._error.set(errorMessage);
      this.toastService.show(errorMessage, 'error');
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }
  
  async updateEmployee(id: string, employeeData: UpdateEmployeeRequest): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);
    
    try {
      const response = await firstValueFrom(
        this.http.put<any>(`${this.API_BASE}/update/${id}`, employeeData)
      );
      
      if (response) {
        // Reload employees to get updated list
        await this.loadEmployees();
        this.toastService.show('Employee updated successfully!', 'success');
        return true;
      }
      
      this.toastService.show('Failed to update employee', 'error');
      return false;
    } catch (error) {
      console.error('Failed to update employee:', error);
      const errorMessage = 'Failed to update employee. Please try again.';
      this._error.set(errorMessage);
      this.toastService.show(errorMessage, 'error');
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }
  
  async deleteEmployee(id: string): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);
    
    try {
      const response = await firstValueFrom(
        this.http.delete<any>(`${this.API_BASE}/delete/${id}`)
      );
      
      if (response) {
        // Reload employees to get updated list
        await this.loadEmployees();
        this.toastService.show('Employee deleted successfully!', 'success');
        return true;
      }
      
      this.toastService.show('Failed to delete employee', 'error');
      return false;
    } catch (error) {
      console.error('Failed to delete employee:', error);
      const errorMessage = 'Failed to delete employee. Please try again.';
      this._error.set(errorMessage);
      this.toastService.show(errorMessage, 'error');
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }
  
  async getEmployeeTimesheet(id: string, month: number, year: number): Promise<any> {
    try {
      const payload = {
        id: id,
        month: month, // Ensure this is a number, not string
        year: year
      };

      console.log('Fetching timesheet data with payload:', payload);
      console.log('Payload types:', { 
        id: typeof payload.id, 
        month: typeof payload.month, 
        year: typeof payload.year 
      });

      const response = await firstValueFrom(
        this.http.post<any>(`${this.API_BASE}/filterby`, payload)
      );
      
      console.log('Timesheet API Response:', response);
      return response;
    } catch (error) {
      console.error('Failed to get employee timesheet:', error);
      this._error.set('Failed to load timesheet data. Please try again.');
      this.toastService.error('Failed to load timesheet data');
      return null;
    }
  }
  
  clearError(): void {
    this._error.set(null);
  }
}
