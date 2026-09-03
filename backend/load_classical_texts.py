import os
from backend.pinecone_store import index
from backend.embeddings import embed_text

TEXTS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "classical_texts")

def load_classical_texts():
    files = [f for f in os.listdir(TEXTS_DIR) if f.endswith(".txt")]
    loaded = 0

    for filename in files:
        filepath = os.path.join(TEXTS_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read().strip()

        lines = content.split("\n", 1)
        if lines[0].startswith("SOURCE:"):
            source = lines[0].replace("SOURCE:", "").strip()
            passage = lines[1].strip() if len(lines) > 1 else ""
        else:
            source = "Unknown"
            passage = content

        if not passage:
            print(f"Skipping {filename} — no passage text found")
            continue

        disease = filename.split("_")[0]

        vector = embed_text(passage)
        vector_id = f"classical_{filename.replace('.txt', '')}"

        index.upsert(vectors=[{
            "id": vector_id,
            "values": vector,
            "metadata": {
                "type": "classical_text",
                "disease": disease,
                "source": source,
                "text": passage
            }
        }])
        loaded += 1
        print(f"Loaded: {filename} ({disease})")

    print(f"\nDone. {loaded} classical text passages loaded into Pinecone.")

if __name__ == "__main__":
    load_classical_texts()