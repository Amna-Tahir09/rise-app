"""
embeddings.py — Rise backend

CHANGED: This no longer loads sentence-transformers/torch locally.
Instead, it calls Hugging Face's free Inference API to get embeddings.
This removes ~5GB of dependencies from requirements.txt, which is what
was pushing our deployment bundle past every free platform's size limit.

Setup needed (one-time, free, no card):
1. Go to https://huggingface.co/settings/tokens
2. Sign up / log in (no card required)
3. Create a new token (type: "Read" is enough)
4. Add it to your .env file as: HF_API_TOKEN=hf_xxxxxxxxxxxx
5. Add HF_API_TOKEN to your deployment platform's environment variables too

requirements.txt change needed:
  REMOVE: torch, sentence-transformers, transformers (if only used for embeddings)
  ADD:    requests  (usually already installed, but make sure it's listed)
"""

import os
from dotenv import load_dotenv

load_dotenv()

import requests
from typing import List

# Same model we were using locally — the API serves the exact same model,
# so embedding quality and dimensions (384) are identical to before.
HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{HF_MODEL}/pipeline/feature-extraction"

HF_API_TOKEN = os.getenv("HF_API_TOKEN")

if not HF_API_TOKEN:
    raise RuntimeError(
        "HF_API_TOKEN is not set. Get a free token at "
        "https://huggingface.co/settings/tokens and add it to your .env file."
    )

_headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}


def embed_text(text: str) -> List[float]:
    """
    Takes a piece of text, returns its 384-dimensional embedding vector
    (same output shape as the local sentence-transformers model gave us).

    Used exactly like before by pinecone_store.py, e.g.:
        vector = embed_text("I skipped the gym today")
        pinecone_index.upsert([(id, vector, metadata)])
    """
    if not text or not text.strip():
        raise ValueError("Cannot embed empty text.")

    response = requests.post(
        HF_API_URL,
        headers=_headers,
        json={"inputs": text, "options": {"wait_for_model": True}},
        timeout=30,
    )

    if response.status_code != 200:
        raise RuntimeError(
            f"Hugging Face embedding request failed "
            f"(status {response.status_code}): {response.text}"
        )

    embedding = response.json()

    # The API sometimes wraps the result in an extra list for batch requests.
    # Unwrap if needed so we always return a flat list of 384 floats.
    if isinstance(embedding, list) and len(embedding) > 0 and isinstance(embedding[0], list):
        embedding = embedding[0]

    return embedding


def embed_texts_batch(texts: List[str]) -> List[List[float]]:
    """
    Same as embed_text(), but for multiple texts at once — more efficient
    than calling embed_text() in a loop if you're embedding several
    entries together (e.g. loading classical_texts/ files in bulk).
    """
    if not texts:
        return []

    response = requests.post(
        HF_API_URL,
        headers=_headers,
        json={"inputs": texts, "options": {"wait_for_model": True}},
        timeout=60,
    )

    if response.status_code != 200:
        raise RuntimeError(
            f"Hugging Face batch embedding request failed "
            f"(status {response.status_code}): {response.text}"
        )

    return response.json()


# ---------------------------------------------------------------------------
# Quick manual test — run this file directly to confirm your token works:
#   python embeddings.py
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    sample = "I skipped my morning workout because I felt tired."
    vector = embed_text(sample)
    print(f"Got embedding of length {len(vector)}")
    print(f"First 5 values: {vector[:5]}")