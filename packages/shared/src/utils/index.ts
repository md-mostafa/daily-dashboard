/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date string to ISO format
 */
export function toISOString(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Generate a unique ID (for mock/development purposes)
 */
export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 15);
}

/**
 * Simulate network delay (for mock APIs)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if a string is empty or whitespace only
 */
export function isBlank(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}