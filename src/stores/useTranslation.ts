import { create } from 'zustand';
import { ILangConversionStore } from '../types/storeTypes';
import { ILangConversionSettings } from '../types/langConversionTypes';

const useLangConversion = create<ILangConversionStore>((set) => ({
  conversionSettings: {
    mode: 'transcription',
    sourceLanguage: 'Teochew',
    targetLanguage: 'English',
    inputFormat: 'audio',
    outputFormat: 'text',
  },
  setConversionSettings: (conversionSettings: ILangConversionSettings) => set({ conversionSettings }),
}));

export default useLangConversion;
