from config import yi
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer

yi_local_router = APIRouter()
yi_model = yi()

model_path = yi_model.model

def load_model():
    tokenizer = AutoTokenizer.from_pretrained(model_path, use_fast=False)
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        device_map="auto",
        torch_dtype='auto'
    ).eval()
    return model, tokenizer

model, tokenizer = load_model()

class File2TalkRequest(BaseModel):
    text: str
    characters: str

@yi_local_router.post("/generate")
async def yi_generate(request_data: File2TalkRequest):
    text = request_data.text
    characters = request_data.characters

    sys_prompt = f"""
        ## 角色:\n你是一个拥有二十年经验的专家.严格遵守以下要求，并且标点符号一律使用英文的，不要进行任何的改动:\n
        ## 任务:\n请你根据所给的主题，写出一篇高质量并且尽量较长较详细的播客.\n
        ## 内容要求:\n有{characters}，对内容进行讨论，向听众解释内容.\n
        ## 输出格式要求:\n主持人:xxxxx\n嘉宾:xxxxx\n专家:xxxxx\n或\n主持人:xxxxx\n专家1:xxxxx\n专家2:xxxxx\n
    """

    messages = [
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": text}
    ]

    input_ids = tokenizer.apply_chat_template(conversation=messages, tokenize=True, return_tensors='pt')
    output_ids = model.generate(input_ids.to('cuda'), eos_token_id=tokenizer.eos_token_id)
    response = tokenizer.decode(output_ids[0][input_ids.shape[1]:], skip_special_tokens=True)

    try:
        final_res = []
        res = response.replace("\n\n", "\n")
        res = res.split("\n")
        for r in res:
            speaker, content = r.split(":")
            final_res.append({"speaker": speaker, "content": content})
        return final_res
    except Exception as e:
        print(f"Error in generate_res: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))