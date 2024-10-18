from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any



@dataclass
class ReechoModel:
    api_key: str = ''
    voice1_id: str = ''# 语音角色 ID
    voice2_id: str = ''# 语音角色 ID
    voice3_id: str = ''# 语音角色 ID
    prompt_id: Optional[str] = 'default' # 角色风格 ID（默认为default)
    break_clone: Optional[bool] = True # 增强文本情感（实验性，默认为true）
    dictionary: Optional[List[Dict[str, Any]]] = field(default_factory=lambda: [{}]) # 读音字典，格式为：["音素", [["y", "in1"],["s" "u4"]]]]
    flash: Optional[bool] = False # 低延迟模式（默认为false）
    probability_optimization: Optional[int] = 93 # 概率优选（0-100，默认为93）
    randomness: Optional[int] = 98 # 多样性 (0-100，默认为98)
    seed: Optional[int] = -1 # 生成种子，最大为Int32，-1或null时为随机（默认为-1）
    sharpen: Optional[bool] = False # 音质增强（实验性，默认为false）
    srt: Optional[bool] = False # 是否启用字幕生成（与低延迟模式不兼容，默认为false）
    stability_boost: Optional[int] = 256 # 稳定性过滤 (0-1024，默认为256)
    stream: Optional[bool] = False # 是否启用流式生成（默认为false）



# ------------------
# api
# ------------------
@dataclass
class DeepSeek_API:
    model: str = 'deepseek-chat'
    apikey: str = ''

@dataclass
class Yi_API:
    model: str = 'Yi/Yi-3-8B'
    apikey: str = ''

@dataclass
class OpenAI_API:
    model: str = 'gpt-4o'
    apikey: str = ''
    base_url: str = 'https://api.openai.com/v1'


# ------------------
# local model
# ------------------
@dataclass
class llama:
    model: str = 'meta-llama/Llama-3.2-1B'

@dataclass
class Qwen:
    model: str = 'Qwen/Qwen2-7B-Chat'

@dataclass
class yi:
    model: str = 'Yi/Yi-3-8B'

@dataclass
class CoquiTTS:
    model: str = 'tts_models/multilingual/multi-dataset/xtts_v2'
    output_path: str = 'output.wav'
    speaker_wav: str = 'audio.wav'
    language: str = 'zh-cn'