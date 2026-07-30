import { useQuery } from "@tanstack/react-query";
import { fetchWeather } from "../api/weather";

export function useWeather() {
  return useQuery({
    queryKey: ["weather"],
    queryFn: fetchWeather,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}