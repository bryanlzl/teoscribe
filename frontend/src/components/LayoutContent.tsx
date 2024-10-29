import { useState } from 'react';
import useAppViewState from '../stores/useAppViewState';
import SelectLangConversion from './SelectLangConversion';
import { MicrophoneIcon } from '@heroicons/react/24/solid';
import { RingLoader } from 'react-spinners';
import useAxios from '../hooks/useAxios';
import { ITranscriptionResponse } from '../definitions/endpoints';
import useLangConversion from '../stores/useLangConversion';

const LayoutContent = (): JSX.Element => {
    const { appViewState, setAppViewState } = useAppViewState();
    const { setConversionResults } = useLangConversion();
    const [isLoadingAnimate, setIsLoadingAnimate] = useState<boolean>(false);

    const { sendRequest, responseData, error } = useAxios<ITranscriptionResponse>();

    // Just triggers sliding up of ResultsPanel
    const runTranscriptionModel = async (): Promise<void> => {
        await sendRequest({
            url: '/transcribe',
            method: 'POST',
            data: {
                audio_url: 'test_audio_url.com',
                dialect: 'teochew',
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    const handleTranscriptionResults = (transcriptionResult: string): void => {
        // Set conversion results
        setConversionResults({ transcriptionResult: transcriptionResult, translatedResult: null });
        // Set app state to trigger result panel
        setAppViewState({
            ...appViewState,
            panels: {
                ...appViewState.panels,
                resultPanel: { ...appViewState.panels.resultPanel, isOpen: true, isStacked: false },
            },
        });
    };

    const handleButtonClick = async (): Promise<void> => {
        await runTranscriptionModel();
        // After runTranscriptionModel completes, get either error or responseData
        const postAnimationDuration: number = responseData !== null ? 650 : 0;
        setTimeout(() => {
            if (responseData !== null) {
                handleTranscriptionResults(responseData.transcribed_text);
            } else if (error !== null) {
                setIsLoadingAnimate(false);
            }
            setTimeout(() => {
                setIsLoadingAnimate(false);
                console.log(responseData);
            }, postAnimationDuration);
        }, 1000);
    };

    return (
        <div className="flex flex-col justify-center items-center w-[100%] h-[100%]">
            <SelectLangConversion />
            <div className="flex flex-col justify-center items-center w-fit h-[100%] space-y-[1.5rem]">
                <h2 className="text-center opacity-75">Tap to speak</h2>
                <button className="btn btn-circle w-[15.5rem] h-[15.5rem] bg-primary" onClick={handleButtonClick}>
                    {isLoadingAnimate ? (
                        <RingLoader
                            loading={true}
                            color="#88B0A3"
                            size={165}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    ) : (
                        <MicrophoneIcon className="w-[50%] h-auto text-accent" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default LayoutContent;
