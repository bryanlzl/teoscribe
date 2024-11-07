import logging
import os
import tempfile

import httpx
from api.utils.audio_processing import load_pipeline, predict_api
from dotenv import load_dotenv
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from starlette.responses import JSONResponse

# Env vars
load_dotenv()

# Google translate client
GOOGLE_CLOUD_API_KEY = os.getenv("GOOGLE_CLOUD_TRANSLATE_API_KEY")

router = APIRouter()

pipeline = load_pipeline()

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
        
        #TODO: Replace with transcribed text
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio_file:
            temp_audio_file.write(await audio_blob.read())
            temp_audio_file_path = temp_audio_file.name
            print(temp_audio_file_path)
            transcribed_text = predict_api(pipeline, temp_audio_file_path)
            print("The transcribed text is:", transcribed_text)
        
        static_text = "谢谢什么" 
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "transcribed_text": transcribed_text
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

# Translate Endpoint
@router.post("/translate", summary="Translate text", description="Translates text from a specified source language into the specified target language")
async def translate_text(
    text: str = Form(...), 
    source_language: str = Form(...), 
    target_language: str = Form(...)
):
    """Translates the provided text from the specified source language to the target language."""
    try:
        url = "https://translation.googleapis.com/language/translate/v2"
        params = {
            "q": text,
            "source": source_language,
            "target": target_language,
            "key": GOOGLE_CLOUD_API_KEY,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, params=params)
            response.raise_for_status()  # Raise an error for any non-200 responses
            translation = response.json()

        translated_text = translation['data']['translations'][0]['translatedText']
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "original_text": text,
                "translated_text": translated_text,
                "source_language": source_language,
                "target_language": target_language
            }
        )
    except httpx.HTTPStatusError as e:
        logging.error(f"HTTP error during translation: {str(e)}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail={
                "success": False,
                "message": "Translation API request failed",
                "error": str(e)
            }
        )
    except Exception as e:
        logging.error(f"Translation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": "An unexpected error occurred during translation",
                "error": str(e)
            }
        )