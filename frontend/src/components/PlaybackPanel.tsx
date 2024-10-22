import SlidingUpPanel from './SlideUpPanel';
import useAppViewState from '../stores/useAppViewState';

const PlaybackPanel = () => {
  const { appViewState, setAppViewState } = useAppViewState();

  const disableSlidingPanel = (): void => {
    setAppViewState({
      ...appViewState,
      panels: { ...appViewState.panels, playbackPanel: { ...appViewState.panels.playbackPanel, isOpen: false } },
    });
  };

  return (
    <SlidingUpPanel
      offsetHeight={8.1}
      stackedText={'Playback'}
      isStacked={appViewState.panels.playbackPanel.isStacked}
      isEnabled={appViewState.panels.playbackPanel.isOpen}
      setIsEnabled={disableSlidingPanel}
    >
      <div className="space-y-[1rem]">
        <span className="flex flex-row justify-center items-center mx-6 w-max-content py-[0.3rem] px-[0.5rem] align-center border-t-[0.15rem] border-b-[0.15rem] border-accent space-x-1 text-xl">
          <h2>Your Audio.</h2> <h2 className="italic">TeoScribed.</h2>
        </span>
        {/* Target transcription results */}
        <div className="card mx-3 bg-secondary bg-opacity-85 rounded-sm space-y-2"></div>
      </div>
    </SlidingUpPanel>
  );
};

export default PlaybackPanel;
