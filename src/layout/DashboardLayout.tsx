import { NavLink, Outlet } from "react-router-dom";
import TopBar from "./TopBar";

export default function DashboardLayout() {
    return (
        <div className="flex h-screen">
            <aside className="w-64 bg-zinc-100 dark:bg-zinc-900 p-6 space-y-4">
                <h1 className="text-2xl font-bold text-zinc-700 dark:text-white mb-4">🧭 Dashboard</h1>
                <nav className="flex flex-col gap-3">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-md text-left font-meidum ${
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-zinc-700 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'
                            }`
                        }
                    >
                         📅 Daily Task
                    </NavLink>
                    <NavLink
                        to="/weather"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-md text-left font-meidum ${
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-zinc-700 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'
                            }`
                        }
                    >
                            🌤️ Weather
                    </NavLink>
                    <NavLink
                        to="/quote"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-md text-left font-meidum ${
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-zinc-700 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'
                            }`
                        }
                    >
                            ✨ Quotes
                    </NavLink>
                </nav>
            </aside>
            
            <div className="flex-1 flex flex-col">
                <TopBar />
                <main className="flex-1 p-6 overflow-auto bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}