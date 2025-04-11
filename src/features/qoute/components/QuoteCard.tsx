import { useQuote } from "../hooks/useQuote";

export default function QuoteCard() {
    const { data, isLoading, isError, refetch } = useQuote();

    console.log("data", data);

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow space-y-6 text-center">
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">📜 Quote of the Day</h2>

            { isLoading && <p className="text-zinc-500"> Loading...</p> }
            { isError && <p className="text-red-500">Could not fetch qoute. Try again later.</p> }

            { data && (
                <>
                    <p className="text-xl italic text-zinc-700 dark:text-zinc-200">"{data.quote}"</p>
                    <p className="text-right text-zinc-500 dark:text-zinc-400">__{data.author}</p>
                </>
            )}

            <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                 🔁 Refresh
            </button>
        </div>
    );
}