import AddTaskForm from "../features/tasks/components/AddTaskForm";
import TaskFilterToggle from "../features/tasks/components/TaskFilterToggle";
import TaskList from "../features/tasks/components/TaskList";

export default function DailyTasksPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <AddTaskForm />
            <TaskFilterToggle />
            <TaskList />
        </div>
    )
}