import { create } from "zustand";
import { Task } from "./types";
import { persist } from "zustand/middleware";

type TaskFilter = 'all' | 'completed' | 'pending';

interface TaskState {
    tasks: Task[];
    filter: TaskFilter;
    setFilter: (filter: TaskFilter) => void;
    addTask: (task: Task) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    updateTask: (id: string, data: Partial<Task>) => void;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set) => ({
            tasks: [],
            addTask: (task) =>
                set((state) => ({
                    tasks: [task, ...state.tasks],
                })),
            toggleTask: (id) => 
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id ? { ...task, completed: !task.completed } : task
                    ),
                })),
            deleteTask: (id) => 
                set((state) => ({
                    tasks: state.tasks.filter((task) => task.id !== id),
                })),
            updateTask: (id, data) =>
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id ? {...task, ...data} : task
                    ),
                })),
            filter: 'all',
            setFilter: (filter) => set(() => ({ filter })),
        }),
        {
            name: 'task-manager', //name in localStorage
        }
    )
);