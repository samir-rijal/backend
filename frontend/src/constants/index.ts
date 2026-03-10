// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
  HEALTH: '/health',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  USERS: '/dashboard/users',
  USER_PROFILE: '/dashboard/users/:id',
  EDIT_PROFILE: '/dashboard/users/:id/edit',
  SETTINGS: '/dashboard/settings',
} as const;

// Query keys for React Query
export const QUERY_KEYS = {
  USERS: ['users'] as const,
  USER: (id: string) => ['users', id] as const,
  HEALTH: ['health'] as const,
  AUTH_USER: ['auth-user'] as const,
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;
