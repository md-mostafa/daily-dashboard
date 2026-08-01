import { Injectable, NotFoundException } from "@nestjs/common";
import type { Task } from "@repo/shared";

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  async findAll(): Promise<Task[]> {
    return this.tasks;
  }

  async findOne(id: string): Promise<Task> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new NotFoundException("Task not found");
    return task;
  }

  async create(task: Task): Promise<Task> {
    this.tasks.push(task);
    return task;
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new NotFoundException("Task not found");
    this.tasks[index] = { ...this.tasks[index], ...data };
    return this.tasks[index];
  }

  async remove(id: string): Promise<void> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new NotFoundException("Task not found");
    this.tasks.splice(index, 1);
  }
}