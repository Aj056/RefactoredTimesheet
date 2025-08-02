import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { adminGuard, employeeGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/employee/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, employeeGuard]
  },
  {
    path: 'employee/profile',
    loadComponent: () => import('./features/employee/components/employee-profile/employee-profile.component').then(m => m.EmployeeProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'employee/profile/edit',
    loadComponent: () => import('./features/employee/components/edit-employee-profile/edit-employee-profile.component').then(m => m.EditEmployeeProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/employee/new',
    loadComponent: () => import('./features/admin/create-employee/create-employee.component').then(m => m.CreateEmployeeComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/employee/view/:id',
    loadComponent: () => import('./features/admin/view-employee/view-employee.component').then(m => m.ViewEmployeeComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/employee/edit/:id',
    loadComponent: () => import('./features/admin/edit-employee/edit-employee.component').then(m => m.EditEmployeeComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
