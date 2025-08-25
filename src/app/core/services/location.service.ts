import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { OFFICE_LOCATIONS, getOfficeConfig } from '../config/office-locations.config';

interface LocationCheckResult {
  isInOffice: boolean;
  method: 'ip' | 'gps' | 'network' | 'time' | 'dev';
  officeName?: string;
  message: string;
  details?: any;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);
  
  readonly isLocationEnabled = signal(false);
  readonly isCheckingLocation = signal(false);
  readonly locationStatus = signal<string>('Not checked');
  readonly currentOffice = signal<string>('');

  private readonly isDevelopment = false; // Set to false in production

  /**
   * Main method to check if user is in office location
   * Uses multiple verification layers for reliability
   */
  async checkOfficeLocation(): Promise<LocationCheckResult> {
    this.isCheckingLocation.set(true);
    this.locationStatus.set('Checking location...');
    
    try {
      // Development mode - allow everything
      if (this.isDevelopment) {
        return this.handleDevMode();
      }

      // Production checks - try multiple methods
      const ipCheck = await this.checkByIP();
      if (ipCheck.isInOffice) {
        return ipCheck;
      }

      const gpsCheck = await this.checkByGPS();
      if (gpsCheck.isInOffice) {
        return gpsCheck;
      }

      const timeCheck = this.checkOfficeHours();
      if (!timeCheck.isInOffice) {
        return timeCheck;
      }

      // All checks failed
      return {
        isInOffice: false,
        method: 'ip',
        message: 'Not in office location. Please ensure you are connected to office WiFi.',
        details: { ipCheck, gpsCheck, timeCheck }
      };

    } catch (error) {
      console.error('Location check error:', error);
      return {
        isInOffice: false,
        method: 'ip',
        message: 'Unable to verify location. Please try again.',
        details: { error: error }
      };
    } finally {
      this.isCheckingLocation.set(false);
    }
  }

  /**
   * Check user's public IP against office IPs
   */
  private async checkByIP(): Promise<LocationCheckResult> {
    try {
      this.locationStatus.set('Checking IP address...');
      
      const response = await firstValueFrom(
        this.http.get<{ip: string}>('https://api.ipify.org?format=json')
      );
      
      const userIP = response.ip;
      console.log('User IP:', userIP);

      const offices = getOfficeConfig('production');
      
      for (const office of offices) {
        if (office.allowedIPs.includes(userIP) || office.allowedIPs.includes('*')) {
          this.isLocationEnabled.set(true);
          this.currentOffice.set(office.name);
          this.locationStatus.set(`Verified at ${office.name}`);
          
          return {
            isInOffice: true,
            method: 'ip',
            officeName: office.name,
            message: `IP verified for ${office.name}`,
            details: { userIP, office: office.name }
          };
        }
      }

      return {
        isInOffice: false,
        method: 'ip',
        message: 'IP address not recognized as office location',
        details: { userIP }
      };

    } catch (error) {
      console.error('IP check failed:', error);
      return {
        isInOffice: false,
        method: 'ip',
        message: 'Unable to verify IP address',
        details: { error }
      };
    }
  }

  /**
   * Check GPS coordinates against office locations
   */
  private async checkByGPS(): Promise<LocationCheckResult> {
    return new Promise((resolve) => {
      this.locationStatus.set('Checking GPS location...');
      
      if (!navigator.geolocation) {
        resolve({
          isInOffice: false,
          method: 'gps',
          message: 'GPS not supported by this browser'
        });
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          
          console.log('User GPS:', userLat, userLon);

          const offices = getOfficeConfig('production');
          
          for (const office of offices) {
            if (office.coordinates) {
              const distance = this.calculateDistance(
                userLat, userLon,
                office.coordinates.latitude, office.coordinates.longitude
              );

              if (distance <= office.coordinates.radius) {
                this.isLocationEnabled.set(true);
                this.currentOffice.set(office.name);
                this.locationStatus.set(`GPS verified at ${office.name}`);
                
                resolve({
                  isInOffice: true,
                  method: 'gps',
                  officeName: office.name,
                  message: `GPS location verified for ${office.name}`,
                  details: { userLat, userLon, distance, office: office.name }
                });
                return;
              }
            }
          }

          resolve({
            isInOffice: false,
            method: 'gps',
            message: 'GPS location not within office radius',
            details: { userLat, userLon }
          });
        },
        (error) => {
          console.error('GPS error:', error);
          resolve({
            isInOffice: false,
            method: 'gps',
            message: 'Unable to get GPS location',
            details: { error: error.message }
          });
        },
        options
      );
    });
  }

  /**
   * Check if current time is within office hours
   */
  private checkOfficeHours(): LocationCheckResult {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Check if it's a weekday (Monday to Friday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        isInOffice: false,
        method: 'time',
        message: 'Check-in only allowed on weekdays'
      };
    }

    const offices = getOfficeConfig('production');
    const office = offices[0]; // Use first office for time check
    
    if (office.workingHours) {
      const [startHour, startMinute] = office.workingHours.start.split(':').map(Number);
      const [endHour, endMinute] = office.workingHours.end.split(':').map(Number);
      
      const currentTime = currentHour * 60 + currentMinute;
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      if (currentTime >= startTime && currentTime <= endTime) {
        return {
          isInOffice: true,
          method: 'time',
          message: 'Within office hours',
          details: { currentTime: `${currentHour}:${currentMinute.toString().padStart(2, '0')}` }
        };
      }
      
      return {
        isInOffice: false,
        method: 'time',
        message: `Check-in only allowed between ${office.workingHours.start} - ${office.workingHours.end}`,
        details: { currentTime: `${currentHour}:${currentMinute.toString().padStart(2, '0')}` }
      };
    }

    return {
      isInOffice: true,
      method: 'time',
      message: 'No time restrictions configured'
    };
  }

  /**
   * Development mode - allows everything for testing
   */
  private handleDevMode(): LocationCheckResult {
    this.isLocationEnabled.set(true);
    this.currentOffice.set('Development Environment');
    this.locationStatus.set('Development mode - all locations allowed');
    
    return {
      isInOffice: true,
      method: 'dev',
      officeName: 'Development Environment',
      message: 'Development mode - location check bypassed'
    };
  }

  /**
   * Calculate distance between two GPS coordinates
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  /**
   * Legacy method for backward compatibility
   */
  loadGeolocation() {
    this.checkOfficeLocation().then(result => {
      console.log('Location check result:', result);
    });
  }

  /**
   * Reset location status
   */
  resetLocation() {
    this.isLocationEnabled.set(false);
    this.currentOffice.set('');
    this.locationStatus.set('Not checked');
  }
}