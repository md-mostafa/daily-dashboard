import { Controller, Get } from "@nestjs/common";
import { WeatherService } from "./weather.service";
import type { Weather } from "@repo/shared";

@Controller("weather")
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async getWeather(): Promise<Weather> {
    return this.weatherService.getWeather();
  }
}