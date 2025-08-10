import os
from dotenv import load_dotenv
from openai import OpenAI
from google import genai

load_dotenv()

openai_client = OpenAI(api_key=os.getenv("OPEN_API_KEY"))
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))