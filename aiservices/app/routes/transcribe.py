from fastapi import APIRouter , UploadFile ,Form ,File,HTTPException
from fastapi.responses import JSONResponse
from app.services.stt_service import transcribe_audio , use_raw_script
import os,shutil,tempfile

router = APIRouter()

@router.post("/transcribe")
async def transcribe(
    file : UploadFile = File(None),
    raw_text : str = Form(None)
):
       
     if raw_text:
          transcript = await use_raw_script(raw_text)
          return {"transcript": transcript, "source": "text"}

     if not file:
        return JSONResponse({"error":"provide either file or raw text"},status_code= 400)

     suffix = os.path.splitext(file.filename)[1]
     with tempfile.NamedTemporaryFile(delete= False,suffix= suffix) as tmp:
        shutil.copyfileobj(file.file,tmp)
        tmp_path = tmp.name
     try:
        transcript = await transcribe_audio(tmp_path)
     except Exception as e:
        raise  HTTPException(status_code=500,detail=f"Transcription failed : {e}")
     finally :
        os.unlink(tmp_path)
    
     return {"transcript": transcript, "source": "audio"}
