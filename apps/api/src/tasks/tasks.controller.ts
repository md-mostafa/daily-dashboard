import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import type { Task } from "@repo/shared";

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @Post()
  async create(@Body() task: Task): Promise<Task> {
    return this.tasksService.create(task);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() data: Partial<Task>,
  ): Promise<Task> {
    return this.tasksService.update(id, data);
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    return this.tasksService.remove(id);
  }
}