export interface IAppViewState {
  isTranscribing: boolean;
  isTranslating: boolean;
  transcriptionResult: boolean;
  transllationResult: boolean;
  panels: {
    resultPanel: boolean;
    playbackPanel: boolean;
  };
}
