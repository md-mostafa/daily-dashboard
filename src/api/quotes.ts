import type { Quote } from "../types/quote";
import { mockQuotes } from "../mock/quotes";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchRandomQuote(): Promise<Quote> {
  await delay(500);
  const index = Math.floor(Math.random() * mockQuotes.length);
  return { ...mockQuotes[index] };
}