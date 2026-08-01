import { Injectable } from "@nestjs/common";
import type { Weather } from "@repo/shared";

@Injectable()
export class WeatherService {
  async getWeather(): Promise<Weather> {
    // TODO: Implement real weather API integration
    return {
      city: "Dhaka",
      temperature: 28,
      description: "Partly cloudy",
      humidity: 65,
      windSpeed: 12,
      icon: "02d",
    };
  }
}