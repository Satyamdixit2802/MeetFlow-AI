from fastapi import APIRouter, HTTPException
from app.models.schemas import ProcessRequest, MeetingExtraction
from app.services.stt_service import transcribe_audio
from app.services.llm_service import extract_meeting_data
from app.services.webhook_service import save_to_nextjs
import shutil , os , tempfile
from fastapi import File, UploadFile, Form


router = APIRouter()

@router.post('/process', response_model=MeetingExtraction)
async def process(
    
    file: UploadFile = File(None),
    raw_text: str = Form(None),
    model : str = Form('groq'),
    title: str = Form('Unititled meeting')
):

    if raw_text:
        transcript = raw_text.strip()
    elif file:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            shutil.copyfileobj(file.file,temp)
            temp_path = temp.name

        try:
            transcript = await transcribe_audio(temp_path)
        except Exception as e:
            raise  HTTPException(status_code=500,detail=f"Transcription failed : {e}")
        finally:
            os.unlink(temp_path)
    
    else:
        raise HTTPException(status_code=400, detail="Provide file or raw_text")

    extraction = await extract_meeting_data(transcript, model=model)

    await save_to_nextjs({
        "title": title,
        "transcript": transcript,
        "summary": extraction.summary,
        "action_items": [item.dict() for item in extraction.action_items]
    })

    return extraction