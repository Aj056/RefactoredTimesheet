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
    <div class="p-6 pdf-generation-container">
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
                    src="assets/image.png" 
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
                    <td class="py-2 px-4 text-gray-900">{{ payslipData().wwtId }}</td>
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
