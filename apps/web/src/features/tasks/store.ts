import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TaskFilter } from "@repo/shared";

interface TaskUIState {
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
}

export const useTaskStore = create<TaskUIState>()(
  persist(
    (set) => ({
      filter: "all",
      setFilter: (filter) => set(() => ({ filter })),
    }),
    {
      name: "task-filter",
    },
  ),
);