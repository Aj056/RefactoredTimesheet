import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
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
        type="date"
        [(ngModel)]="selectedDate"
        (ngModelChange)="onDateChange($event)"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [min]="minDate"
        [max]="maxDate"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors"
      />
    </div>
  `
})
export class DatePickerComponent {
  @Input() inputId: string = 'date-picker';
  @Input() placeholder: string = 'Select date';
  @Input() disabled: boolean = false;
  @Input() minDate?: string;
  @Input() maxDate?: string;
  @Input() initialValue?: string;
  
  @Output() dateSelected = new EventEmitter<string>();
  @Output() dateCleared = new EventEmitter<void>();

  selectedDate: string = '';

  ngOnInit() {
    if (this.initialValue) {
      this.selectedDate = this.initialValue;
    }
  }

  onDateChange(value: string): void {
    if (value) {
      console.log('Date selected:', value);
      this.dateSelected.emit(value);
    } else {
      console.log('Date cleared');
      this.dateCleared.emit();
    }
  }

  // Method to programmatically set the date
  setDate(date: string): void {
    this.selectedDate = date;
    console.log('Date set programmatically:', date);
    this.dateSelected.emit(date);
  }

  // Method to clear the date
  clearDate(): void {
    this.selectedDate = '';
    console.log('Date cleared programmatically');
    this.dateCleared.emit();
  }

  // Method to get current selected date
  getCurrentDate(): string {
    return this.selectedDate;
  }
}