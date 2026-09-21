/**
 * NEXHIRE AI — App-wide constants
 */

const getAppUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    return 'https://nexhireai-1.onrender.com/api';
  }
  return 'http://localhost:8080/api';
};

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'NEXHIRE AI';
export const APP_URL = getAppUrl();
export const API_BASE_URL = getApiBaseUrl();

export const AUTH_ROUTES = ['/login', '/register', '/forgot-password'] as const;
export const PUBLIC_ROUTES = ['/', ...AUTH_ROUTES] as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'nexhire.access_token',
  REFRESH_TOKEN: 'nexhire.refresh_token',
  THEME: 'nexhire.theme',
  RECENT_SEARCHES: 'nexhire.recent_searches',
} as const;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MiB resume cap

/** Routes the authed app can navigate to. */
export const APP_ROUTES = {
  dashboard: '/dashboard',
  jobs: '/jobs',
  candidates: '/candidates',
  pipeline: '/pipeline',
  interviews: '/interviews',
  offers: '/offers',
  analytics: '/analytics',
  settings: '/settings',
  admin: '/admin',
  profile: '/settings/profile',
} as const;
