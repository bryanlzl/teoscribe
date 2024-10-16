import { create } from 'zustand';
import { IThemeStore } from '../types/storeTypes';

const useThemeStore = create<IThemeStore>((set) => ({
  theme: 'dark',
  setTheme: (theme: 'dark' | 'light') => set({ theme }),
}));

// Change to return an object
const useTheme = (): IThemeStore => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  return { theme, setTheme }; // Return an object
};

export default useTheme;
