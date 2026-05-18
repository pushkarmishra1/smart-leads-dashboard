import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      isDark: false,
      toggleTheme: () => {
        const newDark = !get().isDark;
        // Apply class to <html> element for Tailwind dark mode
        document.documentElement.classList.toggle('dark', newDark);
        set({ isDark: newDark });
      },
    }),
    { name: 'theme-storage' }
  )
);

/**
 * Initializes dark mode from persisted state on app load.
 * Call this once in main.tsx before rendering.
 */
export const initTheme = (): void => {
  const stored = localStorage.getItem('theme-storage');
  if (stored) {
    const { state } = JSON.parse(stored) as { state: { isDark: boolean } };
    document.documentElement.classList.toggle('dark', state.isDark);
  }
};
