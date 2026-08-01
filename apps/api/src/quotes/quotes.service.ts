import { Injectable } from "@nestjs/common";
import type { Quote } from "@repo/shared";

@Injectable()
export class QuotesService {
  private quotes: Quote[] = [
    {
      id: "1",
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
    },
    {
      id: "2",
      quote: "Simplicity is the ultimate sophistication.",
      author: "Leonardo da Vinci",
    },
    {
      id: "3",
      quote: "Code is like humor. When you have to explain it, it's bad.",
      author: "Cory House",
    },
    {
      id: "4",
      quote: "First, solve the problem. Then, write the code.",
      author: "John Johnson",
    },
    {
      id: "5",
      quote: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
      author: "Martin Fowler",
    },
  ];

  async getRandom(): Promise<Quote> {
    const index = Math.floor(Math.random() * this.quotes.length);
    return this.quotes[index];
  }
}