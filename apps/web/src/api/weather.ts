import type { Weather } from "@repo/shared";
import { delay } from "@repo/shared";
import { mockWeather } from "../mock/weather";

export async function fetchWeather(): Promise<Weather> {
  await delay(600);
  return { ...mockWeather };
}