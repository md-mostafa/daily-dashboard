import { Trash2 } from "lucide-react";
import { useTaskStore } from "../store";
import { Task } from "../types";

interface Props {
    task: Task;
}

export default function TaskItem({ task }: Props) {
    const toggleTask = useTaskStore((state) => state.toggleTask);
    const deleteTask = useTaskStore((state) => state.deleteTask);


    return (
        <div
            className={`flex items-start justify-between p-4 rounded-xl shadow-sm border 
                ${task.completed ? 'bg-green 50 dark:bg-green-900/30' : 'bg-white dark:bg-zinc-800'}`}
        >
            <div className="flex gap-3 items-start">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="mt-1"
                />
                <div>
                    <h2 className={`font-semibold ${task.completed ? 'line-through text-zinc-400': ''}`}>
                        {task.title}
                    </h2>
                    { task.description && (
                        <p className={`text-sm mt-1 ${task.completed ? 'line-through text-zinc-400': 'text-zinc-600 dark:text-zinc-300'}`}>
                            {task.description}
                        </p>
                    )}
                </div>
            </div>

            <button
                onClick={() => deleteTask(task.id)}
                className="text-red-500 hover:text-red-700"
                title="Delete Task"
            >
                <Trash2 size={18} />
            </button>
        </div>
    )
}