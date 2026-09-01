import os
from dotenv import load_dotenv
from groq import Groq
from backend.pinecone_store import retrieve_logs

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def answer_question(user_id: int, mode: str, question: str) -> str:
    # 1. Retrieve relevant context (filtered by user + mode, so no cross-user leakage)
    results = retrieve_logs(user_id=user_id, mode=mode, query=question, top_k=5)
    matches = results.get("matches", [])

    if not matches:
        context = "No relevant logs found."
    else:
        context = "\n".join(f"- {m['metadata']['text']}" for m in matches)

    # 2. Build a grounded prompt — critical for avoiding fabrication
    system_prompt = (
        "You are a supportive coach. Answer the user's question using ONLY "
        "the information provided below. If the information given is not "
        "enough to answer confidently, say so clearly instead of guessing "
        "or making something up.\n\n"
        f"User's logs:\n{context}"
    )

    # 3. Call the model
    resp = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ],
        max_tokens=600,
    )

    return resp.choices[0].message.content.strip()


if __name__ == "__main__":
    answer = answer_question(user_id=1, mode="habit", question="Why do I keep missing workouts?")
    print("ANSWER:", repr(answer))