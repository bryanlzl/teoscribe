from pydantic import BaseModel

class TranscribeAudioReqBody(BaseModel):
    dialect: str
