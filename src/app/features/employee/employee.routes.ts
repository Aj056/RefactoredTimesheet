import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { employeeGuard } from '../../core/guards/role.guard';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard, employeeGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/employee-profile/employee-profile.component')
      .then(m => m.EmployeeProfileComponent),
    canActivate: [authGuard, employeeGuard]
  },
  {
    path: 'profile/edit',
    loadComponent: () => import('./components/edit-employee-profile/edit-employee-profile.component')
      .then(m => m.EditEmployeeProfileComponent),
    canActivate: [authGuard, employeeGuard]
  },
  {
    path:'view-reports',
    loadComponent: () => import('./components/employee-reports/employee-reports.component')
      .then(m => m.EmployeeReportsComponent),
    canActivate: [authGuard, employeeGuard]
  },
  {
    path:'view-payslip',
    loadComponent: () => import('./components/employee-payslip/employee-payslip.component')
      .then(m => m.EmployeePayslipComponent),
    canActivate: [authGuard, employeeGuard]
  }
];
