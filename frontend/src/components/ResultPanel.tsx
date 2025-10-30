import { ClipboardDocumentIcon } from '@heroicons/react/24/solid';
import { useEffect, useRef, useState } from 'react';

import { LANGUAGE_CODE_DICT } from '../config/conversionDict';
import { ITranslationResponse } from '../config/endpoints';
import useAxios from '../hooks/useAxios';
import useAppViewState from '../stores/useAppViewState';
import useLangConversion from '../stores/useLangConversion';
import useTheme from '../stores/useTheme';
import SlidingUpPanel from './SlideUpPanel';

interface ICopyState {
    textTranscribed: boolean;
    textTranslated: boolean;
}

const ResultPanel = () => {
    const { conversionSettings, conversionResults, setConversionResults } = useLangConversion();
    const { appViewState, setAppViewState } = useAppViewState();
    const { theme } = useTheme();
    const { sendRequest, awaitResponse, responseData, error } = useAxios<ITranslationResponse>();

    const [copyState, setCopyState] = useState<ICopyState>({ textTranscribed: false, textTranslated: false });

    const textTranscribedRef = useRef<HTMLTextAreaElement | null>(null);
    const textTranslatedRef = useRef<HTMLTextAreaElement | null>(null);

    // ENDPOINT CALL: Send transcribed text to backed for translation to english (google translate v2)
    const sendForTranslation = async (): Promise<void> => {
        const sourceLanguageCode: string = LANGUAGE_CODE_DICT[conversionSettings.targetLanguage.toLowerCase()];
        const targetLanguageCode: string = LANGUAGE_CODE_DICT['english'];

        const formData = new FormData();
        formData.append('text', conversionResults.transcriptionResult as string);
        formData.append('source_language', sourceLanguageCode);
        formData.append('target_language', targetLanguageCode);

        sendRequest({
            url: '/translate',
            method: 'POST',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    };

    // CLIPBOARD METHOD: copies text into clipboard on click
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

    // ZUSTAND METHOD: closes/slides down result panel
    const disableSlidingPanel = (): void => {
        setAppViewState({
            ...appViewState,
            panels: {
                ...appViewState.panels,
                resultPanel: { ...appViewState.panels.resultPanel, isOpen: false, isStacked: false },
            },
        });
    };
    // ZUSTAND METHOD: open/slides up playback panel
    // const openPlaybackPanel = (): void => {
    //     setAppViewState({
    //         ...appViewState,
    //         panels: {
    //             ...appViewState.panels,
    //             playbackPanel: { ...appViewState.panels.playbackPanel, isOpen: true },
    //         },
    //     });
    //     setTimeout(() => {
    //         setAppViewState({
    //             ...appViewState,
    //             panels: {
    //                 ...appViewState.panels,
    //                 resultPanel: { ...appViewState.panels.resultPanel, isStacked: true },
    //                 playbackPanel: { ...appViewState.panels.playbackPanel, isOpen: true },
    //             },
    //         });
    //     }, 500);
    // };

    // Trigger initial translation endpoint call upon result panel load
    useEffect(() => {
        if (appViewState.panels.resultPanel.isOpen) {
            sendForTranslation();
        }
    }, [appViewState.panels.resultPanel.isOpen]);
    // Trigger to set translated text results in zustand conversionResults state
    useEffect(() => {
        if (!awaitResponse && (responseData !== null || error !== null)) {
            if (responseData !== null && responseData.success) {
                setConversionResults({ ...conversionResults, translatedResult: responseData.translated_text });
                console.log('/translation endpoint success');
            } else if (error !== null) {
                console.error('/translation endpoint failed');
            }
        }
    }, [awaitResponse, responseData, error]);
    // Trigger to reset conversion results once result panel closes/slides down
    useEffect(() => {
        if (!appViewState.panels.resultPanel.isOpen) {
            const delayTimeout = setTimeout(() => {
                setConversionResults({ recordingDuration: null, transcriptionResult: null, translatedResult: null });
            }, 300);
            return () => clearTimeout(delayTimeout);
        }
    }, [appViewState.panels.resultPanel.isOpen]);

    return (
        <SlidingUpPanel
            component="resultPanel"
            offsetHeight={5}
            stackedText={'Transcription Results'}
            isStacked={appViewState.panels.resultPanel.isStacked}
            isEnabled={appViewState.panels.resultPanel.isOpen}
            // isEnabled={appViewState.panels.resultPanel.isOpen}
            setIsEnabled={disableSlidingPanel}
        >
            <div className="space-y-[1rem]">
                <span className="flex flex-row justify-center items-center mx-6 w-max-content py-[0.3rem] px-[0.5rem] align-center border-t-[0.15rem] border-b-[0.15rem] border-accent space-x-1 text-xl">
                    <h2>Your Audio.</h2>
                    <h2 className="italic">TeoScribed.</h2>
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
                        <div className="absolute top-[3.15rem] flex flex-row justify-center items-center opacity-50 ml-[1rem] space-x-2">
                            <h3>Duration:</h3>
                            <p className="text-start">
                                {conversionResults.recordingDuration !== null
                                    ? Math.round(conversionResults.recordingDuration)
                                    : 'unknown'}
                            </p>
                            <p>secs</p>
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
                                style={{ height: 'calc(55svh - 15rem)' }}
                                className={`textarea py-[0.25rem] w-[100%] text-lg resize-none ${
                                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                }`}
                                defaultValue={
                                    conversionResults.transcriptionResult ? conversionResults.transcriptionResult : ''
                                }
                                ref={textTranscribedRef}
                            />
                        </div>
                    </div>
                    {/* <button
                        className="btn btn-xs mx-3 h-[2rem] w-max-content flex flex-row justify-center items-center bg-primary hover:bg-neutral border-none rounded-md text-center opacity-90"
                        onClick={openPlaybackPanel}
                    >
                        <PlayIcon className="h-[1.4rem] text-font" />
                        <p className="font-bold w-fit text-[0.95rem] text-font">Play Subtitled Recording</p>
                    </button> */}
                </div>
                {/* Translated English results */}
                <div className="card mx-3 bg-secondary bg-opacity-75 rounded-sm">
                    <div className="relative card-body px-3 py-2">
                        <h2 className="card-title text-lg font-normal">English translation</h2>
                        {/* Copy function */}
                        <div className="absolute top-[3.4rem] flex flex-row justify-center items-center opacity-50 ml-[1rem] space-x-2 z-10">
                            {conversionResults.translatedResult ? (
                                <h3>Translated by Google</h3>
                            ) : (
                                <h3 className="animate-pulse">Translating to english...</h3>
                            )}
                        </div>
                        <div className="absolute top-[3.15rem] right-[2rem] z-10">
                            {!conversionResults.translatedResult ? (
                                <></>
                            ) : copyState.textTranslated ? (
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
                            className={`relative pt-[2rem] px-[0.05rem] w-[100%] h-[100%] rounded-md ${
                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                            }`}
                        >
                            <textarea
                                readOnly
                                style={{ height: 'calc(51svh - 13rem)' }}
                                className={`textarea w-[100%] rounded-md text-lg resize-none ${
                                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                } `}
                                defaultValue={
                                    conversionResults.translatedResult ? conversionResults.translatedResult : ''
                                }
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
