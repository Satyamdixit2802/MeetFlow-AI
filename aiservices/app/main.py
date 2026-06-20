from fastapi import FastAPI , File, UploadFile ,Body
import shutil , os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()


app = FastAPI()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):

    save_path = f"uploads/{file.filename}"

    try:
        with open(save_path, "wb") as buffer:
          shutil.copyfileobj(file.file, buffer)
          

        with open(save_path, "rb") as audio_file:

          transcript = client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-large-v3-turbo"
        )

        return {
          "transcript": transcript.text
    }
    finally:

        if os.path.exists(save_path):
            os.remove(save_path)


@app.post('process-text')
async def process_text(transcript : str = Body(...)):
         pass
from pydantic import BaseModel
from typing import List

class ActionItem(BaseModel):
    task: str
    owner: str
    deadline: str

class MeetingExtraction(BaseModel):
    summary: str
    action_items: List[ActionItem]

SYSTEM_PROMPT = """You are a meeting analysis assistant. Given a meeting transcript, extract:
1. A concise summary (3-5 sentences)
2. Action items, each with a task description, an owner (person's name mentioned), and a deadline (date or relative phrase like "next Friday")

Respond ONLY with valid JSON matching this exact structure:
{"summary": "...", "action_items": [{"task": "...", "owner": "...", "deadline": "..."}]}

If no owner or deadline is mentioned for a task, use "unassigned" or "no deadline" respectively. Never omit a field."""

@app.post("/process")
async def process_transcript(transcript: str = Body(...)):
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": transcript}
        ],
        temperature=1,
        max_completion_tokens=1024,
        top_p=1,
        stream=True,
        stop=None
    )
    raw_json = completion.choices[0].message.content
    
    # Layer 2 — Pydantic validates the *shape*, not just the syntax
    validated = MeetingExtraction.model_validate_json(raw_json)
    return validated