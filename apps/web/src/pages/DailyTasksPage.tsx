import { useTasks, useCreateTask, useToggleTask, useDeleteTask } from "@/hooks/useTasks";
import { useTaskStore } from "@/features/tasks/store";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, ListTodo, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

const filters = ["all", "pending", "completed"] as const;

export default function DailyTasksPage() {
  const { data: tasks, isLoading, isError } = useTasks();
  const createTask = useCreateTask();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();
  const filter = useTaskStore((s) => s.filter);
  const setFilter = useTaskStore((s) => s.setFilter);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createTask.mutate({
      id: uuidv4(),
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    });
    setTitle("");
    setDescription("");
  };

  const filteredTasks = (tasks || [])
    .filter((t) => {
      if (filter === "completed") return t.completed;
      if (filter === "pending") return !t.completed;
      return true;
    })
    .filter((t) => {
      if (!search) return true;
      return t.title.toLowerCase().includes(search.toLowerCase());
    });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {tasks?.length || 0} total &middot; {tasks?.filter((t) => !t.completed).length || 0} pending
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="size-4" />
            New Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Textarea
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
            <Button type="submit" disabled={createTask.isPending} className="w-full">
              {createTask.isPending ? "Adding..." : "Add Task"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-1">
          {filters.map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-destructive font-medium">Failed to load tasks</p>
          <p className="text-sm text-muted-foreground">Please try again later.</p>
        </div>
      )}

      {!isLoading && !isError && filteredTasks.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <ListTodo className="size-12 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">
            {search ? "No tasks match your search" : "No tasks yet"}
          </p>
          <p className="text-sm text-muted-foreground/60">
            {search ? "Try a different search term" : "Add one above to get started"}
          </p>
        </div>
      )}

      {!isLoading && !isError && filteredTasks.length > 0 && (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => toggleTask.mutate({ id: task.id })}
              onDelete={() => deleteTask.mutate({ id: task.id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className={cn("transition-colors", task.completed && "bg-muted/50")}>
      <CardContent className="flex items-start gap-3 p-4">
        <Checkbox checked={task.completed} onCheckedChange={onToggle} className="mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "font-medium text-sm",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </p>
            {task.completed && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                Done
              </Badge>
            )}
          </div>
          {task.description && (
            <p
              className={cn(
                "mt-0.5 text-sm text-muted-foreground/70 line-clamp-2",
                task.completed && "line-through"
              )}
            >
              {task.description}
            </p>
          )}
          <p className="mt-1 text-[10px] text-muted-foreground/40">
            {new Date(task.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="shrink-0 text-muted-foreground hover:text-destructive"
          aria-label="Delete task"
        >
          <Trash2 className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}