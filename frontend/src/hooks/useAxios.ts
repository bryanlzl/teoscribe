import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useCallback, useState } from 'react';
import { API_BASE_URL } from '../config/env';

type TUseAxiosReturn<T> = {
    sendRequest: (config: AxiosRequestConfig) => Promise<void>;
    awaitResponse: boolean;
    error: string | null;
    responseData: T | null;
};

const useAxios = <T>(): TUseAxiosReturn<T> => {
    const [awaitResponse, setAwaitResponse] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [responseData, setResponseData] = useState<T | null>(null);

    // const baseConfig: AxiosRequestConfig = { url: API_BASE_URL + ':' + API_PORT };
    const baseConfig: AxiosRequestConfig = { url: API_BASE_URL };

    const sendRequest = useCallback(
        async (config: AxiosRequestConfig): Promise<void> => {
            setAwaitResponse(true);
            setError(null);
            setResponseData(null);
            try {
                const adjustedConfig: AxiosRequestConfig = {
                    ...config,
                    url: `${baseConfig.url}${config.url ?? ''}`,
                };
                console.log(`${baseConfig.url}${config.url ?? ''}`);
                const response: AxiosResponse<T> = await axios(adjustedConfig);
                setResponseData(response.data);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.message);
                } else {
                    setError('An unexpected error occurred');
                }
            } finally {
                setAwaitResponse(false);
            }
        },
        [baseConfig.url],
    );

    return { sendRequest, awaitResponse, error, responseData };
};

export default useAxios;
