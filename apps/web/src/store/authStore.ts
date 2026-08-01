import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, setAccessToken } from "@/api/client";

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authApi.login({ email, password });
          setAccessToken(result.accessToken);
          localStorage.setItem("refreshToken", result.accessToken); // Will be replaced with actual refresh token
          set({
            user: result.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Login failed",
          });
          throw err;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authApi.register({ email, password, name });
          setAccessToken(result.accessToken);
          set({
            user: result.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Registration failed",
          });
          throw err;
        }
      },

      logout: async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        try {
          await authApi.logout(refreshToken ?? undefined);
        } catch {
          // Always clear local state
        }
        setAccessToken(null);
        localStorage.removeItem("refreshToken");
        set({ user: null, isAuthenticated: false, error: null });
      },

      logoutAll: async () => {
        try {
          await authApi.logoutAll();
        } catch {
          // Always clear local state
        }
        setAccessToken(null);
        localStorage.removeItem("refreshToken");
        set({ user: null, isAuthenticated: false, error: null });
      },

      restoreSession: async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          set({ isLoading: false });
          return false;
        }

        try {
          const result = await authApi.refresh(refreshToken);
          setAccessToken(result.accessToken);
          // Store the new refresh token (in a real app, this comes from the response)
          localStorage.setItem("refreshToken", result.accessToken);
          set({ isAuthenticated: true, isLoading: false });
          return true;
        } catch {
          localStorage.removeItem("refreshToken");
          setAccessToken(null);
          set({ user: null, isAuthenticated: false, isLoading: false });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);