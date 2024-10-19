from openai import OpenAI
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, StreamingResponse
from config import Yi_API
from pydantic import BaseModel

yi_model = Yi_API()

yi_router = APIRouter()

client = OpenAI(
    base_url="https://api.lingyiwanwu.com/v1",
    api_key=yi_model.apikey
)



class File2TalkRequest(BaseModel):
    text: str
    characters: str

@yi_router.post("/file2talk")
async def yi_file2talk(request_data: File2TalkRequest):
    text = request_data.text
    characters = request_data.characters

    sys_prompt = f"""
        ## 角色:\n你是一个拥有二十年经验的专家.严格遵守以下要求，并且标点符号一律使用英文的，不要进行任何的改动.\n
        ## 任务:\n请你根据所给的内容，写出一篇内容详细的高质量的播客.\n
        ## 内容要求:\n有{characters}，对内容进行讨论，向听众解释内容.\n
        ## 输出要求:\n主持人:xxxxx\n嘉宾:xxxxx\n专家:xxxxx\n或\n主持人:xxxxx\n专家1:xxxxx\n专家2:xxxxx\n
    """

    print(f"System prompt: {sys_prompt}")

    try:
        final_res = []
        res = client.chat.completions.create(
            model=yi_model.model,
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": "内容: " + text}
            ],
            stream=False
        )
        print(f"Response: {res.choices[0].message.content}")
        res = res.choices[0].message.content.replace("\n\n", "\n")
        res = res.split("\n")
        for r in res:
            speaker, content = r.split(":")
            final_res.append({"speaker": speaker, "content": content})
        return final_res
    except Exception as e:
        print(f"Error in generate_res: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



class TopicTalkRequest(BaseModel):
    topic: str
    format: str

@yi_router.post("/topic2talk")
async def yi_topic2talk(request_data: TopicTalkRequest):
    print(f"Received request data: {request_data}")
    characters = request_data.format
    topic = request_data.topic

    sys_prompt = f"""
        ## 角色:\n你是一个拥有二十年经验的专家.严格遵守以下要求，并且标点符号一律使用英文的，不要进行任何的改动:\n
        ## 任务:\n请你根据所给的主题，写出一篇高质量并且尽量较长较详细的播客.\n
        ## 内容要求:\n有{characters}，对内容进行讨论，向听众解释内容.\n
        ## 输出格式要求:\n主持人:xxxxx\n嘉宾:xxxxx\n专家:xxxxx\n或\n主持人:xxxxx\n专家1:xxxxx\n专家2:xxxxx\n
    """

    print(f"System prompt: {sys_prompt}")
    print(f"Topic: {topic}")

    try:
        final_res = []
        res = generate_res(sys_prompt, topic)
        res = res.replace("\n\n", "\n")
        res = res.split("\n")
        for r in res:
            speaker, content = r.split(":")
            final_res.append({"speaker": speaker, "content": content})
        return final_res
    except Exception as e:
        print(f"Error in generate_res: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def generate_res(sys_prompt, topic):
    response = client.chat.completions.create(
        model=yi_model.model,
        messages=[
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": "主题: "+topic}
        ],
        stream=False
    )

    return response.choices[0].message.content
    
