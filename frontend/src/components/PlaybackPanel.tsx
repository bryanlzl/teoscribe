/* eslint-disable no-irregular-whitespace */
import SlidingUpPanel from './SlideUpPanel';
import useAppViewState from '../stores/useAppViewState';
import AudioPlayer from 'react-h5-audio-player';
import useTheme from '../stores/useTheme';
import 'react-h5-audio-player/lib/styles.css';
import './styles/audioPlayerDarkStyles.css';

const PlaybackPanel = () => {
  const { appViewState, setAppViewState } = useAppViewState();
  const { theme } = useTheme();

  const disableSlidingPanel = (): void => {
    setAppViewState({
      ...appViewState,
      panels: { ...appViewState.panels, playbackPanel: { ...appViewState.panels.playbackPanel, isOpen: false } },
    });
  };

  return (
    <SlidingUpPanel
      offsetHeight={8.1}
      component="playbackPanel"
      stackedText={'Playback'}
      isStacked={appViewState.panels.playbackPanel.isStacked}
      isEnabled={appViewState.panels.playbackPanel.isOpen}
      setIsEnabled={disableSlidingPanel}
    >
      <div className="space-y-[1rem]">
        <span className="flex flex-row justify-center items-center mx-6 w-max-content py-[0.3rem] px-[0.5rem] align-center border-t-[0.15rem] border-b-[0.15rem] border-accent space-x-1 text-xl">
          Play it back & learn!
        </span>
        {/* Playback interface here */}
        <div className="card mx-3 bg-secondary bg-opacity-85 rounded-sm space-y-2">
          <div className="relative card-body px-3 py-1">
            <div className="flex flex-col items-center justify-center space-y-[2rem]">
              <div
                style={{ height: 'calc(85vh - 18rem)' }}
                className={`py-[0.25rem] w-[100%] text-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                } overflow-y-auto`}
              >
                <div className="text-left mx-[0.5rem]">
                  <span className="font-bold opacity-80">
                    谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么
                  </span>
                  <span className="opacity-55">
                    谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么
                    谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢
                    谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢
                    什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什
                    么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么
                    谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么
                  </span>
                </div>
              </div>

              {/* <textarea
                readOnly
                style={{ height: 'calc(85vh - 18rem)' }}
                className={`textarea py-[0.25rem] w-[100%] text-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                defaultValue="谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么
                  谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢
                  谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢
                  什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什
                  么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么
                  谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么​"
              /> */}
              <AudioPlayer
                src="http://example.com/audio.mp3"
                className={`custom-audio-player ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}
                showFilledVolume={false}
                showSkipControls={false}
              />
            </div>
          </div>
        </div>
      </div>
    </SlidingUpPanel>
  );
};

export default PlaybackPanel;
