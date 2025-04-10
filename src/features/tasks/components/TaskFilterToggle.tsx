import { useTaskStore } from "../store";

const filters = ['all', 'completed', 'pending'] as const;

export default function TaskFilterToggle() {
    const filter = useTaskStore((state) => state.filter);
    const setFilter = useTaskStore((state) => state.setFilter);

    return (
        <div className="flex justify-center gap-2 mt-6">
            {filters.map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1 rounded-full text-sm font-medium transition
                        ${filter === f 
                            ? 'bg-zinc-600 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-600'}`}
                >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
            ))}
        </div>
    );
}