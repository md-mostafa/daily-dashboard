import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import DailyTasksPage from "./pages/DailyTasksPage";
import WeatherPage from "./pages/WeatherPage";
import QuotePage from "./pages/QuotePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DailyTasksPage /> },
      { path: "weather", element: <WeatherPage /> },
      { path: "quote", element: <QuotePage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}