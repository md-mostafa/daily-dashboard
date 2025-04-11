import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Quote {
    quote: string;
    author: string;
}

export const useQuote = () => {
    return useQuery<Quote>({
        queryKey: ['quote-of-the-day'],
        queryFn: async () => {
            const res = await axios.get("https://dummyjson.com/quotes/random");
            return {
                quote: res.data.quote,
                author: res.data.author
            }
        },
        refetchOnWindowFocus: false,
    });
};