export interface ILangConversionSettings {
    mode: string;
    sourceLanguage: string;
    targetLanguage: string;
    inputFormat: string;
    outputFormat: string;
}

export interface IConversionResults {
    recordingDuration: number | null;
    transcriptionResult: string | null;
    translatedResult: string | null;
}

export interface ILangConversionLibrary {
    [sourceLanguage: string]: { [targetLanguage: string]: string[] };
}

export interface ILangCodeDict {
    [languageFullName: string]: string;
}
