import torch
from TTS.api import TTS
from fastapi import APIRouter
from config import CoquiTTS

coqui_tts = CoquiTTS()

coqui_tts_router = APIRouter()

# Get device
device = "cuda" if torch.cuda.is_available() else "cpu"

# List available 🐸TTS models
print(TTS().list_models())


@coqui_tts_router.post("/tts_to_file")
async def tts_to_file(text, speaker_wav, language, file_path):
    tts = TTS(coqui_tts.model, progress_bar=True).to(device)
    tts.tts_to_file(text=text, speaker_wav=speaker_wav, language=language, file_path=file_path)
