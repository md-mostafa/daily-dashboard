import { Moon, Sun } from "lucide-react";
import { useDashboardStore } from "../store/dashboardStore";

export default function TopBar() {
    const { time, user, theme, toggleTheme } = useDashboardStore();

    return (
        <header className="flex justify-between items-center px-6 py-4 border-b border-zinc 200 dark:border-zinc 800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
            <div className="text-xl font-semibold text-zinc-700 dark:text-white">🕒 {time}</div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>

                <div className="flex items-center gap-3">
                    <img
                        src={user.avatar}
                        alt="user"
                        className="w-10 h-10 rounded-full border-2 border-blue-500"
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium"> {user.name}</span>
                </div>
            </div>
        </header>
    )
}