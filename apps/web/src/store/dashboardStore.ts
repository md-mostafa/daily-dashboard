import { create } from "zustand";

interface DashboardState {
    time: string;
    user: {
        name: string;
        avatar: string;
    };
    theme: 'light' | 'dark';
    setTime: (newTime: string) => void;
    toggleTheme: () => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
    user: {
        name: "Mostafa",
        avatar: "https://i.pravatar.cc/40?img=3",
    },
    theme: localStorage.getItem('theme') === 'dark' ? 'dark' : 'light',
    setTime: (newTime: string) => set(() => ({ time: newTime })),
    toggleTheme: () => 
        set((state) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            return { theme: newTheme }
    }),
}));