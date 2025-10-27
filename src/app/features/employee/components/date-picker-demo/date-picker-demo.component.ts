import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePickerComponent, MonthYearPickerComponent, type MonthYearValue } from '../../../../shared/components';

@Component({
  selector: 'app-date-picker-demo',
  standalone: true,
  imports: [CommonModule, DatePickerComponent, MonthYearPickerComponent],
  template: `
    <div class="p-8 max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Date Picker Component Demo</h1>
      
      <!-- Basic Usage -->
      <div class="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Usage</h2>
        <app-date-picker
          inputId="basic-date"
          placeholder="Select a date"
          (dateSelected)="onDateSelected('Basic', $event)"
          (dateCleared)="onDateCleared('Basic')">
        </app-date-picker>
      </div>

      <!-- With Min/Max Dates -->
      <div class="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">With Min/Max Dates</h2>
        <app-date-picker
          inputId="restricted-date"
          placeholder="Select date (restricted)"
          [minDate]="minDate"
          [maxDate]="maxDate"
          (dateSelected)="onDateSelected('Restricted', $event)"
          (dateCleared)="onDateCleared('Restricted')">
        </app-date-picker>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Min: {{ minDate }} | Max: {{ maxDate }}
        </p>
      </div>

      <!-- Disabled State -->
      <div class="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Disabled State</h2>
        <app-date-picker
          inputId="disabled-date"
          placeholder="Disabled date picker"
          [disabled]="true"
          initialValue="2024-01-15">
        </app-date-picker>
      </div>

      <!-- Month-Year Picker Section -->
      <div class="mb-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Month-Year Picker</h2>
        
        <!-- Basic Month-Year Picker -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Basic Usage</h3>
          <app-month-year-picker
            inputId="basic-month-year"
            placeholder="Select month and year"
            (monthYearSelected)="onMonthYearSelected('Basic', $event)"
            (monthYearCleared)="onMonthYearCleared('Basic')">
          </app-month-year-picker>
        </div>

        <!-- Month-Year with Restrictions -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">With Restrictions</h3>
          <app-month-year-picker
            inputId="restricted-month-year"
            placeholder="Select month & year (restricted)"
            [minMonthYear]="minMonthYear"
            [maxMonthYear]="maxMonthYear"
            (monthYearSelected)="onMonthYearSelected('Restricted', $event)"
            (monthYearCleared)="onMonthYearCleared('Restricted')">
          </app-month-year-picker>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Min: {{ minMonthYear }} | Max: {{ maxMonthYear }}
          </p>
        </div>
      </div>

      <!-- Console Log Display -->
      @if (consoleLogs.length > 0) {
        <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
          <h3 class="text-white mb-2">Console Output:</h3>
          @for (log of consoleLogs; track log.id) {
            <div class="mb-1">{{ log.timestamp }}: {{ log.message }}</div>
          }
        </div>
      }
    </div>
  `
})
export class DatePickerDemoComponent {
  // Set min date to 30 days ago and max date to 30 days from now
  minDate: string;
  maxDate: string;
  
  // Month-Year restrictions
  minMonthYear: string;
  maxMonthYear: string;
  
  consoleLogs: Array<{id: number, timestamp: string, message: string}> = [];
  private logId = 0;

  constructor() {
    const today = new Date();
    
    // Min date: 30 days ago
    const minDate = new Date(today);
    minDate.setDate(today.getDate() - 30);
    this.minDate = minDate.toISOString().split('T')[0];
    
    // Max date: 30 days from now
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30);
    this.maxDate = maxDate.toISOString().split('T')[0];

    // Month-Year restrictions: From 6 months ago to 6 months ahead
    const minMonthYearDate = new Date(today);
    minMonthYearDate.setMonth(today.getMonth() - 6);
    this.minMonthYear = `${minMonthYearDate.getFullYear()}-${(minMonthYearDate.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const maxMonthYearDate = new Date(today);
    maxMonthYearDate.setMonth(today.getMonth() + 6);
    this.maxMonthYear = `${maxMonthYearDate.getFullYear()}-${(maxMonthYearDate.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  onDateSelected(context: string, date: string): void {
    const message = `${context} date selected: ${date}`;
    console.log(message);
    this.addToConsoleLog(message);
  }

  onDateCleared(context: string): void {
    const message = `${context} date cleared`;
    console.log(message);
    this.addToConsoleLog(message);
  }

  onMonthYearSelected(context: string, monthYear: MonthYearValue): void {
    const message = `${context} month-year selected: ${monthYear.displayValue} (${monthYear.month}/${monthYear.year})`;
    console.log(message);
    this.addToConsoleLog(message);
  }

  onMonthYearCleared(context: string): void {
    const message = `${context} month-year cleared`;
    console.log(message);
    this.addToConsoleLog(message);
  }

  private addToConsoleLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.consoleLogs.unshift({
      id: this.logId++,
      timestamp,
      message
    });
    
    // Keep only last 10 logs
    if (this.consoleLogs.length > 10) {
      this.consoleLogs = this.consoleLogs.slice(0, 10);
    }
  }
}