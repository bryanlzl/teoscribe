import { create } from 'zustand';
import { ILangConversionStore } from '../types/storeTypes';
import { ILangConversionSettings } from '../types/langConversionTypes';

const useLangConversionStore = create<ILangConversionStore>((set) => ({
    conversionSettings: {
        mode: 'transcription',
        sourceLanguage: 'Teochew',
        targetLanguage: 'Chinese',
        inputFormat: 'audio',
        outputFormat: 'text',
    },
    setConversionSettings: (conversionSettings: ILangConversionSettings) => set({ conversionSettings }),
}));

const useLangConversion = (): ILangConversionStore => {
    const conversionSettings = useLangConversionStore((state) => state.conversionSettings);
    const setConversionSettings = useLangConversionStore((state) => state.setConversionSettings);
    return { conversionSettings, setConversionSettings };
};

export default useLangConversion;
