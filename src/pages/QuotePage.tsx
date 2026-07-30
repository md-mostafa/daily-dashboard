import { useQuote } from "@/hooks/useQuote";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuotePage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuote();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Quote of the Day</h2>
        <p className="text-sm text-muted-foreground">Inspiration to start your day</p>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2 ml-auto" />
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-destructive font-medium">Failed to load quote</p>
            <p className="text-sm text-muted-foreground">Please try again later.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {data && !isLoading && (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-1">
            <div className="bg-background/95 backdrop-blur rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Quote className="size-8 text-purple-500 shrink-0 mt-1" />
                <div>
                  <p className="text-xl leading-relaxed text-foreground font-medium italic">
                    "{data.quote}"
                  </p>
                  <p className="mt-4 text-right text-muted-foreground">— {data.author}</p>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-4 flex justify-center">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
              New Quote
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}