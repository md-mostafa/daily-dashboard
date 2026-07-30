import { useWeather } from "@/hooks/useWeather";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CloudSun, Droplets, Wind } from "lucide-react";

export default function WeatherPage() {
  const { data, isLoading, isError } = useWeather();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Weather</h2>
        <p className="text-sm text-muted-foreground">Current conditions in your area</p>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive font-medium">Failed to load weather</p>
            <p className="text-sm text-muted-foreground mt-1">Please try again later.</p>
          </CardContent>
        </Card>
      )}

      {data && !isLoading && (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold">{Math.round(data.temperature)}°C</p>
                <p className="text-blue-100 mt-1 capitalize">{data.description}</p>
              </div>
              <CloudSun className="size-16 opacity-80" />
            </div>
            <p className="text-blue-100 mt-2 text-sm font-medium">{data.city}</p>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-around">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Droplets className="size-4 text-blue-500" />
                <span>{data.humidity}% Humidity</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wind className="size-4 text-blue-500" />
                <span>{data.windSpeed} km/h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}