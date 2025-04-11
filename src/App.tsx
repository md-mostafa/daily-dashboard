import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import DailyTasksPage from "./pages/DailyTasksPage";
import WeatherPage from "./pages/WeatherPage";
import { useDashboardStore } from "./store/dashboardStore";
import { useEffect } from "react";



export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />} >
          <Route index element={<DailyTasksPage />} />
          <Route path="weather" element={<WeatherPage />} />
        </ Route>
      </Routes>
    </BrowserRouter>
  )
}

export default function AppWrapper() {
  const setTime = useDashboardStore((state) => state.setTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}));
    }, 1000);
    return () => clearInterval(interval);
  }, [setTime]);

  return <App />
}