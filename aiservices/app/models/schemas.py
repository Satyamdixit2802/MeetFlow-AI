from pydantic import BaseModel
from typing import List, Optional

class ActionItem(BaseModel):
    task: str
    owner: str
    deadline: str

class MeetingExtraction(BaseModel):
    summary: str
    action_items: List[ActionItem]

class ProcessResponse(MeetingExtraction):
    meeting_id: Optional[str] = None

class ProcessRequest(BaseModel):
    transcript: str
    model: str = "groq"
