import { useTaskStore } from "../store";
import TaskItem from "./TaskItem";

export default function TaskList() {
    const tasks = useTaskStore((state) => state.tasks);

    if (tasks.length === 0) {
        return (
            <div className="text-center text-zinc-500 mt-4">
                No tasks yet. Add one above!
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {tasks.map((task) => (
                <TaskItem key= {task.id} task={task} />
            ))}
        </div>
    )
}