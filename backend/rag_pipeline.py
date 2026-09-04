import os
from dotenv import load_dotenv
from groq import Groq
from backend.pinecone_store import retrieve_logs, retrieve_classical_texts
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def answer_question(user_id: int, mode: str, question: str) -> str:
    results = retrieve_logs(user_id=user_id, mode=mode, query=question, top_k=5)
    matches = results.get("matches", [])

    log_context = "\n".join(f"- {m['metadata']['text']}" for m in matches) if matches else ""

    classical_context = ""
    if mode == "tazkiya":
        classical_results = retrieve_classical_texts(query=question, top_k=3)
        classical_matches = classical_results.get("matches", [])
        # Only keep genuinely close matches — filters out loosely related passages
        relevant_matches = [m for m in classical_matches if m.get("score", 0) >= 0.35]
        if relevant_matches:
            classical_context = "\n".join(
                f"- {m['metadata']['text']} (Source: {m['metadata'].get('source', 'Unknown')})"
                for m in relevant_matches
            )

    context_parts = []
    if log_context:
        context_parts.append(f"User's personal logs:\n{log_context}")
    if classical_context:
        context_parts.append(f"Relevant classical teachings:\n{classical_context}")

    context = "\n\n".join(context_parts) if context_parts else "No relevant information found."

    system_prompt = (
        "You are a supportive coach. Answer the user's question using ONLY "
        "the information provided below. If the information given is not "
        "enough to answer confidently, say so clearly instead of guessing "
        "or making something up. When citing classical teachings, mention "
        "the source naturally.\n\n"
        f"{context}"
    )

    resp = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ],
        max_tokens=1000,
    )

    answer = resp.choices[0].message.content.strip()
    if not answer:
        return "I don't have enough information to answer that confidently."
    return answer