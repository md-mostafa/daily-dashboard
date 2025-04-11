import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import DailyTasksPage from "./pages/DailyTasksPage";
import WeatherPage from "./pages/WeatherPage";
import { useDashboardStore } from "./store/dashboardStore";
import { useEffect } from "react";
import QuoteCard from "./features/qoute/components/QuoteCard";



export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />} >
          <Route index element={<DailyTasksPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/quote" element={<QuoteCard />} />
        </ Route>
      </Routes>
    </BrowserRouter>
  )
}

export default function AppWrapper() {
  const { theme, setTime }= useDashboardStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}));
    }, 1000);
    return () => clearInterval(interval);
  }, [setTime]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <App />
}