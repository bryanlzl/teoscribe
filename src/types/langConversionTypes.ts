export interface ILangConversionSettings {
  mode: string;
  sourceLanguage: string;
  targetLanguage: string;
  inputFormat: string;
  outputFormat: string;
}

export interface ITranslationLibrary {
  [language: string]: string[];
}
