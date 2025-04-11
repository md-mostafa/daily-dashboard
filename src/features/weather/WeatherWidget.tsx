import { useEffect, useState } from "react";

interface WeatherData {
    temp: number;
    description: string;
    city: string;
}

export default function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const city = 'Dhaka';
    const countryCode = 'BD';
    const units = 'standard'
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
    const BASE_URL = `https://${import.meta.env.VITE_WEATHER_API_BASE_URL}/data/2.5/weather`;

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const url = `${BASE_URL}?q=${city},${countryCode}$units=${units}&appid=${API_KEY}`
                const res = await fetch(url);
                const data = await res.json();
                console.log("Data : ", data);

                if (data.cod !== 200) {
                    setError(true);
                    return;
                }

                setWeather({
                    temp: data.main.temp,
                    description: data.weather[0].description,
                    city: data.name,
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching weather data:', error);
                setError(true);
            }
        };
        fetchWeather();
    }, []);

    if (loading) return <div className="text-sm text-zinc-500"> Loading weather... </div>
    if (error || !weather) return <div className="text-red-500"> Failed to load weather  😢</div>

    return (
        <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-4 rounded-xl shadow-md w-full">
            <h2 className="text-lg font-semibold mb-1">🌤️ Weather</h2>
            <p className="text-sm">{weather.city}</p>
            <p className="text-xl font-bold">{weather.temp} °C</p>
            <p className="capitalize text-sm">{weather.description}</p>
        </div>
    );
}