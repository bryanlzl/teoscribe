import os
from fastapi import FastAPI
from dotenv import load_dotenv
from api.routes import predict_router
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

frontend_base_url = os.getenv("FRONTEND_BASE_URL")
frontend_port = os.getenv("FRONTEND_PORT")
frontend_url = f"{frontend_base_url}:{frontend_port}"

app = FastAPI()
app.include_router(predict_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)