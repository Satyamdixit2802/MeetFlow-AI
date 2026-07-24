from pydantic import BaseModel
from typing import List

class ActionItem(BaseModel):
    task: str
    owner: str
    deadline: str

class MeetingExtraction(BaseModel):
    summary: str
    action_items: List[ActionItem]

class ProcessRequest(BaseModel):
    transcript: str
    model: str = "groq"