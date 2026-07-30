import { useQuery } from "@tanstack/react-query";
import { fetchRandomQuote } from "../api/quotes";

export function useQuote() {
  return useQuery({
    queryKey: ["quote"],
    queryFn: fetchRandomQuote,
    refetchOnWindowFocus: false,
  });
}