import useAppViewState from '../stores/useAppViewState';
import SelectLangConversion from './SelectLangConversion';
import { MicrophoneIcon } from '@heroicons/react/24/solid';

const LayoutContent = (): JSX.Element => {
  const { appViewState, setAppViewState } = useAppViewState();

  // Just triggers ResultsPanel
  const runTranscriptionModel = (): void => {
    setAppViewState({ ...appViewState, panels: { ...appViewState.panels, resultPanel: true } });
  };

  return (
    <div className="flex flex-col justify-center items-center w-[100%] h-[100%]">
      <SelectLangConversion />
      <div
        className="flex flex-col justify-center items-center w-fit h-[100%] space-y-[1.5rem]"
        onClick={runTranscriptionModel}
      >
        <h2 className="text-center opacity-75">Tap to speak</h2>
        <button className="btn btn-circle w-[15.5rem] h-[15.5rem] bg-primary">
          <MicrophoneIcon className="w-[50%] h-auto text-accent" />
        </button>
      </div>
    </div>
  );
};

export default LayoutContent;
