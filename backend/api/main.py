from fastapi import FastAPI
from api.routes import predict_router

app = FastAPI()

app.include_router(predict_router)
