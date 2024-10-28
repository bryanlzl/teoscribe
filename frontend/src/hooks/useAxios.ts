import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_PORT } from '../config/env';

type TUseAxiosReturn<T> = {
    sendRequest: (config: AxiosRequestConfig) => Promise<void>;
    loading: boolean;
    error: string | null;
    responseData: T | null;
};

const useAxios = <T>(): TUseAxiosReturn<T> => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [responseData, setResponseData] = useState<T | null>(null);

    const baseConfig: AxiosRequestConfig = { url: API_BASE_URL + ':' + API_PORT };

    const sendRequest = useCallback(async (config: AxiosRequestConfig): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const adjustedConfig: AxiosRequestConfig = {
                ...config,
                url: `${baseConfig.url}${config.url ?? ''}`,
            };
            const response: AxiosResponse<T> = await axios(adjustedConfig);
            setResponseData(response.data);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    return { sendRequest, loading, error, responseData };
};

export default useAxios;
