const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

interface RequestConfig {
  method: string;
  headers?: Record<string, string>;
  body?: unknown;
}

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      localStorage.removeItem("refreshToken");
      return null;
    }

    const json = await res.json();
    accessToken = json.data.accessToken;
    return accessToken;
  } catch {
    localStorage.removeItem("refreshToken");
    return null;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  config: RequestConfig,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...config.headers,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: config.method,
    headers,
    body: config.body ? JSON.stringify(config.body) : undefined,
  });

  // If 401, try to refresh the token
  if (res.status === 401 && !endpoint.includes("/auth/refresh")) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: config.method,
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
      });
    }
  }

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error?.message ?? json.message ?? "Request failed");
  }

  return json.data ?? json;
}

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    apiRequest<{
      accessToken: string;
      expiresIn: number;
      user: { id: string; email: string; name: string; avatar: string | null; emailVerified: boolean };
    }>("/api/v1/auth/register", { method: "POST", body: data }),

  login: (data: { email: string; password: string }) =>
    apiRequest<{
      accessToken: string;
      expiresIn: number;
      user: { id: string; email: string; name: string; avatar: string | null; emailVerified: boolean };
    }>("/api/v1/auth/login", { method: "POST", body: data }),

  refresh: (refreshToken: string) =>
    apiRequest<{ accessToken: string; expiresIn: number }>("/api/v1/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    }),

  logout: (refreshToken?: string) =>
    apiRequest<{ message: string }>("/api/v1/auth/logout", {
      method: "POST",
      body: { refreshToken },
    }),

  logoutAll: () =>
    apiRequest<{ message: string }>("/api/v1/auth/logout/all", { method: "POST" }),

  verifyEmail: (token: string) =>
    apiRequest<{ message: string }>("/api/v1/auth/verify-email", {
      method: "POST",
      body: { token },
    }),

  forgotPassword: (email: string) =>
    apiRequest<{ message: string }>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: { email },
    }),

  resetPassword: (token: string, password: string) =>
    apiRequest<{ message: string }>("/api/v1/auth/reset-password", {
      method: "POST",
      body: { token, password },
    }),
};