from fastapi import FastAPI
from api.process import process_router
from api.reecho import reecho_router
from api.deepseek import deepseek_router
from api.OpenAI import openai_router
from api.Yi import yi_router

from local_model.CoquiTTS import coqui_tts_router
# from local_model.llama import llama_router
# from local_model.Yi import yi_local_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(process_router, prefix="/process", tags=["process"])
app.include_router(reecho_router, prefix="/reecho", tags=["reecho"])
app.include_router(deepseek_router, prefix="/deepseek", tags=["deepseek"])
app.include_router(openai_router, prefix="/openai", tags=["openai"])
app.include_router(yi_router, prefix="/yi", tags=["yi"])

# app.include_router(llama_router, prefix="/llama_local", tags=["llama_local"])
# app.include_router(yi_local_router, prefix="/yi_local", tags=["yi_local"])
app.include_router(coqui_tts_router, prefix="/coqui_tts", tags=["coqui_tts"])


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 允许的源,根据你的前端地址调整
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头
)
