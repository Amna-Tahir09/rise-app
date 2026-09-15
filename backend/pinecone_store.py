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
    # Default to "habit" instead of "unknown" — this app only has two real
    # modes (habit/tazkiya), so "unknown" permanently orphans the entry from
    # ever being found by retrieve_logs's strict mode filter. Callers should
    # ideally never pass None here (see main.py fix), but this is a safety
    # net so a stray None never silently creates unreachable data again.
    safe_mode = mode if mode in ("habit", "tazkiya") else "habit"
    index.upsert(vectors=[{
        "id": vector_id,
        "values": vector,
        "metadata": {"user_id": user_id, "mode": safe_mode, "type": log_type, "text": text}
    }])
    return vector_id

def retrieve_logs(user_id: int, mode: str, query: str, top_k: int = 5):
    query_vector = embed_text(query)
    # Include "unknown"-mode entries as a fallback so any legacy data saved
    # before the mode-sync fix (when current_user.mode was still None) can
    # still be found, instead of being permanently invisible.
    results = index.query(
        vector=query_vector,
        top_k=top_k,
        filter={"user_id": user_id, "mode": {"$in": [mode, "unknown"]}},
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