import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';

export interface LocationInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  isp?: string;
  organization?: string;
  timezone?: string;
}

export interface OfficeLocation {
  name: string;
  allowedIPs: string[];
  allowedNetworks: string[]; // CIDR notation like "192.168.1.0/24"
  coordinates?: {
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);

  // Office configurations - move to backend/config in production
  private readonly officeLocations: OfficeLocation[] = [
    {
      name: 'Main Office',
      allowedIPs: [
        '194.180.86.40', // Replace with actual office public IP
        '117.247.XXX.XXX'  // Add multiple office IPs if needed
      ],
      allowedNetworks: [
        '192.168.1.0/24',
        '194.180.86.40',   // Office internal network
        '10.0.0.0/16',      // Corporate VPN network
        '172.16.0.0/12'     // Additional office subnet
      ],
      coordinates: {
        latitude: 28.6139,  // Replace with actual office coordinates
        longitude: 77.2090,
        radius: 100 // 100 meters radius
      }
    },
    {
      name: 'Branch Office',
      allowedIPs: ['XXX.XXX.XXX.XXX'], // Branch office IP
      allowedNetworks: ['192.168.2.0/24'],
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777,
        radius: 150
      }
    }
  ];

  // Signals for reactive state
  readonly isInOfficeNetwork = signal<boolean>(false);
  readonly currentLocation = signal<LocationInfo | null>(null);
  readonly isCheckingLocation = signal<boolean>(false);
  readonly locationError = signal<string | null>(null);

  /**
   * Check if user is in office network
   */
  async checkOfficeNetwork(): Promise<boolean> {
    this.isCheckingLocation.set(true);
    this.locationError.set(null);

    try {
      // Method 1: IP-based detection (Primary)
      const ipResult = await this.checkIPLocation();
      
      // Method 2: GPS-based detection (Fallback)
      const gpsResult = await this.checkGPSLocation();
      
      // Method 3: Network characteristics (Additional validation)
      const networkResult = await this.checkNetworkCharacteristics();

      // Combine results - require at least IP or GPS + Network match
      const isInOffice = ipResult || (gpsResult && networkResult);
      
      this.isInOfficeNetwork.set(isInOffice);
      
      if (!isInOffice) {
        this.locationError.set('Please connect to office WiFi or be within office premises to check-in');
        this.toastService.error('Not connected to office network');
      }
      
      return isInOffice;
    } catch (error) {
      console.error('Location check failed:', error);
      this.locationError.set('Unable to verify location. Please try again.');
      this.isInOfficeNetwork.set(false);
      return false;
    } finally {
      this.isCheckingLocation.set(false);
    }
  }

  /**
   * Method 1: Check public IP address
   */
  private async checkIPLocation(): Promise<boolean> {
    try {
      // Use multiple IP detection services for reliability
      const ipServices = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://ip-api.com/json/'
      ];

      for (const service of ipServices) {
        try {
          const response = await firstValueFrom(
            this.http.get<any>(service)
          );
          
          const userIP = response.ip || response.query;
          if (userIP) {
            this.currentLocation.set({
              ip: userIP,
              city: response.city,
              region: response.region || response.regionName,
              country: response.country || response.countryCode,
              isp: response.isp,
              organization: response.org || response.organization
            });

            return this.isIPAllowed(userIP);
          }
        } catch (serviceError) {
          console.warn(`IP service ${service} failed:`, serviceError);
          continue;
        }
      }
      
      throw new Error('All IP detection services failed');
    } catch (error) {
      console.error('IP location check failed:', error);
      return false;
    }
  }

  /**
   * Method 2: GPS location verification
   */
  private async checkGPSLocation(): Promise<boolean> {
    try {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported');
        return false;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes cache
          }
        );
      });

      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      // Check if user is within any office location
      for (const office of this.officeLocations) {
        if (office.coordinates) {
          const distance = this.calculateDistance(
            userLat, userLng,
            office.coordinates.latitude,
            office.coordinates.longitude
          );

          // Consider GPS accuracy + office radius
          const allowedRadius = office.coordinates.radius + Math.min(accuracy, 100);
          
          if (distance <= allowedRadius) {
            console.log(`GPS: User is within ${office.name} (${distance.toFixed(0)}m away)`);
            return true;
          }
        }
      }

      console.log('GPS: User is not within any office location');
      return false;
    } catch (error) {
      console.error('GPS location check failed:', error);
      return false;
    }
  }

  /**
   * Method 3: Network characteristics check
   */
  private async checkNetworkCharacteristics(): Promise<boolean> {
    try {
      // Check connection type (WiFi vs Cellular)
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      if (connection) {
        // Prefer WiFi connections for office check-in
        const isWiFi = connection.type === 'wifi' || 
                      connection.effectiveType === 'wifi' ||
                      !connection.type; // Desktop usually doesn't report type

        if (!isWiFi && connection.type === 'cellular') {
          console.log('Network: User is on cellular network');
          return false;
        }
      }

      // Additional network speed test (office WiFi is usually faster)
      const networkSpeed = await this.testNetworkSpeed();
      const isHighSpeed = networkSpeed > 10; // Mbps - adjust threshold

      console.log(`Network speed: ${networkSpeed.toFixed(2)} Mbps`);
      return isHighSpeed;
    } catch (error) {
      console.error('Network characteristics check failed:', error);
      return true; // Don't block if network test fails
    }
  }

  /**
   * Check if IP is in allowed office networks
   */
  private isIPAllowed(userIP: string): boolean {
    for (const office of this.officeLocations) {
      // Check exact IP matches
      if (office.allowedIPs.includes(userIP)) {
        console.log(`IP: User IP ${userIP} matches ${office.name} allowed IPs`);
        return true;
      }

      // Check network ranges (CIDR)
      for (const network of office.allowedNetworks) {
        if (this.isIPInNetwork(userIP, network)) {
          console.log(`IP: User IP ${userIP} is in ${office.name} network ${network}`);
          return true;
        }
      }
    }

    console.log(`IP: User IP ${userIP} is not in any allowed office networks`);
    return false;
  }

  /**
   * Check if IP is within CIDR network range
   */
  private isIPInNetwork(ip: string, cidr: string): boolean {
    try {
      const [networkIP, prefixLength] = cidr.split('/');
      const prefix = parseInt(prefixLength, 10);
      
      const ipToNumber = (ipStr: string) => {
        return ipStr.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
      };

      const userIPNum = ipToNumber(ip);
      const networkIPNum = ipToNumber(networkIP);
      const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;

      return (userIPNum & mask) === (networkIPNum & mask);
    } catch (error) {
      console.error('CIDR check failed:', error);
      return false;
    }
  }

  /**
   * Calculate distance between two GPS coordinates
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Simple network speed test
   */
  private async testNetworkSpeed(): Promise<number> {
    try {
      const startTime = performance.now();
      
      // Download a small test file (you can host this on your server)
      await firstValueFrom(
        this.http.get('https://httpbin.org/bytes/100000', { 
          responseType: 'blob' as 'json'
        })
      );
      
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // seconds
      const fileSize = 100000; // bytes
      const speedBps = fileSize / duration; // bytes per second
      const speedMbps = (speedBps * 8) / (1024 * 1024); // Mbps
      
      return speedMbps;
    } catch (error) {
      console.error('Network speed test failed:', error);
      return 0;
    }
  }

  /**
   * Get user's current location info
   */
  getCurrentLocationInfo(): LocationInfo | null {
    return this.currentLocation();
  }

  /**
   * Manually refresh location check
   */
  async refreshLocationCheck(): Promise<boolean> {
    return await this.checkOfficeNetwork();
  }

  /**
   * Clear location error
   */
  clearLocationError(): void {
    this.locationError.set(null);
  }
}
