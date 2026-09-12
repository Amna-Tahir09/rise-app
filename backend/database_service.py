from db import SessionLocal
from models import User, OnboardingAnswer, HabitLog, MuhasabaLog
from security import hash_password, verify_password
from datetime import date as date_type


def create_user(email: str, password: str, mode: str, user_name: str = None):
    db = SessionLocal()
    hashed_pw = hash_password(password)
    user = User(email=email, mode=mode, user_name=user_name, password_hash=hashed_pw)
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user

def authenticate_user(email: str, password: str):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    db.close()
    if user and verify_password(password, user.password_hash):
        return user
    return None


def save_onboarding_answer(user_id: int, mode: str, question: str, answer: str):
    db = SessionLocal()
    entry = OnboardingAnswer(user_id=user_id, mode = mode, question=question, answer=answer)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    db.close()
    return entry


def save_habit_log(user_id: int, habit_name: str, done: bool, log_date: date_type, note: str = None):
    db = SessionLocal()
    log = HabitLog(user_id=user_id, habit_name=habit_name, done=done, note=note, date=log_date)
    db.add(log)
    db.commit()
    db.refresh(log)
    db.close()
    return log


def save_muhasaba_log(user_id: int, reflection_text: str, nafs_ratings: dict, log_date: date_type, log_type: str = "muhasaba"):
    db = SessionLocal()
    log = MuhasabaLog(user_id=user_id, log_type=log_type, reflection_text=reflection_text, nafs_ratings=nafs_ratings, date=log_date)
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


def get_onboarding_answers(user_id: int, mode: str = None):
    db = SessionLocal()
    query = db.query(OnboardingAnswer).filter(OnboardingAnswer.user_id == user_id)
    if mode:
        query = query.filter(OnboardingAnswer.mode == mode)
    answers = query.all()
    db.close()
    return answers