/**
 * Configuration and utilities for the Where2Meet frontend
 */

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
export const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000;

// Application Configuration
export const APP_NAME = process.env.REACT_APP_NAME || 'Where2Meet';
export const APP_VERSION = process.env.REACT_APP_VERSION || '1.0.0';
export const APP_DESCRIPTION = process.env.REACT_APP_DESCRIPTION || 'Smart Meeting Location Finder';

// Map Configuration
export const DEFAULT_COORDINATES = {
  lat: parseFloat(process.env.REACT_APP_DEFAULT_LAT) || 40.7128,
  lng: parseFloat(process.env.REACT_APP_DEFAULT_LNG) || -74.0060
};
export const DEFAULT_ZOOM = parseInt(process.env.REACT_APP_DEFAULT_ZOOM) || 10;

// Features
export const ENABLE_GEOLOCATION = process.env.REACT_APP_ENABLE_GEOLOCATION === 'true';
export const MAX_PARTICIPANTS = parseInt(process.env.REACT_APP_MAX_PARTICIPANTS) || 20;

// Development Settings
export const DEBUG = process.env.REACT_APP_DEBUG === 'true';
export const LOG_LEVEL = process.env.REACT_APP_LOG_LEVEL || 'info';

/**
 * Generate a random event ID
 */
export const generateEventId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Validate event ID format
 */
export const isValidEventId = (eventId) => {
  return /^[A-Za-z0-9]{3,12}$/.test(eventId);
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (lat, lng, precision = 4) => {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
};

/**
 * Simple logger that respects LOG_LEVEL
 */
export const logger = {
  debug: (message, ...args) => {
    if (DEBUG && ['debug'].includes(LOG_LEVEL)) {
      console.log('[DEBUG]', message, ...args);
    }
  },
  info: (message, ...args) => {
    if (DEBUG && ['debug', 'info'].includes(LOG_LEVEL)) {
      console.info('[INFO]', message, ...args);
    }
  },
  warn: (message, ...args) => {
    if (['debug', 'info', 'warn'].includes(LOG_LEVEL)) {
      console.warn('[WARN]', message, ...args);
    }
  },
  error: (message, ...args) => {
    console.error('[ERROR]', message, ...args);
  }
};

/**
 * API helper functions
 */
export const api = {
  /**
   * Make an API request with proper error handling
   */
  request: async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: API_TIMEOUT,
      ...options
    };

    logger.debug(`API Request: ${config.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      logger.debug(`API Response:`, data);
      
      return data;
    } catch (error) {
      logger.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Create a new event
   */
  createEvent: async (eventId, description, name = '') => {
    return api.request('/events', {
      method: 'POST',
      body: JSON.stringify({
        event_id: eventId,
        description,
        name
      })
    });
  },

  /**
   * Add location to event
   */
  addLocation: async (eventId, lat, lon, name = '') => {
    return api.request(`/events/${eventId}/locations`, {
      method: 'POST',
      body: JSON.stringify({
        lat,
        lon,
        name
      })
    });
  },

  /**
   * Get event details
   */
  getEvent: async (eventId) => {
    return api.request(`/events/${eventId}`);
  },

  /**
   * Finalize event
   */
  finalizeEvent: async (eventId) => {
    return api.request(`/events/${eventId}/finalize`, {
      method: 'POST'
    });
  },

  /**
   * Reset all events (development only)
   */
  resetEvents: async () => {
    if (DEBUG) {
      return api.request('/admin/reset', {
        method: 'POST'
      });
    }
    throw new Error('Reset not available in production');
  }
};

/**
 * Get user's current location using geolocation API
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!ENABLE_GEOLOCATION || !navigator.geolocation) {
      reject(new Error('Geolocation not available'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        logger.warn('Geolocation error:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};