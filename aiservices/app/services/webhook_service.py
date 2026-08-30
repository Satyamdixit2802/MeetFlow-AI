import httpx
from app.config import NEXT_APP_URL

async def save_to_nextjs(data: dict):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{NEXT_APP_URL}/api/meetings", json=data, timeout=10)
            response.raise_for_status()
    except Exception as e:
        print(f"Webhook failed: {e}")
        raise