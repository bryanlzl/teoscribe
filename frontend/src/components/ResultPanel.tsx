import { useRef, useState } from 'react';
import { ClipboardDocumentIcon, PlayIcon } from '@heroicons/react/24/solid';

import useLangConversion from '../stores/useLangConversion';
import useTheme from '../stores/useTheme';
import SlidingUpPanel from './SlideUpPanel';
import useAppViewState from '../stores/useAppViewState';

interface ICopyState {
    textTranscribed: boolean;
    textTranslated: boolean;
}

const ResultPanel = () => {
    const { conversionSettings, conversionResults } = useLangConversion();
    const { appViewState, setAppViewState } = useAppViewState();
    const { theme } = useTheme();

    const [copyState, setCopyState] = useState<ICopyState>({ textTranscribed: false, textTranslated: false });

    const textTranscribedRef = useRef<HTMLTextAreaElement | null>(null);
    const textTranslatedRef = useRef<HTMLTextAreaElement | null>(null);

    const handleCopy = (textField: string, inputString: string): void => {
        navigator.clipboard
            .writeText(inputString)
            .then(() => {
                setCopyState((prev) => {
                    return { ...prev, [textField]: true };
                });
                setTimeout(
                    () =>
                        setCopyState((prev) => {
                            return { ...prev, [textField]: false };
                        }),
                    1500,
                );
            })
            .catch((err) => {
                console.error('Failed to copy text: ', err);
            });
    };

    const disableSlidingPanel = (): void => {
        setAppViewState({
            ...appViewState,
            panels: {
                ...appViewState.panels,
                resultPanel: { ...appViewState.panels.resultPanel, isOpen: false, isStacked: false },
            },
        });
    };

    const openPlaybackPanel = (): void => {
        setAppViewState({
            ...appViewState,
            panels: {
                ...appViewState.panels,
                playbackPanel: { ...appViewState.panels.playbackPanel, isOpen: true },
            },
        });
        setTimeout(() => {
            setAppViewState({
                ...appViewState,
                panels: {
                    ...appViewState.panels,
                    resultPanel: { ...appViewState.panels.resultPanel, isStacked: true },
                    playbackPanel: { ...appViewState.panels.playbackPanel, isOpen: true },
                },
            });
        }, 500);
    };

    return (
        <SlidingUpPanel
            component="resultPanel"
            offsetHeight={5}
            stackedText={'Transcription Results'}
            isStacked={appViewState.panels.resultPanel.isStacked}
            isEnabled={appViewState.panels.resultPanel.isOpen}
            setIsEnabled={disableSlidingPanel}
        >
            <div className="space-y-[1rem]">
                <span className="flex flex-row justify-center items-center mx-6 w-max-content py-[0.3rem] px-[0.5rem] align-center border-t-[0.15rem] border-b-[0.15rem] border-accent space-x-1 text-xl">
                    <h2>Your Audio.</h2> <h2 className="italic">TeoScribed.</h2>
                </span>
                {/* Target transcription results */}
                <div className="card mx-3 bg-secondary bg-opacity-85 rounded-sm space-y-2">
                    <div className="relative card-body px-3 py-1">
                        <span className="flex flex-row justify-between items-center">
                            <h2 className="card-title text-lg font-normal">
                                {conversionSettings.targetLanguage} (transcribed){' '}
                            </h2>
                        </span>
                        {/* Copy function */}
                        <div className="absolute top-[3.15rem] flex flex-row justify-center items-center opacity-80 ml-[1rem] space-x-2">
                            <h3>Duration:</h3>
                            <p className="text-start">
                                {conversionResults.recordingDuration !== null
                                    ? conversionResults.recordingDuration
                                    : 'unknown'}
                            </p>
                        </div>
                        <div className="absolute top-[3.15rem] right-[2rem]">
                            {copyState.textTranscribed ? (
                                <p className="font-bold text-md text-accent text-end self-end">Copied!</p>
                            ) : (
                                <ClipboardDocumentIcon
                                    onClick={() => {
                                        if (textTranscribedRef.current) {
                                            handleCopy('textTranscribed', textTranscribedRef.current.defaultValue);
                                        }
                                    }}
                                    className="h-[1.5rem] cursor-pointer self-end"
                                />
                            )}
                        </div>
                        {/* Transcription results */}
                        <div
                            className={`pt-[2.5rem] px-[0.05rem] w-[100%] h-[100%] rounded-md ${
                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                            }`}
                        >
                            <textarea
                                readOnly
                                className={`textarea h-[25vh] py-[0.25rem] w-[100%] text-lg ${
                                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                }`}
                                defaultValue={
                                    conversionResults.transcriptionResult !== null
                                        ? conversionResults.transcriptionResult
                                        : ''
                                }
                                ref={textTranscribedRef}
                            />
                        </div>
                    </div>
                    <button
                        className="btn btn-xs mx-3 h-[2rem] w-max-content flex flex-row justify-center items-center bg-primary hover:bg-neutral border-none rounded-md text-center opacity-90"
                        onClick={openPlaybackPanel}
                    >
                        <PlayIcon className="h-[1.4rem] text-font" />
                        <p className="font-bold w-fit text-[0.95rem] text-font">Play Subtitled Recording</p>
                    </button>
                </div>
                {/* Translated English results */}
                <div className="card mx-3 bg-secondary bg-opacity-75 rounded-sm">
                    <div className="card-body px-3 py-2">
                        <h2 className="card-title text-lg font-normal">English (translated) </h2>
                        {/* Copy function */}
                        <div className="absolute top-[3.4rem] flex flex-row justify-center items-center opacity-80 ml-[1rem] space-x-2">
                            <h3>Translation from {conversionSettings.targetLanguage}</h3>
                        </div>
                        <div className="absolute top-[3.15rem] right-[2rem]">
                            {copyState.textTranslated ? (
                                <p className="font-bold text-md text-accent text-end self-end">Copied!</p>
                            ) : (
                                <ClipboardDocumentIcon
                                    onClick={() => {
                                        if (textTranslatedRef.current) {
                                            handleCopy('textTranslated', textTranslatedRef.current.defaultValue);
                                        }
                                    }}
                                    className="h-[1.5rem] cursor-pointer self-end"
                                />
                            )}
                        </div>
                        <div
                            className={`pt-[2rem] px-[0.05rem] w-[100%] h-[100%] rounded-md ${
                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                            }`}
                        >
                            <textarea
                                readOnly
                                className={`textarea h-[24vh] w-[100%] rounded-md text-lg ${
                                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                }`}
                                defaultValue="Thank you why Thank you why Thank you why Thank you why Thank you why Thank you why Thank you 
                    why Thank you why Thank you why Thank you why Thank you why Thank you why Thank you why Thank you why Thank 
                    you why Thank you why Thank you why Thank you why Thank you why Thank you why Thank you why Thank you why 
                    Thank you why Thank you why Thank you why Thank you why Thank you why Thank you why Thank you why Thank 
                    you why Thank you why Thank you why Thank you why Thank you why Thank you why Thank you why Thank you why ​"
                                ref={textTranslatedRef}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </SlidingUpPanel>
    );
};

export default ResultPanel;
