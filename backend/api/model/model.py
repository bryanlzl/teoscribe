from pydantic import BaseModel

class TranscribeAudioReqBody(BaseModel):
    audio_url: str 
    dialect: str
