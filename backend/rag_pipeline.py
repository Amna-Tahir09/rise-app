import os
from dotenv import load_dotenv
from groq import Groq
from backend.pinecone_store import retrieve_logs, retrieve_classical_texts
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Minimum similarity score for a personal log to be considered relevant enough
# to include. Without this, an unrelated log (e.g. a sleep question pulling in
# a workout log) gets forced into context and the model tries to connect
# things that aren't actually related.
LOG_RELEVANCE_THRESHOLD = 0.35


def answer_question(user_id: int, mode: str, question: str) -> str:
    results = retrieve_logs(user_id=user_id, mode=mode, query=question, top_k=5)
    matches = results.get("matches", [])
    relevant_log_matches = [m for m in matches if m.get("score", 0) >= LOG_RELEVANCE_THRESHOLD]

    log_context = (
        "\n".join(f"- {m['metadata']['text']}" for m in relevant_log_matches)
        if relevant_log_matches else ""
    )

    classical_context = ""
    if mode == "tazkiya":
        classical_results = retrieve_classical_texts(query=question, top_k=3)
        classical_matches = classical_results.get("matches", [])
        relevant_matches = [m for m in classical_matches if m.get("score", 0) >= 0.35]
        if relevant_matches:
            classical_context = "\n".join(
                f"- {m['metadata']['text']} (Source: {m['metadata'].get('source', 'Unknown')})"
                for m in relevant_matches
            )

    context_parts = []
    if log_context:
        context_parts.append(f"Relevant personal history for this user:\n{log_context}")
    if classical_context:
        context_parts.append(f"Relevant classical teachings:\n{classical_context}")

    context = "\n\n".join(context_parts) if context_parts else ""

    system_prompt = (
    "You are Rise, a warm, curious, emotionally present mentor and companion.\n"
    "Talk to the user like a caring friend who is genuinely interested in their\n"
    "life — not like a data tool, a support bot, or an assistant explaining its\n"
    "own limitations.\n\n"

    "ABSOLUTE RULE: Never mention logs, data, history, records, or anything\n"
    "about what information you do or don't have access to. The user should\n"
    "never hear phrases like 'I don't have your logs,' 'based on your data,'\n"
    "'I don't have enough information,' or similar. If extra context about this\n"
    "person is provided below, use it naturally and silently to inform your\n"
    "reply — never announce that you're using it or that you're missing it.\n\n"

    "HOW TO RESPOND\n"
    "- React first, like a person would: with warmth, curiosity, or concern,\n"
    "  depending on what they said.\n"
    "- If they share something emotional or a situation (a fight, stress, a\n"
    "  win, a struggle) without much detail, be genuinely curious about it —\n"
    "  invite them to share more so you can actually understand and help. Ask\n"
    "  naturally, like a close friend would: 'What happened?', 'Tell me more —\n"
    "  I want to understand what you're going through', 'How did it start?'.\n"
    "  This should read as care and interest, never as a request for data.\n"
    "- Always give real substance in your reply — a perspective, encouragement,\n"
    "  or practical guidance — alongside that curiosity, not instead of it.\n"
    "  Never reply with nothing but a single deflecting question and nothing\n"
    "  else.\n"
    "- If the user is asking for practical guidance, steps, or a breakdown, use\n"
    "  short bullet points for that part — clear and scannable. For emotional or\n"
    "  conversational replies, keep it natural prose instead of bullets.\n"
    "- Keep responses concise — a few sentences or a short list, not a lecture.\n\n"

    "WHEN CONTEXT ABOUT THIS PERSON IS PROVIDED BELOW\n"
    "- Weave it in naturally if it's genuinely relevant to what they're asking,\n"
    "  the way a friend who remembers past conversations would.\n"
    "- If it isn't relevant to the current message, ignore it completely rather\n"
    "  than forcing a connection.\n\n"

    "TONE\n"
    "- Gentle, honest, and real — never generic motivational language ('you've\n"
    "  got this!') unless it's clearly earned by something specific.\n"
    "- Don't diagnose, label, or assume things about the user's mental state\n"
    "  beyond what they've actually told you.\n"
    "- When referencing classical teachings, mention the source naturally in a\n"
    "  sentence (e.g. 'as Al-Ghazali writes...') — never fabricate a quote or\n"
    "  source that isn't provided below.\n\n"

    + (f"Context that may help you respond (use naturally, never mention it explicitly):\n{context}\n" if context else "")
)

    resp = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ],
        max_tokens=1000,
        temperature=0.4,
    )

    answer = resp.choices[0].message.content.strip()
    if not answer:
        return "Tell me a bit more — I want to understand what's going on."
    return answer