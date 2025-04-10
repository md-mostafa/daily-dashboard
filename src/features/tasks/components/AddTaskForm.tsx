import { useState } from "react";
import { useTaskStore } from "../store";
import { v4 as uuidv4 } from "uuid";
import { Task } from "../types";

export default function AddTaskForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const addTask = useTaskStore((state) => state.addTask);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) return;

        const newTask: Task = {
            id: uuidv4(),
            title: title.trim(),
            description: description.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
        };

        addTask(newTask);
        setTitle('');
        setDescription('');
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-md"
        >
            <input
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="p-2 rounded border dark:bg-zinc-700 dark:text-white"
                required
            />
            <textarea
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="p-2 rounded border dark:bg-zinc-700 dark:text-white"
                rows={3}
            />
            <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            >
                Add Task
            </button>
        </form>
    );
}