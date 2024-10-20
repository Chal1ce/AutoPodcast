from config import qwen
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer

qwen_router = APIRouter()

qwen_model = qwen()

model_name = qwen_model.model


def load_model():
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype="auto",
        device_map="auto"
    )
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    return model, tokenizer


class File2TalkRequest(BaseModel):
    text: str
    characters: str


model, tokenizer = load_model()

@qwen_router.post("/file2talk")
def generate_response(request_data: File2TalkRequest):
    text = request_data.text
    characters = request_data.characters

    sys_prompt = f"""
        ## 角色:\n你是一个拥有二十年经验的专家.严格遵守以下要求，并且标点符号一律使用英文的，不要进行任何的改动.\n
        ## 任务:\n请你根据所给的内容，写出一篇内容详细的高质量的播客.\n
        ## 内容要求:\n有{characters}，对内容进行讨论，向听众解释内容.\n
        ## 输出要求:\n主持人:xxxxx\n嘉宾:xxxxx\n专家:xxxxx\n或\n主持人:xxxxx\n专家1:xxxxx\n专家2:xxxxx\n
    """
    messages = [
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": text}
    ]
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )
    model_inputs = tokenizer([text], return_tensors="pt").to(model.device)
    generated_ids = model.generate(
        **model_inputs,
        max_new_tokens=512
    )
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]
    response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]

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
