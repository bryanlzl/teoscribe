import { useEffect, useState } from 'react';
import useAppViewState from '../stores/useAppViewState';
import SelectLangConversion from './SelectLangConversion';
import { MicrophoneIcon } from '@heroicons/react/24/solid';
import { RingLoader } from 'react-spinners';
import useAxios from '../hooks/useAxios';
import { ITranscriptionResponse } from '../definitions/endpoints';
import useLangConversion from '../stores/useLangConversion';
import { useAudioRecorder } from 'react-audio-voice-recorder';

const LayoutContent = (): JSX.Element => {
    const [isLoadingAnimate, setIsLoadingAnimate] = useState<boolean>(false);

    const { appViewState, setAppViewState } = useAppViewState();
    const { setConversionResults } = useLangConversion();
    const { sendRequest, awaitResponse, responseData, error } = useAxios<ITranscriptionResponse>();

    const { startRecording, stopRecording, recordingBlob, isRecording, recordingTime } = useAudioRecorder();

    const toggleRecording = async (): Promise<void> => {
        if (!isRecording) {
            startRecording();
            setIsLoadingAnimate(true);
        } else {
            stopRecording();
            handleTranscription();
        }
    };

    // convert blob to mp3 file -> send mp3 to transcribe endpoint
    const handleTranscription = (): void => {
        const formData = new FormData();
        formData.append('dialect', 'teochew');
        formData.append('audio_blob', recordingBlob as Blob, 'audio.webm');

        sendRequest({
            url: '/transcribe',
            method: 'POST',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    };

    const handleTranscriptionResults = (transcriptionResult: string): void => {
        // Set conversion results
        setConversionResults({
            recordingDuration: recordingTime,
            transcriptionResult: transcriptionResult,
            translatedResult: null,
        });
        // Set app state to trigger result panel
        setAppViewState({
            ...appViewState,
            panels: {
                ...appViewState.panels,
                resultPanel: { ...appViewState.panels.resultPanel, isOpen: true, isStacked: false },
            },
        });
    };

    // Await for recorded audio to become blob
    useEffect(() => {
        if (recordingBlob instanceof Blob) {
            handleTranscription();
        }
    }, [recordingBlob]);

    // Await and handle /transcribe endpoint response
    useEffect(() => {
        // console.log('asdasdasdasdasd');
        if (!awaitResponse && (responseData !== null || error !== null)) {
            // console.log('bring up loading');
            const postAnimationDuration: number = responseData !== null ? 650 : 0;
            setTimeout(() => {
                if (responseData !== null) {
                    // console.log('repsonse successful');
                    handleTranscriptionResults(responseData.transcribed_text);
                } else if (error !== null) {
                    setIsLoadingAnimate(false);
                    console.error('transcription endpoint failed');
                }
                setTimeout(() => {
                    setIsLoadingAnimate(false);
                }, postAnimationDuration);
            }, 500);
        }
    }, [awaitResponse, responseData, error]);

    return (
        <div className="flex flex-col justify-center items-center w-[100%] h-[100%]">
            <SelectLangConversion />
            <div className="flex flex-col justify-center items-center w-fit h-[100%] space-y-[1.5rem]">
                <h2 className="text-center opacity-75">Tap to speak</h2>
                <button className="btn btn-circle w-[15.5rem] h-[15.5rem] bg-primary" onClick={toggleRecording}>
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
