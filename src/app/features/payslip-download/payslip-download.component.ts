import { Component, inject, signal, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MonthYearPickerComponent, type MonthYearValue } from '../../shared/components/month-year-picker/month-year-picker.component';
import { APP_CONFIG } from '../../core/config/app.config';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: "app-payslip-download",
  standalone: true,
  imports: [CommonModule, FormsModule, MonthYearPickerComponent],
  styleUrls: ['./payslip-download.component.scss'],
  styles: [`
    .payslip img {
      display: block !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
    .company-logo img {
      max-width: 120px;
      height: auto;
    }
    #payslip-form {
      width: 100% !important;
      min-width: 800px !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 20px !important;
      box-sizing: border-box !important;
    }
    #payslip-form table {
      width: 100% !important;
      table-layout: fixed !important;
    }
    #payslip-form td, #payslip-form th {
      word-wrap: break-word !important;
      padding: 8px !important;
    }
  `],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div class="container mx-auto px-4">
        <!-- Header Section -->
        <div class="text-center mb-8">
          <div class="company-logo mb-4">
            <img 
              src="assets/image.png" 
              alt="WillwareTech Logo" 
              class="mx-auto max-w-xs h-auto"
            />
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Payslip Download Portal</h1>
          <p class="text-gray-600">Generate and download your payslip</p>
        </div>

        <!-- Loading State -->
        @if (isInitializing()) {
          <div class="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              @if (autoDownload()) {
                <p class="text-gray-600">Preparing your payslip for download...</p>
                <p class="text-sm text-gray-500 mt-2">{{ autoMonth() | titlecase }} {{ autoYear() }}</p>
              } @else {
                <p class="text-gray-600">Loading employee information...</p>
              }
            </div>
          </div>
        }

        <!-- Main Content -->
        @if (!isInitializing() && !showThankYou() && !autoDownload()) {
          <div class="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <!-- Employee Info Display -->
            @if (employeeInfo()) {
              <div class="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 class="text-lg font-semibold text-blue-800 mb-2">Employee Information</h3>
                <p class="text-blue-700"><strong>Name:</strong> {{ employeeInfo().employeeName }}</p>
                <p class="text-blue-700"><strong>Employee ID:</strong> {{ employeeInfo().wwtId || employeeInfo()._id }}</p>
                <p class="text-blue-700"><strong>Department:</strong> {{ employeeInfo().department }}</p>
              </div>
            }

            <!-- Month-Year Selection Section -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Select Month & Year for Payslip
              </label>
              <app-month-year-picker
                inputId="payslip-month-year-picker"
                placeholder="Select month & year"
                (monthYearSelected)="onMonthYearSelected($event)"
                (monthYearCleared)="onMonthYearCleared()">
              </app-month-year-picker>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4 justify-center">
              <button
                (click)="generatePayslip()"
[disabled]="isLoading() || !selectedMonthYear()"
                class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center">
                @if (isLoading()) {
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                } @else {
                  Generate Payslip
                }
              </button>

              @if (payslipData() && !apiError()) {
                <button 
                  type="button" 
                  (click)="onDownload()" 
                  [disabled]="isDownloading()"
                  class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center">
                  @if (isDownloading()) {
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  } @else {
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                    </svg>
                    Download PDF
                  }
                </button>
              }
            </div>

            <!-- Error Display -->
            @if (apiError()) {
              <div class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-center mb-2">
                  <svg class="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h3 class="text-sm font-semibold text-red-800">Error Loading Payslip</h3>
                </div>
                <p class="text-red-700 text-sm">{{ apiError() }}</p>
              </div>
            }
          </div>
        }

        <!-- Auto Download Processing State -->
        @if (autoDownload() && !showThankYou() && !isInitializing() && (isLoading() || isDownloading())) {
          <div class="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              @if (isLoading()) {
                <p class="text-gray-600">Loading payslip data...</p>
              } @else if (isDownloading()) {
                <p class="text-gray-600">Generating PDF download...</p>
              }
              <p class="text-sm text-gray-500 mt-2">{{ autoMonth() | titlecase }} {{ autoYear() }}</p>
            </div>
          </div>
        }

        <!-- Payslip Preview -->
        @if (payslipData() && !apiError() && !showThankYou()) {
          <div class="mt-8 bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <section id="payslip-form" class="payslip">
              <!-- Company Header -->
              <div class="text-center mb-6">
                <div class="company-logo mb-4">
                  <img 
                    src="assets/image.png" 
                    alt="WillwareTech Logo" 
                    class="mx-auto max-w-32 h-auto"
                    crossorigin="anonymous"
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
              <table class="details-table w-full mb-6 border-collapse border-2 border-black">
                <tbody>
                  <tr>
                    <td class="py-2 px-4 font-medium text-gray-700 border border-black">Employee Name :</td>
                    <td class="py-2 px-4 text-gray-900 border border-black">{{ payslipData().employeeName }}</td>
                    <td class="py-2 px-4 font-medium text-gray-700 border border-black">Work Location :</td>
                    <td class="py-2 px-4 text-gray-900 border border-black">{{ payslipData().workLocation }}</td>
                  </tr>
                  <tr>
                    <td class="py-2 px-4 font-medium text-gray-700 border border-black">WWT ID :</td>
                    <td class="py-2 px-4 text-gray-900 border border-black">{{ payslipData().wwtId || payslipData().employeeId }}</td>
                    <td class="py-2 px-4 font-medium text-gray-700 border border-black">LOP Days :</td>
                    <td class="py-2 px-4 text-gray-900 border border-black">{{ payslipData().lopDays }}</td>
                  </tr>
                  <tr>
                    <td class="py-2 px-4 font-medium text-gray-700 border border-black">Designation :</td>
                    <td class="py-2 px-4 text-gray-900 border border-black">{{ payslipData().designation }}</td>
                    <td class="py-2 px-4 font-medium text-gray-700 border border-black">Worked Days / Paid Days :</td>
                    <td class="py-2 px-4 text-gray-900 border border-black">{{ payslipData().workedDays }}</td>
                  </tr>
                  <tr>
                    <td class="py-2 px-4 font-medium text-gray-700 border border-black">Department :</td>
                    <td class="py-2 px-4 text-gray-900 border border-black">{{ payslipData().department }}</td>
                    <td class="py-2 px-4 font-medium text-gray-700 border border-black">Bank A/c No :</td>
                    <td class="py-2 px-4 text-gray-900 border border-black">{{ payslipData().bankAccount }}</td>
                  </tr>
                  <tr>
                    <td class="py-2 px-4 font-medium text-gray-700 border border-black">Date of Joining :</td>
                    <td class="py-2 px-4 text-gray-900 border border-black">{{ payslipData().joiningDate }}</td>
                    <td class="py-2 px-4 font-medium text-gray-700 border border-black">UAN No :</td>
                    <td class="py-2 px-4 text-gray-900 border border-black">{{ payslipData().uan }}</td>
                  </tr>
                  <tr>
                    <td class="py-2 px-4 font-medium text-gray-700 border border-black">ESI Number :</td>
                    <td class="py-2 px-4 text-gray-900 border border-black">{{ payslipData().esiNumber }}</td>
                    <td class="py-2 px-4 font-medium text-gray-700 border border-black">PAN :</td>
                    <td class="py-2 px-4 text-gray-900 border border-black">{{ payslipData().pan }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Salary & Deductions Table -->
              <table class="salary-table w-full mb-6 border-collapse border-2 border-black">
                <thead>
                  <tr class="bg-gray-200">
                    <th class="py-3 px-4 text-left font-semibold border border-black">Salary Payable</th>
                    <th class="py-3 px-4 text-right font-semibold border border-black">Amount</th>
                    <th class="py-3 px-4 text-left font-semibold border border-black">Deductions</th>
                    <th class="py-3 px-4 text-right font-semibold border border-black">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="py-2 px-4 border border-black">Basic Pay</td>
                    <td class="py-2 px-4 text-right border border-black">₹{{ payslipData().basicPay | number }}</td>
                    <td class="py-2 px-4 border border-black">PF</td>
                    <td class="py-2 px-4 text-right border border-black">₹{{ payslipData().pf | number }}</td>
                  </tr>
                  <tr>
                    <td class="py-2 px-4 border border-black">HRA</td>
                    <td class="py-2 px-4 text-right border border-black">₹{{ payslipData().hra | number }}</td>
                    <td class="py-2 px-4 border border-black">ESI</td>
                    <td class="py-2 px-4 text-right border border-black">₹{{ payslipData().esi | number }}</td>
                  </tr>
                  <tr>
                    <td class="py-2 px-4 border border-black">Others</td>
                    <td class="py-2 px-4 text-right border border-black">₹{{ payslipData().others | number }}</td>
                    <td class="py-2 px-4 border border-black">TDS</td>
                    <td class="py-2 px-4 text-right border border-black">₹{{ payslipData().tds | number }}</td>
                  </tr>
                  <tr>
                    <td class="py-2 px-4 border border-black">Incentive</td>
                    <td class="py-2 px-4 text-right border border-black">₹{{ payslipData().incentive | number }}</td>
                    <td class="py-2 px-4 border border-black">Staff Advance</td>
                    <td class="py-2 px-4 text-right border border-black">₹{{ payslipData().staffAdvance | number }}</td>
                  </tr>
                  <tr class="total-row bg-gray-100 font-semibold">
                    <td class="py-3 px-4 border border-black">Total Earnings</td>
                    <td class="py-3 px-4 text-right border border-black">₹{{ payslipData().totalEarnings | number }}</td>
                    <td class="py-3 px-4 border border-black">Total Deductions</td>
                    <td class="py-3 px-4 text-right border border-black">₹{{ payslipData().totalDeductions | number }}</td>
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
                @if (payslipData().additionalFiled && payslipData().additionalFiled !== 'N/A') {
                  <p class="mb-4">
                    <strong>Additional Info :</strong> {{ payslipData().additionalFiled }}
                  </p>
                }
                <p class="note text-sm text-gray-600 border border-gray-300 p-2 rounded">
                  Note: "This payslip is computer generated; hence no signature is required."
                </p>
              </div>
            </section>
          </div>
        }

        <!-- Thank You Message -->
        @if (showThankYou()) {
          <div class="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
            <div class="mb-6">
              <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
              <p class="text-gray-600 mb-4">Your payslip has been downloaded successfully.</p>
              @if (downloadedFileName()) {
                <p class="text-sm text-gray-500 mb-4">File: {{ downloadedFileName() }}</p>
              }
            </div>
            
            <div class="space-y-3">
              <button 
                (click)="downloadAnother()"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Download Another Payslip
              </button>
              <button 
                (click)="closeWindow()"
                class="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Close Window
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class PayslipDownloadComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  
  // API Configuration
  private readonly API_BASE_URL = APP_CONFIG.API.BASE_URL;
  
  // Month names mapping
  private readonly MONTH_NAMES = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  // Component state
  readonly isInitializing = signal(true);
  readonly isLoading = signal(false);
  readonly isDownloading = signal(false);
  readonly employeeInfo = signal<any>(null);
  readonly payslipData = signal<any>(null);
  readonly apiError = signal<string | null>(null);
  readonly selectedMonthYear = signal<MonthYearValue | null>(null);
  readonly showThankYou = signal(false);
  readonly downloadedFileName = signal<string>('');
  
  // URL parameters
  private employeeId: string | null = null;
  private employeeToken: string | null = null;
  readonly autoMonth = signal<string | null>(null);
  readonly autoYear = signal<string | null>(null);
  readonly autoDownload = signal<boolean>(false);

  async ngOnInit() {
    // Get URL parameters
    this.route.queryParams.subscribe(async params => {
      this.employeeId = params['empId'] || null;
      this.employeeToken = params['token'] || null;
      const monthParam = params['month'] || null;
      const yearParam = params['year'] || null;
      
      this.autoMonth.set(monthParam);
      this.autoYear.set(yearParam);
      this.autoDownload.set(params['autoDownload'] === 'true' || !!(monthParam && yearParam));
      

      
      if (this.employeeId) {
        await this.loadEmployeeInfo();
        
        // If auto parameters are provided, trigger automatic flow
        if (this.autoDownload() && this.autoMonth() && this.autoYear()) {
          await this.performAutoDownload();
        }
      } else {
        this.isInitializing.set(false);
        this.apiError.set('Employee ID is required. Please access this page through the mobile app.');
      }
    });
  }

  private async loadEmployeeInfo(): Promise<void> {
    if (!this.employeeId) return;

    try {
      const apiUrl = `${this.API_BASE_URL}/view/${this.employeeId}`;
      
      const response = await firstValueFrom(
        this.http.get<any>(apiUrl)
      );

      this.employeeInfo.set(response);
      
    } catch (error) {
      this.apiError.set('Failed to load employee information. Please try again.');
    } finally {
      this.isInitializing.set(false);
    }
  }

  onMonthYearSelected(monthYear: MonthYearValue): void {
    this.selectedMonthYear.set(monthYear);
  }

  onMonthYearCleared(): void {
    this.selectedMonthYear.set(null);
    this.payslipData.set(null);
    this.apiError.set(null);
  }

  private getMonthName(monthNumber: number): string {
    return this.MONTH_NAMES[monthNumber - 1] || 'january';
  }

  async generatePayslip(): Promise<void> {
    const monthYear = this.selectedMonthYear();
    if (!monthYear || !this.employeeId) {
      this.toastService.warning('Please select month and year');
      return;
    }

    this.isLoading.set(true);
    this.apiError.set(null);
    this.payslipData.set(null);

    try {
      const monthNumber = monthYear.month;
      const monthName = this.getMonthName(monthNumber);
      const year = monthYear.year;
      
      const apiUrl = `${this.API_BASE_URL}/getPaySlip/${this.employeeId}?month=${monthName}&year=${year}`;

      const response = await firstValueFrom(
        this.http.get<any>(apiUrl)
      );
      
      if (response && response.success && response.data) {
        this.payslipData.set(response.data);
        this.toastService.success('Payslip data loaded successfully!');
      } else if (response) {
        this.payslipData.set(response);
        this.toastService.success('Payslip data loaded successfully!');
      } else {
        throw new Error('No payslip data received');
      }
      
    } catch (error) {
      this.apiError.set('Failed to generate payslip. Please try selecting a different month/year.');
      this.toastService.error('Failed to generate payslip. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onDownload(): Promise<void> {
    if (!this.payslipData()) {
      this.toastService.error('Failed to download payslip. Please try again.');
      return;
    }

    const element = document.getElementById('payslip-form');
    if (!element) {
      this.toastService.error('Failed to download payslip. Please try again.');
      return;
    }

    this.isDownloading.set(true);

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      
      // Ensure all images are loaded
      const images = element.querySelectorAll('img');
      
      await Promise.all(Array.from(images).map((img) => {
        return new Promise((resolve) => {
          if (img.complete && img.naturalHeight !== 0) {
            resolve(img);
          } else {
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
            setTimeout(() => resolve(img), 3000);
          }
        });
      }));
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // Ensure element has proper styling for capture
      const originalStyle = element.style.cssText;
      element.style.margin = '0';
      element.style.padding = '20px';
      element.style.backgroundColor = 'white';
      element.style.width = 'auto';
      element.style.minWidth = '800px';
      element.style.maxWidth = 'none';
      
      const canvas = await html2canvas(element, {
        allowTaint: false,
        useCORS: true,
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      });
      
      // Restore original styles
      element.style.cssText = originalStyle;

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // A4 dimensions with small margins
      const pdfWidth = 210;  // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const margin = 5;      // Small margin
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = pdfHeight - (margin * 2);
      
      // Calculate scaling to fit content properly
      const imgAspectRatio = canvas.width / canvas.height;
      const pdfAspectRatio = contentWidth / contentHeight;
      
      let finalWidth, finalHeight;
      if (imgAspectRatio > pdfAspectRatio) {
        // Image is wider, fit to width
        finalWidth = contentWidth;
        finalHeight = contentWidth / imgAspectRatio;
      } else {
        // Image is taller, fit to height
        finalHeight = contentHeight;
        finalWidth = contentHeight * imgAspectRatio;
      }
      
      // Center the content
      const xOffset = margin + (contentWidth - finalWidth) / 2;
      const yOffset = margin;

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let heightLeft = finalHeight;
      let position = yOffset;

      // Add first page
      pdf.addImage(imgData, 'PNG', xOffset, position, finalWidth, finalHeight);
      heightLeft -= (contentHeight - yOffset);

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = yOffset - (finalHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', xOffset, position, finalWidth, finalHeight);
        heightLeft -= contentHeight;
      }

      const filename = 'employee-payslip.pdf';
      pdf.save(filename);

      this.downloadedFileName.set(filename);
      this.showThankYou.set(true);
      this.toastService.success('Payslip downloaded successfully!');

    } catch (error) {
      this.toastService.error('Failed to download payslip. Please try again.');
    } finally {
      this.isDownloading.set(false);
    }
  }

  downloadAnother(): void {
    this.showThankYou.set(false);
    this.payslipData.set(null);
    this.selectedMonthYear.set(null);
    this.apiError.set(null);
    this.downloadedFileName.set('');
  }

  closeWindow(): void {
    window.close();
  }

  private async performAutoDownload(): Promise<void> {
    const monthParam = this.autoMonth();
    const yearParam = this.autoYear();
    
    if (!monthParam || !yearParam) {
      return;
    }

    try {
      const monthNumber = this.getMonthNumber(monthParam.toLowerCase());
      if (monthNumber === -1) {
        throw new Error(`Invalid month name: ${monthParam}`);
      }

      const monthYearValue: MonthYearValue = {
        month: monthNumber,
        year: parseInt(yearParam),
        monthName: monthParam,
        displayValue: `${monthParam} ${yearParam}`
      };
      
      this.selectedMonthYear.set(monthYearValue);
      await this.generatePayslip();
      
      if (this.payslipData() && !this.apiError()) {
        // Wait for DOM to render completely, then download
        setTimeout(async () => {
          await this.onDownload();
        }, 3000);
      }

    } catch (error) {
      this.apiError.set('Failed to download payslip. Please try again.');
    }
  }



  /**
   * Converts month name to month number (1-12)
   */
  private getMonthNumber(monthName: string): number {
    const index = this.MONTH_NAMES.indexOf(monthName.toLowerCase());
    return index === -1 ? -1 : index + 1;
  }
}