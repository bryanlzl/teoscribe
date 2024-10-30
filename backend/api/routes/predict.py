from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from starlette.responses import JSONResponse
from transformers import WhisperForConditionalGeneration, WhisperTokenizer, WhisperProcessor, AutomaticSpeechRecognitionPipeline
from peft import PeftConfig, PeftModel
from api.model.model import TranscribeAudioReqBody

import torch
import torchaudio
import logging


router = APIRouter()

# Preload the pipeline
# def load_pipeline():
#     peft_path = "C:/Users/Bryan/Desktop/projects/teochew-learning-app/backend/model/clean_model"
#     peft_config = PeftConfig.from_pretrained(peft_path)
#     model = WhisperForConditionalGeneration.from_pretrained(peft_config.base_model_name_or_path, device_map="auto")
#     model = PeftModel.from_pretrained(model, peft_path)
#     tokenizer = WhisperTokenizer.from_pretrained("openai/whisper-small", language="zh", task="transcribe")
#     processor = WhisperProcessor.from_pretrained("openai/whisper-small", language="zh", task="transcribe")
#     pipeline = AutomaticSpeechRecognitionPipeline(model=model, tokenizer=tokenizer, feature_extractor=processor.feature_extractor)
#     return pipeline

# pipeline = load_pipeline()


@router.get("/", summary="Server status check", description="Checks if the TeoSCRIBE backend transcription service is running")
async def server_status():
    """    
    Returns a response to confirm that the TeoSCRIBE backend transcription service is running.
    """
    try:
        is_server_operational = True

        if is_server_operational:
            return JSONResponse(
                status_code=200,
                content={
                    "status": True,
                    "message": "Service is running"
                }
            )
        else:
            raise HTTPException(
                status_code=503,
                detail={
                    "status": False,
                    "message": "Service is unavailable"
                }
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "status": False,
                "message": "An unexpected error occurred",
                "error": str(e)
            }
        )

@router.post("/transcribe", summary="Transcribes an audio input", description="Transcribe an audio input (using the model) into its character/text form")
async def transcribe_audio(audio_blob: UploadFile = File(...), dialect: str = Form(...)):
    """    
    Returns a string of transcribed characters/text based on an audio input
    """
    try:
        logging.info("transcribe_request received" + audio_blob.content_type)
        logging.info("transcribe_request dialect:" + dialect)
        
        static_text = "谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢什么谢谢"
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "transcribed_text": static_text
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "status": True,
                "message": "An unexpected error occurred",
                "error": str(e)
            }
        )

