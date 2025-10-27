// Reusable Components Index - SINGLE SOURCE OF TRUTH
// Use this file to import components and avoid duplication

// UI Components (CONSOLIDATED - NO DUPLICATES)
export { ReusableButtonComponent } from './reusable-button/reusable-button.component';
export { InputComponent, type InputType } from './input/input.component';
export { LoadingComponent } from './loading/loading.component';
export { ToastComponent } from './toast/toast.component';
export { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
export { NavigationDropdownComponent } from './navigation-dropdown/navigation-dropdown.component';
export { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';

// Layout Components  
export { CardComponent } from './card/card.component';
export { PageHeaderComponent, type PageHeaderAction } from './page-header/page-header.component';
export { TableComponent, type TableColumn, type TableAction } from './table/table.component';

// Form Components
export { EmployeeFormComponent, type EmployeeFormData } from './employee-form/employee-form.component';
export { DatePickerComponent } from './date-picker/date-picker.component';
export { MonthYearPickerComponent, type MonthYearValue } from './month-year-picker/month-year-picker.component';

// Data Components
export { TimesheetComponent, type TimesheetRecord, type TimesheetSummary, type TimesheetData } from './timesheet/timesheet.component';


// Modal Components
export { DeleteConfirmationComponent, type DeleteConfirmationData } from './delete-confirmation/delete-confirmation.component';

// Services
export { ToastService } from '../services/toast.service';
export { ThemeService } from '../services/theme.service';

// Import all components for easy bulk import
import { ReusableButtonComponent } from './reusable-button/reusable-button.component';
import { InputComponent } from './input/input.component';
import { LoadingComponent } from './loading/loading.component';
import { CardComponent } from './card/card.component';
import { PageHeaderComponent } from './page-header/page-header.component';
import { TableComponent } from './table/table.component';
import { ToastComponent } from './toast/toast.component';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { MonthYearPickerComponent } from './month-year-picker/month-year-picker.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { DeleteConfirmationComponent } from './delete-confirmation/delete-confirmation.component';


// All reusable components array (NO DUPLICATES)
export const SHARED_COMPONENTS = [
  ReusableButtonComponent,
  InputComponent,
  LoadingComponent,
  CardComponent,
  PageHeaderComponent,
  TableComponent,
  ToastComponent,
  ThemeToggleComponent,
  EmployeeFormComponent,
  DatePickerComponent,
  MonthYearPickerComponent,
  TimesheetComponent,
  DeleteConfirmationComponent,
] as const;

// USAGE GUIDELINES:
/*
🔄 REUSABILITY RULES:
1. ALWAYS import from this index file
2. NEVER create duplicate components
3. USE existing components before creating new ones

📋 COMPONENT SELECTION GUIDE:

BUTTONS:
✅ Use ReusableButtonComponent (recommended) - Advanced features, loading states
✅ Use ButtonComponent - Basic buttons only

FORMS:
✅ Use EmployeeFormComponent - For all employee forms (create/edit)
✅ Use InputComponent - For individual form fields

LAYOUT:
✅ Use PageHeaderComponent - For page headers with actions
✅ Use CardComponent - For content cards
✅ Use TableComponent - For data tables

FEEDBACK:
✅ Use LoadingComponent - For loading states
✅ Use ToastService.show() - For notifications
✅ Use DeleteConfirmationComponent - For confirmations

EXAMPLE USAGE:
```typescript
import { 
  ReusableButtonComponent, 
  LoadingComponent, 
  ToastService,
  EmployeeFormComponent 
} from '../../shared/components';

// In template:
<app-loading message="Processing..." />
<app-reusable-button text="Save" variant="primary" (click)="save()" />
<app-employee-form mode="create" (formSubmit)="onCreate($event)" />
```
*/
