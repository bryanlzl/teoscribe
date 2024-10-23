import { useState } from 'react';
import useAppViewState from '../stores/useAppViewState';
import SelectLangConversion from './SelectLangConversion';
import { MicrophoneIcon } from '@heroicons/react/24/solid';
import { RingLoader } from 'react-spinners';

const LayoutContent = (): JSX.Element => {
  const { appViewState, setAppViewState } = useAppViewState();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleButtonClick = (): void => {
    setIsLoading(true);
    setTimeout(() => {
      runTranscriptionModel();
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }, 25);
  };

  // Just triggers sliding up of ResultsPanel
  const runTranscriptionModel = (): void => {
    setAppViewState({
      ...appViewState,
      panels: {
        ...appViewState.panels,
        resultPanel: { ...appViewState.panels.resultPanel, isOpen: true, isStacked: false },
      },
    });
  };

  return (
    <div className="flex flex-col justify-center items-center w-[100%] h-[100%]">
      <SelectLangConversion />
      <div className="flex flex-col justify-center items-center w-fit h-[100%] space-y-[1.5rem]">
        <h2 className="text-center opacity-75">Tap to speak</h2>
        <button className="btn btn-circle w-[15.5rem] h-[15.5rem] bg-primary" onClick={handleButtonClick}>
          {isLoading ? (
            <RingLoader loading={true} color="#88B0A3" size={165} aria-label="Loading Spinner" data-testid="loader" />
          ) : (
            <MicrophoneIcon className="w-[50%] h-auto text-accent" />
          )}
        </button>
      </div>
    </div>
  );
};

export default LayoutContent;
