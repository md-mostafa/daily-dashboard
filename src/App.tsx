import AddTaskForm from "./features/tasks/components/AddTaskForm";
import TaskList from "./features/tasks/components/TaskList";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">🗓️  Daily Dashboard</h1>
        <AddTaskForm />
        <div className="my-8">
          <TaskList />
        </div>
      </div>
    </div>
  )
}