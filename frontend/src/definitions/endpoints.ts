export interface ITranscriptionResponse {
    success: boolean;
    transcribed_text: string;
}

export interface ITranslationResponse {
    success: boolean;
    original_text: string;
    translated_text: string;
    source_language: string;
    target_language: string;
}
