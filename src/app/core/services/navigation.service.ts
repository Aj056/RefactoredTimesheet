import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ModalService } from '../../shared/services/modal.service';
import { ToastService } from '../../shared/services/toast.service';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);
  private readonly toastService = inject(ToastService);

  /**
   * Handle logout with confirmation and proper cleanup
   */
  async logout(): Promise<void> {
    this.modalService.confirmLogout(async () => {
      try {
        await this.authService.logout();
        this.toastService.success('Logged out successfully');
      } catch (error) {
        console.error('Logout error:', error);
        // Force logout even if API call fails
        this.authService.forceLogout();
      }
    });
  }

  /**
   * Navigate to employee management
   */
  navigateToEmployeeList(): void {
    this.router.navigate(['/admin']);
  }

  /**
   * Navigate to add new employee
   */
  navigateToAddEmployee(): void {
    this.router.navigate(['/admin/employee/new']);
  }

  /**
   * Navigate to view employee
   */
  navigateToViewEmployee(employeeId: string): void {
    this.router.navigate(['/admin/employee/view', employeeId]);
  }

  /**
   * Navigate to edit employee
   */
  navigateToEditEmployee(employeeId: string): void {
    this.router.navigate(['/admin/employee/edit', employeeId]);
  }

  /**
   * Navigate back to previous page or default location
   */
  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to appropriate dashboard
      const user = this.authService.getCurrentUser();
      const defaultRoute = user?.role === 'admin' ? '/admin' : '/dashboard';
      this.router.navigate([defaultRoute]);
    }
  }

  /**
   * Navigate to appropriate dashboard based on user role
   */
  navigateToDashboard(): void {
    const user = this.authService.getCurrentUser();
    const route = user?.role === 'admin' ? '/admin' : '/dashboard';
    this.router.navigate([route]);
  }

  /**
   * Check if current route is active
   */
  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }

  /**
   * Refresh current page data (placeholder for future implementation)
   */
  refreshData(): void {
    this.toastService.info('Refreshing data...');
    // Could emit an event that components subscribe to for data refresh
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
}
