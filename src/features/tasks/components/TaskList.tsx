import { useTasks } from "../../../hooks/useTasks";
import TaskItem from "./TaskItem";
import { useTaskStore } from "../store";

export default function TaskList() {
  const { data: tasks, isLoading, isError } = useTasks();
  const filter = useTaskStore((state) => state.filter);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-zinc-200 dark:bg-zinc-700 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 mt-4">
        Failed to load tasks. Please try again.
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center text-zinc-500 mt-4">
        No tasks yet. Add one above!
      </div>
    );
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {filteredTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}