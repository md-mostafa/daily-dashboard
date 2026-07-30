import type { Task } from "@repo/shared";
import { delay } from "@repo/shared";
import { mockTasks } from "../mock/tasks";

// In-memory store seeded with mock data (acts like a DB)
let tasks = [...mockTasks];

export async function fetchTasks(): Promise<Task[]> {
  await delay(400);
  return [...tasks];
}

export async function createTask(task: Task): Promise<Task> {
  await delay(300);
  tasks = [task, ...tasks];
  return task;
}

export async function toggleTask(id: string): Promise<Task> {
  await delay(200);
  const task = tasks.find((t) => t.id === id);
  if (!task) throw new Error("Task not found");
  task.completed = !task.completed;
  return { ...task };
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  await delay(200);
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Task not found");
  tasks[index] = { ...tasks[index], ...data };
  return { ...tasks[index] };
}

export async function deleteTask(id: string): Promise<void> {
  await delay(200);
  tasks = tasks.filter((t) => t.id !== id);
}