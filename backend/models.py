from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, JSON
from datetime import datetime
from db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    user_name = Column(String)
    mode = Column(String)  # "habit_tracker" or "tazkiya"
    created_at = Column(DateTime, default=datetime.utcnow)


class OnboardingAnswer(Base):
    __tablename__ = "onboarding_answers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question = Column(String)
    answer = Column(String)


class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    habit_name = Column(String)
    done = Column(Boolean, default=False)
    note = Column(String, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)


class MuhasabaLog(Base):
    __tablename__ = "muhasaba_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    reflection_text = Column(String, nullable=True)
    nafs_ratings = Column(JSON)
    date = Column(DateTime, default=datetime.utcnow)