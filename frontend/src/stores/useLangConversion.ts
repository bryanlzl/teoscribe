import { create } from 'zustand';
import { IConversionResults, ILangConversionSettings } from '../types/langConversionTypes';
import { ILangConversionStore } from '../types/storeTypes';

const useLangConversionStore = create<ILangConversionStore>((set) => ({
    conversionSettings: {
        mode: 'transcription',
        sourceLanguage: 'Teochew',
        targetLanguage: 'Chinese',
        inputFormat: 'audio',
        outputFormat: 'text',
        model: 'standard',
    },
    setConversionSettings: (conversionSettings: ILangConversionSettings) => set({ conversionSettings }),
    conversionResults: {
        recordingDuration: null,
        transcriptionResult: null,
        translatedResult: null,
    },
    setConversionResults: (conversionResults: IConversionResults) => set({ conversionResults }),
}));

const useLangConversion = (): ILangConversionStore => {
    const conversionSettings = useLangConversionStore((state) => state.conversionSettings);
    const setConversionSettings = useLangConversionStore((state) => state.setConversionSettings);
    const conversionResults = useLangConversionStore((state) => state.conversionResults);
    const setConversionResults = useLangConversionStore((state) => state.setConversionResults);
    return { conversionSettings, setConversionSettings, conversionResults, setConversionResults };
};

export default useLangConversion;
