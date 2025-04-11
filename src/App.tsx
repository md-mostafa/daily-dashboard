import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import DailyTasksPage from "./pages/DailyTasksPage";
import WeatherPage from "./pages/WeatherPage";

export default function App() {
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