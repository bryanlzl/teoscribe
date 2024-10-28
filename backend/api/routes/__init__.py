from .predict import router as predict_router
import uvicorn
from fastapi import FastAPI
import os

app = FastAPI()

host = os.getenv("HOST", "127.0.0.1")  
port = int(os.getenv("PORT", 8000))

if __name__ == "__main__":
    uvicorn.run(app, host=host, port=port)