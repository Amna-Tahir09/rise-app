from backend.db import SessionLocal
from backend.models import OnboardingAnswer
from backend.pinecone_store import store_log

def embed_onboarding_answers(user_id: int):
    db = SessionLocal()
    answers = db.query(OnboardingAnswer).filter(OnboardingAnswer.user_id == user_id).all()
    db.close()

    count = 0
    for row in answers:
        combined_text = f"{row.question} Answer: {row.answer}"

        store_log(
            user_id=row.user_id,
            mode=row.mode,
            text=combined_text,
            log_type="onboarding"
        )
        count += 1

    print(f"Embedded {count} onboarding answers for user {user_id}")

if __name__ == "__main__":
    embed_onboarding_answers(user_id=1)