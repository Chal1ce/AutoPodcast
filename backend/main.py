from fastapi import FastAPI
from api.process import process_router
from api.reecho import reecho_router
from api.deepseek import deepseek_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(process_router, prefix="/process", tags=["process"])
app.include_router(reecho_router, prefix="/reecho", tags=["reecho"])
app.include_router(deepseek_router, prefix="/deepseek", tags=["deepseek"])


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 允许的源,根据你的前端地址调整
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头
)
