import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface MonthYearValue {
  month: number;
  year: number;
  monthName: string;
  displayValue: string;
}

@Component({
  selector: 'app-month-year-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative max-w-sm">
      <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
        <svg
          class="w-4 h-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"
          />
        </svg>
      </div>
      <input
        [id]="inputId"
        type="month"
        [(ngModel)]="selectedMonthYear"
        (ngModelChange)="onMonthYearChange($event)"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [min]="minMonthYear"
        [max]="maxMonthYear"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors"
      />
    </div>
  `
})
export class MonthYearPickerComponent {
  @Input() inputId: string = 'month-year-picker';
  @Input() placeholder: string = 'Select month and year';
  @Input() disabled: boolean = false;
  @Input() minMonthYear?: string; // Format: "2020-01"
  @Input() maxMonthYear?: string; // Format: "2030-12"
  @Input() initialValue?: string; // Format: "2024-10"
  
  @Output() monthYearSelected = new EventEmitter<MonthYearValue>();
  @Output() monthYearCleared = new EventEmitter<void>();

  selectedMonthYear: string = '';

  private readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  ngOnInit() {
    if (this.initialValue) {
      this.selectedMonthYear = this.initialValue;
      this.emitMonthYearValue(this.initialValue);
    }
  }

  onMonthYearChange(value: string): void {
    if (value) {
      console.log('Month-Year selected:', value);
      this.emitMonthYearValue(value);
    } else {
      console.log('Month-Year cleared');
      this.monthYearCleared.emit();
    }
  }

  private emitMonthYearValue(value: string): void {
    if (!value) return;

    const [yearStr, monthStr] = value.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const monthName = this.monthNames[month - 1];
    const displayValue = `${monthName} ${year}`;

    const monthYearValue: MonthYearValue = {
      month,
      year,
      monthName,
      displayValue
    };

    console.log('Emitting month-year value:', monthYearValue);
    this.monthYearSelected.emit(monthYearValue);
  }

  // Method to programmatically set the month-year
  setMonthYear(year: number, month: number): void {
    const value = `${year}-${month.toString().padStart(2, '0')}`;
    this.selectedMonthYear = value;
    console.log('Month-Year set programmatically:', value);
    this.emitMonthYearValue(value);
  }

  // Method to set by string value (e.g., "2024-10")
  setMonthYearString(value: string): void {
    this.selectedMonthYear = value;
    console.log('Month-Year set by string:', value);
    this.emitMonthYearValue(value);
  }

  // Method to clear the selection
  clearMonthYear(): void {
    this.selectedMonthYear = '';
    console.log('Month-Year cleared programmatically');
    this.monthYearCleared.emit();
  }

  // Method to get current selected month-year as object
  getCurrentMonthYear(): MonthYearValue | null {
    if (!this.selectedMonthYear) return null;

    const [yearStr, monthStr] = this.selectedMonthYear.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const monthName = this.monthNames[month - 1];
    const displayValue = `${monthName} ${year}`;

    return {
      month,
      year,
      monthName,
      displayValue
    };
  }

  // Method to get current selected month-year as string
  getCurrentMonthYearString(): string {
    return this.selectedMonthYear;
  }
}