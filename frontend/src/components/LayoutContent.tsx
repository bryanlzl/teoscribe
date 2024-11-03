import { useEffect, useRef, useState } from 'react';

import { ITranscriptionResponse } from '../definitions/endpoints';
import useAxios from '../hooks/useAxios';
import useAppViewState from '../stores/useAppViewState';
import useLangConversion from '../stores/useLangConversion';
import SelectLangConversion from './SelectLangConversion';

import { MicrophoneIcon } from '@heroicons/react/24/solid';
import { RingLoader } from 'react-spinners';
import RecordRTC from 'recordrtc';

const LayoutContent = (): JSX.Element => {
    const { appViewState, setAppViewState } = useAppViewState();
    const { setConversionResults } = useLangConversion();
    const { sendRequest, awaitResponse, responseData, error } = useAxios<ITranscriptionResponse>();

    const [isRecordingAnimate, setIsRecordingAnimate] = useState<boolean>(false);
    const [isTranscribingAnimate, setIsTranscribingAnimate] = useState<boolean>(false);

    // --------- recordRTC hooks --------- //
    const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const audioRecorderRef = useRef<RecordRTC | null>(null);
    // --------- recordRTC end -----------//

    // RECORDRTC METHODS: To start/stop/get recorded audio in .wav (PCM codec)
    const startAudioRecording = async (): Promise<void> => {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = audioStream;
        audioRecorderRef.current = new RecordRTC(audioStream, {
            type: 'audio',
            mimeType: 'audio/wav',
            recorderType: RecordRTC.StereoAudioRecorder,
            desiredSampRate: 44100,
        });
        audioRecorderRef.current.startRecording();
    };
    const stopAudioRecording = (): void => {
        if (audioRecorderRef.current) {
            audioRecorderRef.current.stopRecording(() => {
                setRecordedAudioBlob(audioRecorderRef.current!.getBlob());
            });
        }
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach((track) => track.stop());
            audioStreamRef.current = null;
        }
    };
    const getAudioDuration = async (audioBlob: Blob): Promise<number> => {
        const audioContext = new AudioContext();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer.duration;
    };

    // ENDPOINT CALL: Send .wav audio blob to backend for transcription
    const sendForTranscription = (): void => {
        const formData = new FormData();
        formData.append('dialect', 'teochew');
        formData.append('audio_blob', recordedAudioBlob as Blob, 'audio.wav');

        sendRequest({
            url: '/transcribe',
            method: 'POST',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    };

    // REACT HOOK METHOD: Initiate/stop audio recording -> transcription sequence
    const toggleRecording = async (): Promise<void> => {
        if (!isRecordingAnimate) {
            startAudioRecording();
            setIsRecordingAnimate(true);
        } else {
            stopAudioRecording();
            // Send to backend for model to transcribe audio input
        }
    };

    // ZUSTAND METHOD: Save transcription results and app view state in zustand stores
    const handleTranscriptionSaves = async (transcriptionResult: string): Promise<void> => {
        const recordDuration: number = await getAudioDuration(recordedAudioBlob as Blob);
        // Set conversion results
        setConversionResults({
            recordingDuration: recordDuration,
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
    // Trigger transcription backend call
    useEffect(() => {
        if ((recordedAudioBlob as Blob) !== null) {
            sendForTranscription();
            setIsRecordingAnimate(false);
            setIsTranscribingAnimate(true);
        }
    }, [recordedAudioBlob]);
    // Trigger after receiving response from /transcribe endpoint
    useEffect(() => {
        if (!awaitResponse && (responseData !== null || error !== null)) {
            const postAnimationDuration: number = responseData !== null ? 650 : 0;
            setTimeout(() => {
                if (responseData !== null) {
                    handleTranscriptionSaves(responseData.transcribed_text);
                    console.log('/transcription endpoint success');
                } else if (error !== null) {
                    setIsTranscribingAnimate(false);
                    console.error('/transcription endpoint failed');
                }
                setTimeout(() => {
                    setIsTranscribingAnimate(false);
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
                    {isRecordingAnimate ? (
                        <span className="loading loading-ring w-[85%]" />
                    ) : isTranscribingAnimate ? (
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

// TO DOWNLOAD .WAV BLOB //
// const downloadRecordedBlob = (): void => {
//     invokeSaveAsDialog(recordedAudioBlob as Blob);
// };
