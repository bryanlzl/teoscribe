export interface IAppViewState {
    isTranscribing: boolean;
    isTranslating: boolean;
    transcriptionResult: boolean;
    transllationResult: boolean;
    panels: {
        resultPanel: { isStacked: boolean; isOpen: boolean };
        playbackPanel: { isStacked: boolean; isOpen: boolean };
    };
}
