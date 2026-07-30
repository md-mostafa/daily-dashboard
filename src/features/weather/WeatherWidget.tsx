import { useWeather } from "./hooks/useWeather";
import type { Weather } from "../../types/weather";

export default function WeatherWidget() {
  const { data, isLoading, isError } = useWeather();

  if (isLoading)
    return (
      <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-xl shadow-md w-full animate-pulse">
        <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded w-24 mb-2" />
        <div className="h-6 bg-blue-200 dark:bg-blue-800 rounded w-16 mb-1" />
        <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded w-32" />
      </div>
    );

  if (isError || !data)
    return (
      <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-xl shadow-md w-full">
        Failed to load weather 😢
      </div>
    );

  const weather = data as Weather;

  return (
    <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-4 rounded-xl shadow-md w-full">
      <h2 className="text-lg font-semibold mb-1">🌤️ Weather</h2>
      <p className="text-sm">{weather.city}</p>
      <p className="text-xl font-bold">{Math.round(weather.temperature)} °C</p>
      <p className="capitalize text-sm">{weather.description}</p>
      <div className="flex gap-4 mt-2 text-xs">
        <span>💧 {weather.humidity}%</span>
        <span>💨 {weather.windSpeed} km/h</span>
      </div>
    </div>
  );
}