import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PayslipDownloadService {
  
  /**
   * Generate a secure payslip download URL for mobile app integration
   * @param employeeId - The employee's ID
   * @param token - Optional security token for additional validation
   * @returns Complete URL for payslip download page
   */
  generatePayslipDownloadUrl(employeeId: string, token?: string): string {
    // Detect if running in production or development
    const isProduction = window.location.hostname !== 'localhost';
    const baseUrl = isProduction 
      ? window.location.origin // Use current domain in production
      : 'http://localhost:4200';
    
    let url = `${baseUrl}/payslip-download?empId=${encodeURIComponent(employeeId)}`;
    
    if (token) {
      url += `&token=${encodeURIComponent(token)}`;
    }
    
    // Add timestamp for cache busting
    url += `&t=${Date.now()}`;
    
    return url;
  }

  /**
   * Generate a QR code-friendly short URL (you can integrate with URL shortener service)
   * @param employeeId - The employee's ID
   * @param token - Optional security token
   * @returns Shortened URL or original URL
   */
  generateShortUrl(employeeId: string, token?: string): string {
    // For now, return the full URL
    // In production, you might want to integrate with a URL shortener service
    return this.generatePayslipDownloadUrl(employeeId, token);
  }

  /**
   * Validate if the current URL has proper payslip download parameters
   * @param currentUrl - Current window location
   * @returns Validation result with employee ID and token
   */
  validatePayslipDownloadUrl(currentUrl: string): {
    isValid: boolean;
    employeeId?: string;
    token?: string;
    error?: string;
  } {
    try {
      const url = new URL(currentUrl);
      const employeeId = url.searchParams.get('empId');
      const token = url.searchParams.get('token');
      
      if (!employeeId) {
        return {
          isValid: false,
          error: 'Employee ID is required'
        };
      }
      
      return {
        isValid: true,
        employeeId,
        token: token || undefined
      };
      
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid URL format'
      };
    }
  }

  /**
   * Create mobile app deep link URL
   * @param employeeId - The employee's ID
   * @returns Deep link URL for mobile app
   */
  generateMobileDeepLink(employeeId: string): string {
    // This would be your mobile app's custom URL scheme
    return `willwareapp://payslip/download?empId=${encodeURIComponent(employeeId)}`;
  }
}