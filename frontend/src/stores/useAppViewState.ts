import { create } from 'zustand';
import { IAppViewStateStore } from '../types/storeTypes';
import { IAppViewState } from '../types/appViewStateTypes';

const useAppViewStateStore = create<IAppViewStateStore>((set) => ({
  appViewState: {
    isTranscribing: false,
    isTranslating: false,
    transcriptionResult: false,
    transllationResult: false,
    panels: { resultPanel: false, playbackPanel: false },
  },
  setAppViewState: (appViewState: IAppViewState) => set({ appViewState }),
}));

const useAppViewState = (): IAppViewStateStore => {
  const appViewState = useAppViewStateStore((state) => state.appViewState);
  const setAppViewState = useAppViewStateStore((state) => state.setAppViewState);
  return { appViewState, setAppViewState };
};

export default useAppViewState;
