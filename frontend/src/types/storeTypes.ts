import { IAppViewState } from './appViewStateTypes';
import { ILangConversionSettings } from './langConversionTypes';

// Store types
export interface IThemeStore {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}
export interface IAppViewStateStore {
  appViewState: IAppViewState;
  setAppViewState: (appViewState: IAppViewState) => void;
}
export interface ILangConversionStore {
  conversionSettings: ILangConversionSettings;
  setConversionSettings: (conversionSettings: ILangConversionSettings) => void;
}

// Zustand hook types
export type TThemeHook = {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
};
export type TLangConversionHook = {
  conversionSettings: ILangConversionSettings;
  setConversionSettings: (conversionSettings: ILangConversionSettings) => void;
};
