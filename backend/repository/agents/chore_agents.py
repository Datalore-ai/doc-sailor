import os
from dotenv import load_dotenv
from google import genai
from time import time, sleep
from collections import deque

from repository.client_initialization import gemini_client
from repository.system_prompts import link_extraction_prompt, main_content_extract_prompt

# Track timestamps of recent calls
recent_calls = deque()

load_dotenv()


def extract_internal_links(prompt: str):
    """
    Extracts relevant internal documentation links from a Markdown-based documentation page.
    """
    response = gemini_client.models.generate_content(
        config=genai.types.GenerateContentConfig(
            system_instruction=link_extraction_prompt,
            response_mime_type='application/json',
            response_schema=list[str],
        ),
        model="gemini-2.0-flash", contents=f"""{prompt}""",
    )
    return response.parsed

def extract_main_content(prompt: str):
    """
    Extracts the main content from a Markdown-based web page by removing non-essential sections.
    """
    response = gemini_client.models.generate_content(
        config=genai.types.GenerateContentConfig(
            system_instruction=main_content_extract_prompt,
        ),
        model="gemini-2.0-flash", contents=f"""{prompt}""",
    )
    return response.text

def safe_extract_main_content(prompt: str):
    WINDOW = 60  # seconds
    MAX_RPM = 15  # requests per minute

    now = time()
    # Prune timestamps older than WINDOW
    while recent_calls and recent_calls[0] <= now - WINDOW:
        recent_calls.popleft()

    if len(recent_calls) >= MAX_RPM:
        wait_time = WINDOW - (now - recent_calls[0])
        print(f"Rate limit approaching—sleeping for {wait_time:.2f} seconds")
        sleep(wait_time)
        return safe_extract_main_content(prompt)  # retry after wait

    recent_calls.append(time())
    return extract_main_content(prompt)

