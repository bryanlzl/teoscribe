from fastapi import APIRouter, UploadFile, File
from transformers import WhisperForConditionalGeneration, WhisperTokenizer, WhisperProcessor, AutomaticSpeechRecognitionPipeline
from peft import PeftConfig, PeftModel
import torch
import torchaudio

router = APIRouter()

# Preload the pipeline
def load_pipeline():
    peft_path = "C:/Users/Bryan/Desktop/projects/teochew-learning-app/backend/model/clean_model"
    peft_config = PeftConfig.from_pretrained(peft_path)
    model = WhisperForConditionalGeneration.from_pretrained(peft_config.base_model_name_or_path, device_map="auto")
    model = PeftModel.from_pretrained(model, peft_path)
    tokenizer = WhisperTokenizer.from_pretrained("openai/whisper-small", language="zh", task="transcribe")
    processor = WhisperProcessor.from_pretrained("openai/whisper-small", language="zh", task="transcribe")
    pipeline = AutomaticSpeechRecognitionPipeline(model=model, tokenizer=tokenizer, feature_extractor=processor.feature_extractor)
    return pipeline

pipeline = load_pipeline()

@router.get("/")
async def predict():
    print("teoscribe is running")
    return {"transcription": "sample text"}  # Replace with actual transcription logic
