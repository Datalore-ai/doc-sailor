import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

from repository.main_setup import documentation_setup
from repository.qdrant_setup import retrieve_from_store, session_exists

load_dotenv()

app = FastAPI()


class SetupRequest(BaseModel):
    link: str
    session_id: Optional[int]
    should_setup_new: bool


class QueryRequest(BaseModel):
    query: str
    session_id: int
    max_results: int


# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def message_stream(msg: str):
    yield f"data: {msg}\n\n"


@app.post("/setup_docs")
async def setup_documentation(request: SetupRequest):
    print("Session_id: ", request.session_id)
    if request.should_setup_new:
        return StreamingResponse(
            documentation_setup(url=request.link, session_id=request.session_id),
            media_type="text/event-stream",
        )
    elif session_exists(request.session_id):
        return StreamingResponse(
            content=message_stream("session exists"), media_type="text/event-stream"
        )
    else:
        return StreamingResponse(
            content=message_stream("no session exists"), media_type="text/event-stream"
        )


@app.post("/query_docs")
async def query_documentation(request: QueryRequest):
    question = request.query
    session_id = request.session_id
    n_points = request.max_results

    results = retrieve_from_store(
        question=question, session_id=session_id, n_points=n_points
    )
    payload = [
        {
            "page": int(r.id) + 1,
            "content": r.payload["document"],
            "source_link": r.payload["source_link"],
        }
        for r in results
    ]

    return {"result": payload}
