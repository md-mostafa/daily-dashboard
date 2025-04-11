import { useWeather } from "./hooks/useWeather";

export default function WeatherWidget() {
    const { data, isLoading, isError } = useWeather();

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