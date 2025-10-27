import { Component, inject, signal } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MonthYearPickerComponent, type MonthYearValue } from '../../../../shared/components/month-year-picker/month-year-picker.component';
import { AuthService } from '../../../../core/services/auth.service';
import { APP_CONFIG } from '../../../../core/config/app.config';
import { ToastService } from '../../../../shared/services/toast.service';
import { ReusableButtonComponent } from "../../../../shared/components";
import { Router } from "@angular/router";
@Component({
  selector: "app-employee-payslip",
  standalone: true,
  imports: [CommonModule, FormsModule, MonthYearPickerComponent, ReusableButtonComponent],
  styleUrls: ['./employee-payslip.component.scss'],
  template: `
    <div class="p-6">
      <!-- Header Section -->
      <section class="bg-gray-400 mt-5 relative p-5">
        <h1 class="text-center text-gray-800">Generate & Download Employee Payslip</h1>
        <div class="absolute top-5 right-5">
  <app-reusable-button
                text="Back to Dashboard"
                variant="secondary"
                icon="arrow-left"
                (click)="goToDashboard()" />
          @if (payslipData() && !apiError()) {
            <button 
              type="button" 
              (click)="onDownload()" 
              [disabled]="isDownloading()"
              class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded ml-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isDownloading() ? 'Downloading...' : 'Download PDF' }}
            </button>
          }
  </div>
      </section>

      <div class="space-y-6">
        <!-- Month-Year Selection Section -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select the Month & Year
              </label>
              <app-month-year-picker
                inputId="from-month-year-picker"
                placeholder="Select start month & year"
                (monthYearSelected)="onFromMonthYearSelected($event)"
                (monthYearCleared)="onFromMonthYearCleared()">
              </app-month-year-picker>
            </div>
          </div>

          <!-- Generate Button -->
          <div class="mt-6">
            <button
              (click)="generatePayslip()"
              [disabled]="!fromMonthYear || isLoading()"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors">
              @if (isLoading()) {
                <span class="inline-flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              } @else {
                Generate Payslip
              }
            </button>
          </div>
        </div>

        <!-- API Error Display -->
        @if (apiError()) {
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div class="flex items-center mb-4">
              <svg class="h-6 w-6 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 class="text-lg font-semibold text-red-800 dark:text-red-200">Unable to Load Payslip</h3>
            </div>
            <p class="text-red-700 dark:text-red-300 mb-4">{{ apiError() }}</p>
            <div class="bg-white dark:bg-gray-800 p-4 rounded border">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Possible reasons:</strong>
              </p>
              <ul class="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                <li>No payslip data found for the selected month and year</li>
                <li>Network connection issues</li>
                <li>Server temporarily unavailable</li>
                <li>Invalid employee credentials</li>
              </ul>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-3">
                Please try selecting a different month/year or contact your administrator if the problem persists.
              </p>
            </div>
          </div>
        }

        <!-- Payslip Form Display -->
        @if (payslipData() && !apiError()) {
          <section id="payslip-form" class="bg-gray-100">
            <div class="payslip bg-white p-8 shadow-lg">
              <!-- Company Header with Logo -->
              <div class="text-center mb-6">
                <div class="company-logo mb-4">
                  <img 
                    [src]="logoDataUrl" 
                    alt="WillwareTech Logo" 
                    class="mx-auto max-w-xs h-auto"
                  />
                </div>
                <h2 class="company-name text-2xl font-bold text-gray-800 mb-2">WILLWARE TECHNOLOGIES PVT LTD</h2>
                <p class="company-address text-gray-600">No.105, 7th Block, Koramangala, Bangalore-560095</p>
              </div>
              
              <!-- Payslip Title -->
              <h3 class="title text-xl font-semibold text-center mb-6">
                Payslip for {{ payslipData().month | titlecase }} - {{ payslipData().year }}
              </h3>

              <!-- Employee Details Table -->
              <table class="details-table w-full mb-6 border-collapse">
                <tbody>
                  <tr class="border-b">
                    <td class="py-2 px-4 font-medium text-gray-700">Employee Name :</td>
                    <td class="py-2 px-4 text-gray-900">{{ payslipData().employeeName }}</td>
                    <td class="py-2 px-4 font-medium text-gray-700">Work Location :</td>
                    <td class="py-2 px-4 text-gray-900">{{ payslipData().workLocation }}</td>
                  </tr>
                  <tr class="border-b">
                    <td class="py-2 px-4 font-medium text-gray-700">Employee ID :</td>
                    <td class="py-2 px-4 text-gray-900">{{ payslipData().employeeId }}</td>
                    <td class="py-2 px-4 font-medium text-gray-700">LOP Days :</td>
                    <td class="py-2 px-4 text-gray-900">{{ payslipData().lopDays }}</td>
                  </tr>
                  <tr class="border-b">
                    <td class="py-2 px-4 font-medium text-gray-700">Designation :</td>
                    <td class="py-2 px-4 text-gray-900">{{ payslipData().designation }}</td>
                    <td class="py-2 px-4 font-medium text-gray-700">Worked Days / Paid Days :</td>
                    <td class="py-2 px-4 text-gray-900">{{ payslipData().workedDays }}</td>
                  </tr>
                  <tr class="border-b">
                    <td class="py-2 px-4 font-medium text-gray-700">Department :</td>
                    <td class="py-2 px-4 text-gray-900">{{ payslipData().department }}</td>
                    <td class="py-2 px-4 font-medium text-gray-700">Bank A/c No :</td>
                    <td class="py-2 px-4 text-gray-900">{{ payslipData().bankAccount }}</td>
                  </tr>
                  <tr class="border-b">
                    <td class="py-2 px-4 font-medium text-gray-700">Date of Joining :</td>
                    <td class="py-2 px-4 text-gray-900">{{ payslipData().joiningDate }}</td>
                    <td class="py-2 px-4 font-medium text-gray-700">UAN No :</td>
                    <td class="py-2 px-4 text-gray-900">{{ payslipData().uan }}</td>
                  </tr>
                  <tr class="border-b">
                    <td class="py-2 px-4 font-medium text-gray-700">ESI Number :</td>
                    <td class="py-2 px-4 text-gray-900">{{ payslipData().esiNumber }}</td>
                    <td class="py-2 px-4 font-medium text-gray-700">PAN :</td>
                    <td class="py-2 px-4 text-gray-900">{{ payslipData().pan }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Salary & Deductions Table -->
              <table class="salary-table w-full mb-6">
                <thead>
                  <tr class="bg-gray-200">
                    <th class="py-3 px-4 text-left font-semibold">Salary Payable</th>
                    <th class="py-3 px-4 text-right font-semibold">Amount</th>
                    <th class="py-3 px-4 text-left font-semibold">Deductions</th>
                    <th class="py-3 px-4 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b">
                    <td class="py-2 px-4">Basic Pay</td>
                    <td class="py-2 px-4 text-right">₹{{ payslipData().basicPay | number }}</td>
                    <td class="py-2 px-4">PF</td>
                    <td class="py-2 px-4 text-right">₹{{ payslipData().pf | number }}</td>
                  </tr>
                  <tr class="border-b">
                    <td class="py-2 px-4">HRA</td>
                    <td class="py-2 px-4 text-right">₹{{ payslipData().hra | number }}</td>
                    <td class="py-2 px-4">ESI</td>
                    <td class="py-2 px-4 text-right">₹{{ payslipData().esi | number }}</td>
                  </tr>
                  <tr class="border-b">
                    <td class="py-2 px-4">Others</td>
                    <td class="py-2 px-4 text-right">₹{{ payslipData().others | number }}</td>
                    <td class="py-2 px-4">TDS</td>
                    <td class="py-2 px-4 text-right">₹{{ payslipData().tds | number }}</td>
                  </tr>
                  <tr class="border-b">
                    <td class="py-2 px-4">Incentive</td>
                    <td class="py-2 px-4 text-right">₹{{ payslipData().incentive | number }}</td>
                    <td class="py-2 px-4">Staff Advance</td>
                    <td class="py-2 px-4 text-right">₹{{ payslipData().staffAdvance | number }}</td>
                  </tr>
                  <tr class="total-row bg-gray-100 font-semibold">
                    <td class="py-3 px-4">Total Earnings</td>
                    <td class="py-3 px-4 text-right">₹{{ payslipData().totalEarnings | number }}</td>
                    <td class="py-3 px-4">Total Deductions</td>
                    <td class="py-3 px-4 text-right">₹{{ payslipData().totalDeductions | number }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Footer Section -->
              <div class="footer-section">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <p class="text-lg font-semibold">
                    <strong>Net Pay :</strong> ₹{{ payslipData().netPay | number }}
                  </p>
                  <p class="text-lg font-semibold">
                    <strong>Mode of Payment :</strong> {{ payslipData().paymentMode }}
                  </p>
                </div>
                <p class="mb-4">
                  <strong>Amount in words :</strong> {{ payslipData().amountWords }}
                </p>
                <br>
                <p class="note text-sm text-gray-600 border border-gray-300 p-2 rounded">
                  Note: "This payslip is computer generated; hence no signature is required."
                </p>
              </div>
            </div>
          </section>
        }
      </div>
    </div>
  `,
})
export class EmployeePayslipComponent {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  // API Configuration
  private readonly API_BASE_URL = APP_CONFIG.API.BASE_URL;
  
  // Month names mapping
  private readonly MONTH_NAMES = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  // Component state
  fromMonthYear: MonthYearValue | null = null;
  readonly isLoading = signal(false);
  readonly isDownloading = signal(false);
  readonly payslipData = signal<any>(null);
  readonly apiError = signal<string | null>(null);

  // Base64 encoded logo for reliable display and PDF inclusion
  readonly logoDataUrl = 'data:image/png;base64,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';


  onFromMonthYearSelected(monthYear: MonthYearValue): void {
    this.fromMonthYear = monthYear;
    console.log('From month-year selected:', monthYear);
  }

  onFromMonthYearCleared(): void {
    this.fromMonthYear = null;
    console.log('From month-year cleared');
  }

  goToDashboard(): void {
      this.router.navigate(['/dashboard']);
  }

  /**
   * Convert month number to month name
   */
  private getMonthName(monthNumber: number): string {
    return this.MONTH_NAMES[monthNumber - 1] || 'january';
  }

  async generatePayslip(): Promise<void> {
    if (!this.fromMonthYear) {
      this.toastService.warning('Please select month and year');
      return;
    }

    // Get current user ID
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.toastService.error('Please log in again');
      return;
    }

    this.isLoading.set(true);
    this.apiError.set(null); // Clear any previous errors
    this.payslipData.set(null); // Clear any previous data

    try {
      const monthNumber = this.fromMonthYear.month;
      const monthName = this.getMonthName(monthNumber);
      const year = this.fromMonthYear.year;
      
      console.log('Generating payslip for:', {
        employeeId: currentUser.id,
        monthNumber: monthNumber,
        monthName: monthName,
        year: year,
        period: this.fromMonthYear.displayValue
      });

      // API call using month name instead of number
      const apiUrl = `${this.API_BASE_URL}/getPaySlip/${currentUser.id}?month=${monthName}&year=${year}`;
      
      console.log('Making API call to:', apiUrl);

      const response = await firstValueFrom(
        this.http.get<any>(apiUrl)
      );

      console.log('Payslip API Response:', response);
      
      // Check if response has success and data structure
      if (response && response.success && response.data) {
        this.payslipData.set(response.data);
        this.toastService.success(response.message || 'Payslip data loaded successfully!');
        
        // Log the payslip details
        console.log('Payslip Details:', {
          month: response.data.month,
          year: response.data.year,
          employeeName: response.data.employeeName,
          totalEarnings: response.data.totalEarnings,
          totalDeductions: response.data.totalDeductions,
          netPay: response.data.netPay,
          amountWords: response.data.amountWords
        });
      } else {
        // Handle case where response doesn't have expected structure
        this.payslipData.set(response);
        this.toastService.success('Payslip data loaded successfully!');
      }
      
    } catch (error) {
      console.error('Failed to fetch payslip:', error);
      this.apiError.set('Failed to generate payslip. Please try again.');
      this.toastService.error('Failed to generate payslip. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onDownload(): Promise<void> {
    if (!this.payslipData()) {
      this.toastService.warning('No payslip data available for download');
      return;
    }

    const element = document.getElementById('payslip-form');
    if (!element) {
      console.error('Payslip form element not found');
      this.toastService.error('Unable to locate payslip for download');
      return;
    }

    this.isDownloading.set(true);

    try {
      // Import jsPDF and html2canvas dynamically
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      // Ensure all images are loaded before capturing
      const images = element.querySelectorAll('img');
      const imageLoadPromises = Array.from(images).map((img: HTMLImageElement) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          // Add timeout in case image doesn't load
          setTimeout(resolve, 3000);
        });
      });

      await Promise.all(imageLoadPromises);

      // Ensure clean white background and remove any potential watermarks
      const originalStyle = element.style.cssText;
      element.style.background = 'white';
      element.style.backgroundColor = 'white';
      element.style.backgroundImage = 'none';
      
      // Remove any watermark classes or styles
      element.classList.add('pdf-generation');

      // Configure html2canvas options for completely clean output with white background
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        logging: false
      });

      // Create a new canvas with white background to ensure white background
      const whiteCanvas = document.createElement('canvas');
      whiteCanvas.width = canvas.width;
      whiteCanvas.height = canvas.height;
      const whiteCtx = whiteCanvas.getContext('2d');
      
      // Fill with white background
      if (whiteCtx) {
        whiteCtx.fillStyle = '#ffffff';
        whiteCtx.fillRect(0, 0, whiteCanvas.width, whiteCanvas.height);
        whiteCtx.drawImage(canvas, 0, 0);
      }

      // Restore original styles
      element.style.cssText = originalStyle;
      element.classList.remove('pdf-generation');

      // Use the white background canvas for PDF generation
      const finalCanvas = whiteCtx ? whiteCanvas : canvas;
      const imgData = finalCanvas.toDataURL('image/png', 1.0);
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (finalCanvas.height * imgWidth) / finalCanvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add first page without any watermark - clean form
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is too long (also without watermark)
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate clean filename
      const payslip = this.payslipData()!;
      const cleanEmployeeName = payslip.employeeName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Employee';
      const filename = `${cleanEmployeeName}_Payslip_${payslip.month}_${payslip.year}.pdf`;

      // Save the completely clean PDF without any watermarks
      pdf.save(filename);

      this.toastService.success('Clean payslip downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.toastService.error('Failed to download payslip. Please try again.');
    } finally {
      this.isDownloading.set(false);
    }
  }
}
