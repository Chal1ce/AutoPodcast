from fastapi import APIRouter, HTTPException
from config import ReechoModel
import requests
import json
import time

reecho_router = APIRouter()

# 创建 ReechoModel 的实例
reecho_model = ReechoModel()

def map_speaker_to_voice_id(speaker: str) -> str:
    if "主持人" in speaker:
        return reecho_model.voice1_id
    elif "嘉宾" in speaker:
        return reecho_model.voice2_id
    elif "专家1" in speaker:
        return reecho_model.voice2_id
    elif "专家2" in speaker:
        return reecho_model.voice3_id
    elif "专家" in speaker:
        return reecho_model.voice3_id
    else:
        return reecho_model.voice2_id  # 默认使用voice2_id



def get_audio_url(session_id: str, max_retries=5, retry_delay=30):
    url = f"https://v1.reecho.cn/api/tts/generate/{session_id}?stream"
    headers = {
        'Authorization': f'Bearer {reecho_model.api_key}',
        'Content-Type': 'application/json'
    }
    payload = {}

    for attempt in range(max_retries):
        try:
            response = requests.request("GET", url, headers=headers, data=payload)
            response.raise_for_status()
            data = response.json()
            
            if 'data' in data and 'metadata' in data['data'] and 'audio' in data['data']['metadata']:
                return data['data']['metadata']['audio']
            else:
                print(f"尝试 {attempt + 1}: 音频 URL 尚未准备好。响应内容: {data}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                else:
                    raise HTTPException(status_code=500, detail="无法获取音频 URL")
        except requests.exceptions.RequestException as e:
            print(f"尝试 {attempt + 1} 失败: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                raise HTTPException(status_code=500, detail=f"获取音频 URL 失败: {str(e)}")


@reecho_router.post("/reecho")
async def reecho(text: list[dict]):
    print(f"Received text: {text}")  # 添加这行来打印接收到的数据
    url = "https://v1.reecho.cn/api/tts/generate"

    contents = []
    for item in text:
        speaker = item['speaker']
        voice_id = map_speaker_to_voice_id(speaker)
        contents.append({
            "voiceId": voice_id,
            "text": item['content'],
            "promptId": "default"
        })
    payload = json.dumps({
        "contents": contents,
        "randomness": reecho_model.randomness,
        "stability_boost": reecho_model.stability_boost,
        "probability_optimization": reecho_model.probability_optimization,
        "break_clone": reecho_model.break_clone,
        "sharpen": reecho_model.sharpen,
        "flash": reecho_model.flash,
        "stream": reecho_model.stream,
        "srt": reecho_model.srt,
        "seed": reecho_model.seed,
        "dictionary": reecho_model.dictionary,
        "origin_audio": False,
        "model": "reecho-neural-voice-001"
    })
    headers = {
        'Authorization': f'Bearer {reecho_model.api_key}',
        'Content-Type': 'application/json'
    }

    try:
        response = requests.request("POST", url, headers=headers, data=payload)
        response.raise_for_status()
        print(response.status_code)
        
        if response.text:
            session_id = response.json()['data']['id']
            print(f"获取到的 session_id: {session_id}")
            audio_url = get_audio_url(session_id)
            return audio_url
        else:
            raise HTTPException(status_code=500, detail="服务器返回了空响应")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"请求失败: {str(e)}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=f"无法解析服务器响应: {response.text}")
    except KeyError as e:
        raise HTTPException(status_code=500, detail=f"响应中缺少关键字段: {str(e)}")
