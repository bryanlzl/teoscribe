import os

import torch
import torchaudio
import torchaudio.transforms as T
from transformers import WhisperTokenizer

tokenizer = WhisperTokenizer.from_pretrained("openai/whisper-small")
mandarin_token_id = tokenizer.convert_tokens_to_ids("<|zh|>")
forced_decoder_ids = [[0, mandarin_token_id]]

def predict_api(pipeline, audio_path):
    """
    Used for API calls. Should preload pipeline, to avoid loading pipeline at every single API call.
    """
    try:
        waveform, sampling_rate = torchaudio.load(audio_path)
        waveform = torch.mean(waveform, dim=0)
        if sampling_rate != 16000:
            print("Resampling audio to 16kHz")
            resampler = T.Resample(sampling_rate, 16000, dtype=waveform.dtype)
            waveform = resampler(waveform)
        text = pipeline(waveform.numpy(), generate_kwargs={"forced_decoder_ids": forced_decoder_ids}, max_new_tokens=128)["text"]
        return text
    
    except Exception as e:
        error_message = f"Error in predict_api: {str(e)}"
        print(error_message)
        
    finally:
        if os.path.exists(audio_path):
            try:
                os.remove(audio_path)
                print(f"Temporary file {audio_path} deleted.")
            except Exception as e:
                print(f"Error deleting file {audio_path}: {e}")

