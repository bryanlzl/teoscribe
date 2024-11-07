import html
import os

import torch
import torchaudio
import torchaudio.transforms as T
from peft import PeftConfig, PeftModel
from transformers import (
    AutomaticSpeechRecognitionPipeline,
    WhisperForConditionalGeneration,
    WhisperProcessor,
    WhisperTokenizer,
)

tokenizer = WhisperTokenizer.from_pretrained("openai/whisper-small")
mandarin_token_id = tokenizer.convert_tokens_to_ids("<|zh|>")
forced_decoder_ids = [[0, mandarin_token_id]]

# Preload the pipeline
def load_pipeline():
    peft_path = "C:/Users/Bryan/Desktop/projects/teochew-learning-app/backend/model/model_semantics_clean"
    peft_config = PeftConfig.from_pretrained(peft_path)
    model = WhisperForConditionalGeneration.from_pretrained(peft_config.base_model_name_or_path, device_map="auto")
    model = PeftModel.from_pretrained(model, peft_path)
    tokenizer = WhisperTokenizer.from_pretrained("openai/whisper-small", language="zh", task="transcribe")
    processor = WhisperProcessor.from_pretrained("openai/whisper-small", language="zh", task="transcribe")
    pipeline = AutomaticSpeechRecognitionPipeline(model=model, tokenizer=tokenizer, feature_extractor=processor.feature_extractor)
    return pipeline

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
        processor = WhisperProcessor.from_pretrained("openai/whisper-small", language="zh", task="transcribe")
        forced_decoder_ids = processor.get_decoder_prompt_ids(language="zh", task="transcribe")
        transcribed_text = pipeline(waveform.numpy(), generate_kwargs={"forced_decoder_ids": forced_decoder_ids}, max_new_tokens=128)["text"]
        decoded_transcribed_text = html.unescape(transcribed_text)
        return decoded_transcribed_text
    
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

