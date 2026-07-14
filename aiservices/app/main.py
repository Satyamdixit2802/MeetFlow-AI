from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from app.routes import process , transcribe

app = FastAPI(title="Meeting summarizer AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins = ['http://localhost:3000'],
      allow_methods=["*"],
      allow_headers = ['*'],
)

app.include_router(transcribe.router, prefix='/api', tags= ['STT'])
app.include_router(process.router, prefix='/api', tags= ['LLM'])

@app.get('/health')
async def health():
    return {'status':'ok'}