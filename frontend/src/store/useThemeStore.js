import { create } from "zustand";

const getInitialThemeMode = () => {
  if (typeof window === "undefined") return "light";

  const savedMode = localStorage.getItem("themeMode");
  if (savedMode === "light" || savedMode === "dark") {
    return savedMode;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useThemeStore = create((set) => ({
  themeMode: getInitialThemeMode(),

  setThemeMode: (mode) => {
    if (mode !== "light" && mode !== "dark") return;
    set({ themeMode: mode });
    localStorage.setItem("themeMode", mode);
  },

  toggleThemeMode: () =>
    set((state) => {
      const nextMode = state.themeMode === "dark" ? "light" : "dark";
      localStorage.setItem("themeMode", nextMode);
      return { themeMode: nextMode };
    }),
}));
