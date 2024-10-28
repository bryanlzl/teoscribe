export interface ILangConversionSettings {
    mode: string;
    sourceLanguage: string;
    targetLanguage: string;
    inputFormat: string;
    outputFormat: string;
}

export interface ILangConversionLibrary {
    [sourceLanguage: string]: { [targetLanguage: string]: string[] };
}
