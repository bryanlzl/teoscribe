import { ILangConversionSettings } from './langConversionTypes';

export interface IThemeStore {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export type TThemeHook = ['dark' | 'light', (theme: 'dark' | 'light') => void];

export interface ILangConversionStore {
  conversionSettings: ILangConversionSettings;
  setConversionSettings: (conversionSettings: ILangConversionSettings) => void;
}
