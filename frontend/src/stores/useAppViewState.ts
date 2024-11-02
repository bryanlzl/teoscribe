import { create } from 'zustand';
import { IAppViewState } from '../types/appViewStateTypes';
import { IAppViewStateStore } from '../types/storeTypes';

const useAppViewStateStore = create<IAppViewStateStore>((set) => ({
    appViewState: {
        isTranscribing: false,
        isTranslating: false,
        transcriptionResult: false,
        transllationResult: false,
        panels: {
            resultPanel: { isStacked: false, isOpen: false },
            playbackPanel: { isStacked: false, isOpen: false },
        },
    },
    setAppViewState: (appViewState: IAppViewState) => set({ appViewState }),
}));

const useAppViewState = (): IAppViewStateStore => {
    const appViewState = useAppViewStateStore((state) => state.appViewState);
    const setAppViewState = useAppViewStateStore((state) => state.setAppViewState);
    return { appViewState, setAppViewState };
};

export default useAppViewState;
