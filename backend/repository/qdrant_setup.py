import os
import random
from dotenv import load_dotenv
from qdrant_client import QdrantClient, models

load_dotenv()

client = QdrantClient(url=os.getenv("QDRANT_URL"))
collection_name = os.getenv("COLLECTION_NAME")
model_name = os.getenv("EMBEDDING_MODEL")

if not client.collection_exists(collection_name=collection_name):
    client.create_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE))

def session_exists(session_id: str) -> bool:
    results = client.scroll(
        collection_name=collection_name,
        scroll_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="group_id",
                    match=models.MatchValue(value=session_id)
                )
            ]
        ),
        limit=1
    )
    return len(results[0]) > 0

def retrieve_from_store(question: str, session_id:str, n_points: int = 10) -> str:
    results = client.query_points(
        collection_name=collection_name,
        query=models.Document(text=question, model=model_name),
        query_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="group_id",
                    match=models.MatchValue(
                        value=session_id,
                    ),
                )
            ]
        ),
        limit=n_points,
    )
    return results.points

def remove_data_from_store(session_id:str) -> str:
    client.delete(
        collection_name=collection_name,
        points_selector=models.FilterSelector(
            filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="group_id",
                        match=models.MatchValue(
                            value=session_id,
                        ),
                    )
                ]
            )
        )
    ) 

def rag_pipeline_setup(session_id, links, documents):
    client.upsert(
    collection_name=collection_name,
    points=[
        models.PointStruct(
            id=idx,
            vector=models.Document(text=document, model=model_name),
            payload={"group_id": session_id, "source_link": links[idx], "document": document},
        )
        for idx, document in enumerate(documents)
    ],)

def select_random_chunk(documents):
    if not documents:
        return None, None

    idx = random.randint(0, len(documents) - 1)
    selected_doc = documents[idx]

    return idx, selected_doc