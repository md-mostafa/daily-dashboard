import type { Weather } from "../types/weather";
import { mockWeather } from "../mock/weather";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWeather(): Promise<Weather> {
  await delay(600);
  return { ...mockWeather };
}