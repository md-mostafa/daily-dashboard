import type { Quote } from "@repo/shared";
import { delay } from "@repo/shared";
import { mockQuotes } from "../mock/quotes";

export async function fetchRandomQuote(): Promise<Quote> {
  await delay(500);
  const index = Math.floor(Math.random() * mockQuotes.length);
  return { ...mockQuotes[index] };
}