import { ILangConversionSettings } from './langConversionTypes';

// Store types
export interface IThemeStore {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}
export interface ILangConversionStore {
  conversionSettings: ILangConversionSettings;
  setConversionSettings: (conversionSettings: ILangConversionSettings) => void;
}

// Zustand hook types
export type TThemeHook = ['dark' | 'light', (theme: 'dark' | 'light') => void];
export type TLangConversionHook = [ILangConversionSettings, (conversionSettings: ILangConversionSettings) => void];
