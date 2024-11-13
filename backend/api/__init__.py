import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.predict import predict_router

load_dotenv()

app = FastAPI()
app.include_router(predict_router)

frontend_base_urls = os.getenv("FRONTEND_BASE_URLS", "").split(",")
frontend_port = os.getenv("FRONTEND_PORT")
allowed_origins_urls = [f"{url}:{frontend_port}" if url == "http://localhost" else url for url in frontend_base_urls]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_urls,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)