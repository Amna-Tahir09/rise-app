import os, uuid
from dotenv import load_dotenv
from pinecone import Pinecone
from backend.embeddings import embed_text

load_dotenv()
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("rise-index")

def store_log(user_id: int, mode: str, text: str, log_type: str = "log"):
    vector = embed_text(text)
    vector_id = str(uuid.uuid4())
    index.upsert(vectors=[{
        "id": vector_id,
        "values": vector,
        "metadata": {"user_id": user_id, "mode": mode, "type": log_type, "text": text}
    }])
    return vector_id

def retrieve_logs(user_id: int, mode: str, query: str, top_k: int = 5):
    query_vector = embed_text(query)
    results = index.query(
        vector=query_vector,
        top_k=top_k,
        filter={"user_id": user_id, "mode": mode},
        include_metadata=True
    )
    return results
def retrieve_classical_texts(query: str, top_k: int = 3):
    query_vector = embed_text(query)
    results = index.query(
        vector=query_vector,
        top_k=top_k,
        filter={"type": "classical_text"},
        include_metadata=True
    )
    return results    

if __name__ == "__main__":
    store_log(1, "habit", "skipped gym on Wednesday, felt tired")
    store_log(1, "habit", "prayed fajr on time")
    result = retrieve_logs(1, "habit", "why do I keep missing workouts?")
    print(result)
   