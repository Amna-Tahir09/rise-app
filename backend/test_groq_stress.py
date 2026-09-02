import os, time
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

questions = [f"Say the number {i} in one word." for i in range(1, 21)]

start = time.time()
for i, q in enumerate(questions, 1):
    t0 = time.time()
    resp = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[{"role": "user", "content": q}],
        max_tokens=150
    )
    elapsed = time.time() - t0
    answer = resp.choices[0].message.content.strip()
    print(f"{i}: {elapsed:.2f}s -> {answer}")

total = time.time() - start
print(f"\nTotal for 20 requests: {total:.2f}s")