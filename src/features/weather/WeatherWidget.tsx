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

export default function WeatherWidget() {

    const { data, isLoading, isError } = useQuery({
        queryKey: ['weather'],
        queryFn: fetchWeather,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });


    if (isLoading) return <div className="text-sm text-zinc-500"> Loading weather... </div>
    if (isError || !data) return <div className="text-red-500"> Failed to load weather  😢</div>

    return (
        <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-4 rounded-xl shadow-md w-full">
            <h2 className="text-lg font-semibold mb-1">🌤️ Weather</h2>
            <p className="text-sm">{data.name}</p>
            <p className="text-xl font-bold">{Math.round(data.main.temp)} °C</p>
            <p className="capitalize text-sm">{data.weather[0].description}</p>
        </div>
    );
}