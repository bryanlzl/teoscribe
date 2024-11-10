import os

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

from .predict import router as predict_router

app = FastAPI()

host = os.getenv("BACKEND_IP", "0.0.0.0")
port = int(os.getenv("PORT", os.getenv("BACKEND_PORT", 8000)))

if __name__ == "__main__":
    uvicorn.run(app, host=host, port=port)