from groq import Groq
from app.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

async def transcribe_audio(file_path: str) -> str:
     with open(file_path,"rb") as audio_file:
        trancription = client.audio.transcriptions.create(
            model= "whisper-large-v3",
            file= audio_file,
            response_format= "text"
        )
     return trancription

async def use_raw_script(text: str) ->str:
    
    return text.strip()