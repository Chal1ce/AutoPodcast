import torch
from transformers import pipeline
from fastapi import APIRouter
from config import llama

llama_router = APIRouter()

llama_model = llama()

model_id = llama_model.model

pipe = pipeline(
    "text-generation", 
    model=model_id, 
    torch_dtype=torch.bfloat16, 
    device_map="auto"
)


@llama_router.post("/generate")
async def llama_generate(prompt):
    return pipe(prompt)

