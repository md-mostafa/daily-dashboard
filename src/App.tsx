import AddTaskForm from "./features/tasks/components/AddTaskForm";
import TaskFilterToggle from "./features/tasks/components/TaskFilterToggle";
import TaskList from "./features/tasks/components/TaskList";
import WeatherWidget from "./features/weather/WeatherWidget";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">🗓️  Daily Dashboard</h1>
        <AddTaskForm />
        <TaskFilterToggle />
        <div className="my-8">
          <TaskList />
        </div>

        <div className="mb-6">
          <WeatherWidget />
        </div>
      </div>
    </div>
  )
}