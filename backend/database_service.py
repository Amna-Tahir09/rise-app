from db import SessionLocal
from models import User, OnboardingAnswer, HabitLog, MuhasabaLog


def create_user(email: str, mode: str, user_name: str = None):
    db = SessionLocal()
    user = User(email=email, mode=mode, user_name=user_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user


def save_onboarding_answer(user_id: int, question: str, answer: str):
    db = SessionLocal()
    entry = OnboardingAnswer(user_id=user_id, question=question, answer=answer)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    db.close()
    return entry


def save_habit_log(user_id: int, habit_name: str, done: bool, note: str = None):
    db = SessionLocal()
    log = HabitLog(user_id=user_id, habit_name=habit_name, done=done, note=note)
    db.add(log)
    db.commit()
    db.refresh(log)
    db.close()
    return log


def save_muhasaba_log(user_id: int, reflection_text: str, nafs_ratings: dict):
    db = SessionLocal()
    log = MuhasabaLog(user_id=user_id, reflection_text=reflection_text, nafs_ratings=nafs_ratings)
    db.add(log)
    db.commit()
    db.refresh(log)
    db.close()
    return log


def get_user_logs(user_id: int):
    db = SessionLocal()
    logs = db.query(HabitLog).filter(HabitLog.user_id == user_id).all()
    db.close()
    return logs


def get_onboarding_answers(user_id: int):
    db = SessionLocal()
    answers = db.query(OnboardingAnswer).filter(OnboardingAnswer.user_id == user_id).all()
    db.close()
    return answers