import { create } from 'zustand';
import { ILangConversionStore, TLangConversionHook } from '../types/storeTypes';
import { ILangConversionSettings } from '../types/langConversionTypes';

const useLangConversionStore = create<ILangConversionStore>((set) => ({
  conversionSettings: {
    mode: 'transcription',
    sourceLanguage: 'Teochew',
    targetLanguage: 'English',
    inputFormat: 'spoken',
    outputFormat: 'text',
  },
  setConversionSettings: (conversionSettings: ILangConversionSettings) => set({ conversionSettings }),
}));

const useLangConversion = (): TLangConversionHook => {
  const conversionSettings = useLangConversionStore((state) => state.conversionSettings);
  const setConversionSettings = useLangConversionStore((state) => state.setConversionSettings);
  return [conversionSettings, setConversionSettings];
};

export default useLangConversion;
