import { Component, input, output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full">
      @if (label()) {
        <label [for]="inputId" class="block text-sm font-medium text-gray-700 mb-1">
          {{ label() }}
          @if (required()) {
            <span class="text-error-500 ml-1">*</span>
          }
        </label>
      }
      
      <div class="relative">
        @if (prefixIcon()) {
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span [innerHTML]="prefixIcon()" class="text-gray-400"></span>
          </div>
        }
        
        <input
          [id]="inputId"
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [value]="value"
          [class]="inputClasses()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()" />
        
        @if (suffixIcon()) {
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span [innerHTML]="suffixIcon()" class="text-gray-400"></span>
          </div>
        }
        
        @if (type() === 'password' && showPasswordToggle()) {
          <button
            type="button"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
            (click)="togglePasswordVisibility()">
            @if (passwordVisible) {
              <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            } @else {
              <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            }
          </button>
        }
      </div>
      
      @if (error() && touched) {
        <p class="mt-1 text-sm text-error-600">{{ error() }}</p>
      }
      
      @if (hint() && !error()) {
        <p class="mt-1 text-sm text-gray-500">{{ hint() }}</p>
      }
    </div>
  `
})
export class InputComponent implements ControlValueAccessor {
  // Inputs
  readonly label = input<string>('');
  readonly type = input<InputType>('text');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly error = input<string>('');
  readonly hint = input<string>('');
  readonly prefixIcon = input<string>('');
  readonly suffixIcon = input<string>('');
  readonly showPasswordToggle = input<boolean>(true);
  
  // Outputs
  readonly valueChange = output<string>();
  readonly focused = output<void>();
  readonly blurred = output<void>();
  
  // State
  value = '';
  touched = false;
  passwordVisible = false;
  
  // Generate unique ID for accessibility
  readonly inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // ControlValueAccessor implementation
  private onChange = (value: string) => {};
  private onTouched = () => {};
  
  writeValue(value: string): void {
    this.value = value || '';
  }
  
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    // Handled by input binding
  }
  
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }
  
  onBlur(): void {
    this.touched = true;
    this.onTouched();
    this.blurred.emit();
  }
  
  onFocus(): void {
    this.focused.emit();
  }
  
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
  
  inputClasses(): string {
    const baseClasses = 'block w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const stateClasses = this.error() && this.touched
      ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500';
    
    const paddingClasses = this.getPaddingClasses();
    const disabledClasses = this.disabled() ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white';
    
    return [baseClasses, stateClasses, paddingClasses, disabledClasses].join(' ');
  }
  
  private getPaddingClasses(): string {
    const hasPrefix = !!this.prefixIcon();
    const hasSuffix = !!this.suffixIcon() || (this.type() === 'password' && this.showPasswordToggle());
    
    if (hasPrefix && hasSuffix) return 'pl-10 pr-10';
    if (hasPrefix) return 'pl-10';
    if (hasSuffix) return 'pr-10';
    return '';
  }
}
