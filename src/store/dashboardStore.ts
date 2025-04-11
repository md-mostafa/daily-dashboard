import { create } from "zustand";

interface DashboardState {
    time: string;
    user: {
        name: string;
        avatar: string;
    };
    setTime: (newTime: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
    user: {
        name: "Mostafa",
        avatar: "https://i.pravater.cc/40?img=3",
    },
    setTime: (newTime: string) => set(() => ({ time: newTime }))
}))