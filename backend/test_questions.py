from backend.rag_pipeline import answer_question
from backend.pinecone_store import store_log

# Optional: add a few more logs so more habit questions have real data
store_log(1, "habit", "studied for 2 hours, got distracted after 3pm and lost focus")
store_log(1, "habit", "slept only 5 hours on Tuesday, felt exhausted all day")
store_log(1, "habit", "screen time was 6 hours today, mostly social media")

answerable = [
    ("habit", "Why do I keep skipping the gym on Wednesdays?"),
    ("habit", "What pattern do you see in my sleep tracking over the last two weeks?"),
    ("habit", "I've been struggling with my study habit, what's getting in the way?"),
    ("habit", "When am I most likely to skip my morning routine?"),
    ("habit", "What habits have I been most consistent with this month?"),
    ("habit", "Why does my focus drop after 3 PM?"),
    ("habit", "How has my screen time been trending?"),
    ("tazkiya", "What triggers my anger most often?"),
    ("tazkiya", "Why do I keep feeling envious of others at work?"),
    ("tazkiya", "What does Al-Ghazali say about pride and how to overcome it?"),
    ("tazkiya", "I notice I show off when people praise me, what's the Islamic perspective on riya?"),
    ("tazkiya", "How can I tell if I'm being sincere or just showing off?"),
    ("tazkiya", "Why do I feel stingy even when I have enough?"),
    ("tazkiya", "What patterns do you see in my nafs ratings over the last month?"),
]

unanswerable = [
    ("habit", "What does my sleep data say about my productivity?"),
    ("habit", "How many times did I meditate in February?"),
    ("tazkiya", "What does Ibn Qayyim say about the cure for envy?"),
    ("tazkiya", "What specific dua did Al-Ghazali recommend for overcoming shahwat?"),
    ("tazkiya", "What does Al-Ghazali say about the punishment for hasad?"),
    ("tazkiya", "How many types of riya does Al-Ghazali describe?"),
]

print("=" * 60)
print("ANSWERABLE QUESTIONS — check for real specifics, not generic advice")
print("=" * 60)
for i, (mode, q) in enumerate(answerable, 1):
    ans = answer_question(user_id=1, mode=mode, question=q)
    print(f"\n[{i}] ({mode}) {q}\n-> {ans}\n")

print("=" * 60)
print("UNANSWERABLE QUESTIONS — check it says 'I don't know', not a fabricated answer")
print("=" * 60)
for i, (mode, q) in enumerate(unanswerable, 15):
    ans = answer_question(user_id=1, mode=mode, question=q)
    print(f"\n[{i}] ({mode}) {q}\n-> {ans}\n")