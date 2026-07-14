from fastapi import APIRouter

router = APIRouter()

@router.post("/transcribe")
async def transcribe():
    return {"message": "STT route"}