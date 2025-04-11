import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface WeatherResponse {
    main: { temp: number };
    weather: { description: string }[];
    name: string;
}

async function fetchWeather(): Promise<WeatherResponse> {
    const city = 'Dhaka';
    const countryCode = 'BD';
    const units = 'standard'
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
    const BASE_URL = `https://${import.meta.env.VITE_WEATHER_API_BASE_URL}/data/2.5/weather`;

    const { data } = await axios.get(
        BASE_URL,
        {
            params: {
                q: `${city},${countryCode}`,
                units: units,
                appid: API_KEY
            }
        }
    );
    
    return data;
}

export const useWeather = () =>
    useQuery({
      queryKey: ['weather'],
      queryFn: fetchWeather,
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
