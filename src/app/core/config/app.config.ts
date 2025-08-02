/**
 * Application Configuration
 * This file contains all production-ready configuration settings
 */

export const APP_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: 'https://attendance-three-lemon.vercel.app',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    ENDPOINTS: {
      LOGIN: '/login',
      LOGOUT: '/logout',
      REFRESH: '/refresh',
      EMPLOYEES: '/employees',
      ATTENDANCE: '/attendance'
    }
  },

  // Authentication Configuration
  AUTH: {
    TOKEN_STORAGE_KEY: 'auth_data',
    TOKEN_EXPIRY_HOURS: 24,
    REFRESH_THRESHOLD_MINUTES: 30, // Refresh token when 30 minutes left
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15
  },

  // Session Configuration
  SESSION: {
    IDLE_TIMEOUT_MINUTES: 60, // Auto logout after 60 minutes of inactivity
    WARNING_MINUTES: 5, // Show warning 5 minutes before timeout
    EXTEND_ON_ACTIVITY: true
  },

  // UI Configuration
  UI: {
    LOADING_DELAY_MS: 300, // Delay before showing loading spinner
    ERROR_DISPLAY_DURATION_MS: 5000,
    SUCCESS_DISPLAY_DURATION_MS: 3000,
    ANIMATION_DURATION_MS: 200
  },

  // Security Configuration
  SECURITY: {
    ENABLE_CSP: true, // Content Security Policy
    SECURE_STORAGE: true, // Use secure storage where available
    AUTO_LOGOUT_ON_TAB_CLOSE: false,
    CLEAR_CACHE_ON_LOGOUT: true
  },

  // Feature Flags
  FEATURES: {
    DARK_MODE: true,
    REMEMBER_ME: true,
    OFFLINE_MODE: false,
    ANALYTICS: false,
    DEBUG_MODE: false // Set to false in production
  },

  // Route Configuration
  ROUTES: {
    DEFAULT_ADMIN: '/admin',
    DEFAULT_EMPLOYEE: '/dashboard',
    LOGIN: '/login',
    FORBIDDEN: '/forbidden',
    NOT_FOUND: '/404'
  },

  // Theme Configuration
  THEME: {
    DEFAULT: 'light',
    STORAGE_KEY: 'theme_preference',
    SYSTEM_PREFERENCE: true
  }
} as const;

/**
 * Environment-specific configuration
 */
export const ENV_CONFIG = {
  production: true,
  apiUrl: APP_CONFIG.API.BASE_URL,
  enableLogging: !APP_CONFIG.FEATURES.DEBUG_MODE,
  enableSourceMaps: false,
  enableDevTools: false
} as const;

/**
 * Type definitions for configuration
 */
export type AppConfig = typeof APP_CONFIG;
export type EnvironmentConfig = typeof ENV_CONFIG;
