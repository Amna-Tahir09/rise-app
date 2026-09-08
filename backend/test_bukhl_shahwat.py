from backend.rag_pipeline import answer_question

questions = [
    ("tazkiya", "What does Al-Ghazali say about the danger of loving wealth?"),
    ("tazkiya", "How does attachment to money hurt the soul, according to Al-Ghazali?"),
    ("tazkiya", "What happens to a person who chases only worldly pleasure and possessions?"),
    ("tazkiya", "What does Al-Ghazali's parable about a table of food teach about controlling desire?"),
    ("tazkiya", "What's the difference between how animals and angels behave, and what does that have to do with human desire?"),
    ("tazkiya", "What specific punishment does Al-Ghazali describe for bukhl?"),
    ("tazkiya", "How many stages of desire does Al-Ghazali describe in Kimiya-yi Sa'adat?"),
]

for i, (mode, q) in enumerate(questions, 1):
    ans = answer_question(user_id=1, mode=mode, question=q)
    print(f"\n[{i}] {q}\n-> {ans}\n")
    print("-" * 60)