from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.models.schemas import MeetingExtraction
from app.config import OPEN_API_KEY, GROQ_API_KEY, GOOGLE_API_KEY

SYSTEM_PROMPT = """You are a meeting analysis assistant.
Given a meeting transcript, extract:
1. A concise summary (3-5 sentences)
2. All action items, each with:
   - task: what needs to be done
   - owner: person responsible (use "unassigned" if unclear)
   - deadline: when it's due (use "no deadline" if not mentioned)

Respond ONLY with valid JSON matching exactly:
{{{{"summary": "...", "action_items": [{{{{"task": "...", "owner": "...", "deadline": "..."}}}}]}}}}

Never add explanation outside the JSON."""


def get_llm(model: str = "groq"):
    normalized_model = "google" if model == "gemini" else model

    if normalized_model == 'google':
        if not GOOGLE_API_KEY:
            raise RuntimeError("GOOGLE_API_KEY is not set")
        return ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=GOOGLE_API_KEY,
            temperature=0,
        )
    elif normalized_model == 'openai':
        if not OPEN_API_KEY:
            raise RuntimeError("OPEN_API_KEY is not set")
        return ChatOpenAI(
            model="gpt-4o-mini",
            api_key=OPEN_API_KEY,
            temperature=0,
        )
    else:
        if not GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is not set")
        return ChatGroq(
            model="openai/gpt-oss-20b",
            api_key=GROQ_API_KEY,
            temperature=0,
        )

async def extract_meeting_data(transcript: str, model: str = "groq") -> MeetingExtraction:
     llm = get_llm(model)
     parser = JsonOutputParser(pydantic_object=MeetingExtraction)

     prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", "{transcript}")
     ])

     chain = prompt | llm | parser

     result = await chain.ainvoke({"transcript": transcript})
     return MeetingExtraction(**result)



