import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Link,
  useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useDashboardStore } from "@/store/dashboardStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Moon, Sun, LayoutDashboard, ListTodo, CloudSun, Quote, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import DailyTasksPage from "@/pages/DailyTasksPage";
import WeatherPage from "@/pages/WeatherPage";
import QuotePage from "@/pages/QuotePage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicRoute } from "@/components/auth/PublicRoute";

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});

// Auth pages (public routes, directly under root)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  ),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: () => (
    <PublicRoute>
      <RegisterPage />
    </PublicRoute>
  ),
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: () => (
    <PublicRoute>
      <ForgotPasswordPage />
    </PublicRoute>
  ),
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reset-password",
  component: () => (
    <PublicRoute>
      <ResetPasswordPage />
    </PublicRoute>
  ),
});

const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify-email",
  component: () => (
    <PublicRoute>
      <VerifyEmailPage />
    </PublicRoute>
  ),
});

// Dashboard layout (protected routes)
const navItems = [
  { to: "/", label: "Tasks", icon: ListTodo },
  { to: "/weather", label: "Weather", icon: CloudSun },
  { to: "/quote", label: "Quote", icon: Quote },
];

function DashboardLayout() {
  const { time, user: dashboardUser, theme, toggleTheme } = useDashboardStore();
  const { user: authUser, logout } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayUser = authUser ?? dashboardUser;

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <LayoutDashboard className="size-5 text-sidebar-primary" />
          <span className="font-semibold text-sidebar-foreground">Dashboard</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Separator />

        <div className="p-3 space-y-2">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <Avatar className="size-8">
              <AvatarImage src={displayUser?.avatar ?? undefined} alt={displayUser?.name ?? "User"} />
              <AvatarFallback>{displayUser?.name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">
                {displayUser?.name ?? "User"}
              </span>
              <span className="text-xs text-sidebar-foreground/60">{time}</span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle sidebar"
            >
              <Menu className="size-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              {navItems.find((i) => i.to === location.pathname)?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "dashboard",
  component: () => (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
});

// Index route (tasks)
const indexRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/",
  component: DailyTasksPage,
});

// Weather route
const weatherRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/weather",
  component: WeatherPage,
});

// Quote route
const quoteRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/quote",
  component: QuotePage,
});

// Build the route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  verifyEmailRoute,
  dashboardLayoutRoute.addChildren([indexRoute, weatherRoute, quoteRoute]),
]);

export const router = createRouter({ routeTree });

// Register the router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}