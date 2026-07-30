import type { Task } from "../types/task";

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Review pull requests",
    description: "Check the open PRs on the team repo and provide feedback",
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "2",
    title: "Write documentation for API endpoints",
    description: "Document the new REST endpoints for the frontend team",
    completed: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    title: "Fix login page responsive layout",
    description: "The login form breaks on mobile viewports below 375px",
    completed: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "4",
    title: "Update dependencies",
    description: "Run npm audit and update outdated packages",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Weekly team sync",
    description: "Prepare agenda for the Friday standup meeting",
    completed: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];