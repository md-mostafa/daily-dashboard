import { BrowserRouter, Route, Routes } from "react-router-dom";
import AddTaskForm from "./features/tasks/components/AddTaskForm";
import TaskFilterToggle from "./features/tasks/components/TaskFilterToggle";
import TaskList from "./features/tasks/components/TaskList";
import WeatherWidget from "./features/weather/WeatherWidget";
import DashboardLayout from "./layout/DashboardLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />} >
          {/* <Route index element={<DailyTaskPage />} />
          <Route path="weather" element={<WeatherPage />} /> */}
        </ Route>
      </Routes>
    </BrowserRouter>
  )
}