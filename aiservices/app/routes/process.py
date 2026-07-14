from fastapi import APIRouter

router = APIRouter()

@router.post("/process")
def process():
    return {"message":"LLM route"}