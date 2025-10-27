import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableButtonComponent, TimesheetComponent, type TimesheetData } from '../../../../shared/components';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-reports',
  standalone: true,
  imports: [CommonModule, TimesheetComponent, ReusableButtonComponent],
  template: `
  <div class="p-5 text-right">
  <app-reusable-button
                text="Back to Dashboard"
                variant="secondary"
                icon="arrow-left"
                (click)="goToDashboard()" />
  </div>
    <div class="">
        <app-timesheet
          title="My Attendance Records"
          subtitle="View your check-in and check-out times"
          [showSummary]="true"
          [autoLoad]="true"
          (dataLoaded)="onTimesheetDataLoaded($event)"
          (dataError)="onTimesheetError($event)"
          (monthYearChanged)="onMonthYearChanged($event)">
        </app-timesheet>
    </div>
  `
})
export class EmployeeReportsComponent {
  private readonly router = inject(Router);
  onTimesheetDataLoaded(data: TimesheetData): void {
    console.log('Timesheet data loaded:', data);
  }

  onTimesheetError(error: string): void {
    console.error('Timesheet error:', error);
  }

  onMonthYearChanged(event: {month: number, year: number}): void {
    console.log('Month/Year changed:', event);
  }
  goToDashboard(): void {
      this.router.navigate(['/dashboard']);
  }
  }