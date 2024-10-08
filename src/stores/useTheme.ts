import { create } from 'zustand';
import { TThemeHook, IThemeStore } from '../types/storeTypes';

const useThemeStore = create<IThemeStore>((set) => ({
  theme: 'dark',
  setTheme: (theme: 'dark' | 'light') => set({ theme }),
}));

const useTheme = (): TThemeHook => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  return [theme, setTheme];
};

export default useTheme;
