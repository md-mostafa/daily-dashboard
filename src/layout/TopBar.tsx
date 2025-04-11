import { useEffect, useState } from "react";

function formatTime(date: Date) {
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

export default function TopBar() {
    const [time, setTime] = useState(formatTime(new Date()));

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(formatTime(new Date()));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <header className="flex justify-between items-center px-6 py-4 border-b border-zinc 200 dark:border-zinc 800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
            <div className="text-xl font-semibold text-zinc-700 dark:text-white">🕒 {time}</div>

            <div className="flex items-center gap-3">
                <img
                    src="https://i.pravatar.cc/40?img=3"
                    alt="user"
                    className="w-10 h-10 rounded-full border-2 border-blue-500"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium"> Mostafa </span>
            </div>
        </header>
    )
}