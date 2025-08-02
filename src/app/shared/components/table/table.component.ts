import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  disabled?: (row: any) => boolean;
  visible?: (row: any) => boolean;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table class="min-w-full divide-y divide-gray-300">
        <!-- Header -->
        <thead class="bg-gray-50">
          <tr>
            @for (column of columns(); track column.key) {
              <th
                [style.width]="column.width"
                [class]="getHeaderClasses(column)"
                (click)="handleSort(column)">
                <div class="flex items-center space-x-1">
                  <span>{{ column.label }}</span>
                  @if (column.sortable) {
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      @if (sortColumn() === column.key) {
                        @if (sortDirection() === 'asc') {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                        } @else {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        }
                      } @else {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                      }
                    </svg>
                  }
                </div>
              </th>
            }
            @if (actions() && actions()!.length > 0) {
              <th class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span class="sr-only">Actions</span>
              </th>
            }
          </tr>
        </thead>
        
        <!-- Body -->
        <tbody class="divide-y divide-gray-200 bg-white">
          @if (loading()) {
            <tr>
              <td [attr.colspan]="getColspan()" class="px-6 py-12 text-center">
                <div class="flex justify-center">
                  <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </td>
            </tr>
          } @else if (data().length === 0) {
            <tr>
              <td [attr.colspan]="getColspan()" class="px-6 py-12 text-center text-gray-500">
                {{ emptyMessage() }}
              </td>
            </tr>
          } @else {
            @for (row of data(); track trackByFn($index, row)) {
              <tr [class]="getRowClasses(row, $index)" (click)="handleRowClick(row)">
                @for (column of columns(); track column.key) {
                  <td [class]="getCellClasses(column)">
                    {{ getCellValue(row, column.key) }}
                  </td>
                }
                @if (actions() && actions()!.length > 0) {
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div class="flex justify-end space-x-2">
                      @for (action of getVisibleActions(row); track action.label) {
                        <button
                          [disabled]="isActionDisabled(action, row)"
                          [class]="getActionClasses(action)"
                          (click)="handleAction(action, row, $event)">
                          @if (action.icon) {
                            <span [innerHTML]="action.icon" class="w-4 h-4"></span>
                          }
                          {{ action.label }}
                        </button>
                      }
                    </div>
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `
})
export class TableComponent {
  // Inputs
  readonly columns = input.required<TableColumn[]>();
  readonly data = input.required<any[]>();
  readonly actions = input<TableAction[]>([]);
  readonly loading = input<boolean>(false);
  readonly emptyMessage = input<string>('No data available');
  readonly sortColumn = input<string>('');
  readonly sortDirection = input<'asc' | 'desc'>('asc');
  readonly selectable = input<boolean>(false);
  readonly hoverable = input<boolean>(true);
  readonly striped = input<boolean>(false);
  
  // Outputs
  readonly sortChanged = output<{ column: string; direction: 'asc' | 'desc' }>();
  readonly rowClicked = output<any>();
  readonly actionClicked = output<{ action: TableAction; row: any }>();
  
  handleSort(column: TableColumn): void {
    if (!column.sortable) return;
    
    const newDirection = this.sortColumn() === column.key && this.sortDirection() === 'asc' ? 'desc' : 'asc';
    this.sortChanged.emit({ column: column.key, direction: newDirection });
  }
  
  handleRowClick(row: any): void {
    if (this.selectable()) {
      this.rowClicked.emit(row);
    }
  }
  
  handleAction(action: TableAction, row: any, event: Event): void {
    event.stopPropagation(); // Prevent row click
    if (!this.isActionDisabled(action, row)) {
      this.actionClicked.emit({ action, row });
    }
  }
  
  getColspan(): number {
    return this.columns().length + (this.actions()?.length ? 1 : 0);
  }
  
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
  
  getCellValue(row: any, key: string): any {
    return key.split('.').reduce((obj, prop) => obj?.[prop], row) || '';
  }
  
  getVisibleActions(row: any): TableAction[] {
    return this.actions()?.filter(action => 
      !action.visible || action.visible(row)
    ) || [];
  }
  
  isActionDisabled(action: TableAction, row: any): boolean {
    return action.disabled ? action.disabled(row) : false;
  }
  
  getHeaderClasses(column: TableColumn): string {
    const baseClasses = 'px-6 py-3 text-xs font-medium uppercase tracking-wider';
    const alignClass = column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left';
    const sortableClass = column.sortable ? 'cursor-pointer hover:bg-gray-100' : '';
    
    return [baseClasses, alignClass, sortableClass, 'text-gray-500'].join(' ');
  }
  
  getRowClasses(row: any, index: number): string {
    const hoverClass = this.hoverable() ? 'hover:bg-gray-50' : '';
    const selectableClass = this.selectable() ? 'cursor-pointer' : '';
    const stripedClass = this.striped() && index % 2 === 1 ? 'bg-gray-50' : '';
    
    return [hoverClass, selectableClass, stripedClass].filter(Boolean).join(' ');
  }
  
  getCellClasses(column: TableColumn): string {
    const baseClasses = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
    const alignClass = column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left';
    
    return [baseClasses, alignClass].join(' ');
  }
  
  getActionClasses(action: TableAction): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50';
    
    const variantClasses = {
      primary: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
      success: 'bg-success-600 hover:bg-success-700 focus:ring-success-500',
      warning: 'bg-warning-600 hover:bg-warning-700 focus:ring-warning-500',
      error: 'bg-error-600 hover:bg-error-700 focus:ring-error-500'
    };
    
    return [baseClasses, variantClasses[action.variant || 'primary']].join(' ');
  }
}
