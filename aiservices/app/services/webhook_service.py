import httpx
from app.config import NEXT_APP_URL

async def save_to_nextjs(data: dict):
    try:
        async with httpx.AsyncClient() as client:
            await client.post(f"{NEXT_APP_URL}/api/meetings", json=data, timeout=10)
    except Exception as e:
      
        print(f"Webhook failed: {e}")