import { Controller, Get } from "@nestjs/common";
import { QuotesService } from "./quotes.service";
import type { Quote } from "@repo/shared";

@Controller("quotes")
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get("random")
  async getRandom(): Promise<Quote> {
    return this.quotesService.getRandom();
  }
}