import os

import uvicorn
from fastapi import FastAPI

from .predict import router as predict_router

app = FastAPI()

host = os.getenv("HOST", "0.0.0.0")  
port = int(os.getenv("PORT", 8000))

if __name__ == "__main__":
    uvicorn.run(app, host=host, port=port)