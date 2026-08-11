from dotenv import load_dotenv
import os 

load_dotenv()


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPEN_API_KEY = os.getenv("OPEN_API_KEY")
NEXT_APP_URL = os.getenv("NEXT_APP_URL", "http://localhost:3000")