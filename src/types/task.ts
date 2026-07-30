export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}

export type TaskFilter = 'all' | 'completed' | 'pending';