// Task constants
export const TASK_FILTERS = ["all", "completed", "pending"] as const;

// API endpoints
export const API_PREFIX = "/api/v1";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_PREFIX}/auth/login`,
    REGISTER: `${API_PREFIX}/auth/register`,
    LOGOUT: `${API_PREFIX}/auth/logout`,
    REFRESH: `${API_PREFIX}/auth/refresh`,
    PROFILE: `${API_PREFIX}/auth/profile`,
  },
  TASKS: {
    BASE: `${API_PREFIX}/tasks`,
    BY_ID: (id: string) => `${API_PREFIX}/tasks/${id}`,
  },
  WEATHER: {
    BASE: `${API_PREFIX}/weather`,
  },
  QUOTES: {
    RANDOM: `${API_PREFIX}/quotes/random`,
    BASE: `${API_PREFIX}/quotes`,
  },
} as const;

// Query keys for TanStack Query
export const QUERY_KEYS = {
  TASKS: ["tasks"] as const,
  WEATHER: ["weather"] as const,
  QUOTE: ["quote"] as const,
  USER: ["user"] as const,
} as const;

// Stale times
export const STALE_TIMES = {
  WEATHER: 1000 * 60 * 10, // 10 minutes
  QUOTE: 1000 * 60 * 60, // 1 hour
  TASKS: 1000 * 30, // 30 seconds
} as const;