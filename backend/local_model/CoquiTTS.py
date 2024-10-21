import os
import torch
from TTS.api import TTS
from fastapi import APIRouter
from pydub import AudioSegment
from fastapi.responses import FileResponse
from config import CoquiTTS

coqui_tts = CoquiTTS()

coqui_tts_router = APIRouter()

# Get device
device = "cuda" if torch.cuda.is_available() else "cpu"


def map_speaker_to_wav(speaker: str) -> str:
    if "主持人" in speaker:
        return coqui_tts.speaker1_wav
    elif "嘉宾" in speaker:
        return coqui_tts.speaker3_wav
    elif "专家1" in speaker:
        return coqui_tts.speaker2_wav
    elif "专家2" in speaker:
        return coqui_tts.speaker3_wav
    elif "专家" in speaker:
        return coqui_tts.speaker2_wav
    else:
        return coqui_tts.speaker1_wav

# List available 🐸TTS models
print(TTS().list_models())

language = coqui_tts.language
file_path = coqui_tts.output_path
output_file = coqui_tts.output_file

@coqui_tts_router.post("/tts_to_file")
async def tts_to_file(text: list[dict]):
    if os.path.exists("audios"):
        pass
    else:
        os.mkdir("audios")
    tts = TTS(coqui_tts.model, progress_bar=True).to(device)
    for idx, item in enumerate(text):
        speaker = item['speaker']
        speaker_wav = map_speaker_to_wav(speaker)
        try:
            tts.tts_to_file(text=item['content'], speaker_wav=speaker_wav, language=language, file_path=f"audios/{idx}"+file_path)
        except:
            tts.tts_to_file(text=item['content'], language=language, file_path=f"audios/{idx}"+file_path)

        if idx == 0:
            sound = AudioSegment.from_wav(f"audios/{idx}"+file_path)
        else:
            sound += AudioSegment.from_wav(f"audios/{idx}"+file_path)
    
    # 将合并后的音频保存为文件
    sound.export(output_file, format="wav")

    # 使用 FileResponse 返回音频文件
    return FileResponse(output_file, media_type="audio/wav", filename="output.wav")

# 清理函数
@coqui_tts_router.on_event("shutdown")
async def cleanup():
    if os.path.exists("output.wav"):
        os.remove("output.wav")
    for file in os.listdir("audios"):
        if file.endswith(".wav"):
            os.remove(os.path.join("audios", file))
