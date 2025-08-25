/**
 * Office Location Configuration
 * Move this to environment files or backend configuration in production
 */

export interface OfficeLocationConfig {
  name: string;
  allowedIPs: string[];
  allowedNetworks: string[]; // CIDR notation like "192.168.1.0/24"
  coordinates?: {
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
  timezone?: string;
  workingHours?: {
    start: string; // "09:00"
    end: string;   // "18:00"
  };
}

export const OFFICE_LOCATIONS: OfficeLocationConfig[] = [
  {
    name: 'Main Office',
    allowedIPs: [
      // Replace with your actual office public IP addresses
      '194.180.86.40',   // Your actual office IP
      '117.247.XXX.XXX'  // Backup/secondary IP
    ],
    allowedNetworks: [
      '192.168.1.0/24',   // Main office network
      '10.0.0.0/16',      // Corporate VPN
      '172.16.0.0/12'     // Additional subnets
    ],
    coordinates: {
      latitude: 11.53769,    // Your actual office coordinates
      longitude: 79.3296565,
      radius: 100 // 100 meters radius
    },
    timezone: 'Asia/Kolkata',
    workingHours: {
      start: '09:00',
      end: '18:00'
    }
  },
  {
    name: 'Branch Office - Delhi',
    allowedIPs: [
      'XXX.XXX.XXX.XXX' // Branch office IP
    ],
    allowedNetworks: [
      '192.168.2.0/24'
    ],
    coordinates: {
      latitude: 28.6139,
      longitude: 77.2090,
      radius: 150
    },
    timezone: 'Asia/Kolkata',
    workingHours: {
      start: '09:30',
      end: '18:30'
    }
  },
  {
    name: 'Remote Office - Bangalore',
    allowedIPs: [
      'YYY.YYY.YYY.YYY'
    ],
    allowedNetworks: [
      '192.168.3.0/24'
    ],
    coordinates: {
      latitude: 12.9716,
      longitude: 77.5946,
      radius: 200
    },
    timezone: 'Asia/Kolkata',
    workingHours: {
      start: '10:00',
      end: '19:00'
    }
  }
];

/**
 * Development/Testing Configuration
 * For testing purposes - allows all IPs
 */
export const DEV_OFFICE_CONFIG: OfficeLocationConfig = {
  name: 'Development Environment',
  allowedIPs: ['*'], // Allow all IPs in development
  allowedNetworks: ['0.0.0.0/0'], // Allow all networks
  coordinates: {
    latitude: 0,
    longitude: 0,
    radius: 999999 // Very large radius for testing
  },
  timezone: 'Asia/Kolkata',
  workingHours: {
    start: '00:00',
    end: '23:59'
  }
};

/**
 * Configuration for different environments
 */
export const getOfficeConfig = (environment: 'development' | 'production' | 'staging') => {
  switch (environment) {
    case 'development':
      return [DEV_OFFICE_CONFIG];
    case 'staging':
      return OFFICE_LOCATIONS.slice(0, 1); // Only main office for staging
    case 'production':
    default:
      return OFFICE_LOCATIONS;
  }
};
