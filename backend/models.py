from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Date, JSON
from datetime import datetime
from backend.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    user_name = Column(String)
    password_hash = Column(String)
    mode = Column(String, nullable=True)  # "habit" or "tazkiya" — validated in main.py's /set-mode route
    created_at = Column(DateTime, default=datetime.utcnow)


class OnboardingAnswer(Base):
    __tablename__ = "onboarding_answers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    mode = Column(String)
    question = Column(String)
    answer = Column(String)


class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    habit_name = Column(String)
    done = Column(Boolean, default=False)
    note = Column(String, nullable=True)
    date = Column(Date)  # frontend always sends "YYYY-MM-DD"


class MuhasabaLog(Base):
    __tablename__ = "muhasaba_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    log_type = Column(String, default="muhasaba")  # "muhasaba" | "nafs_check" | "tawbah" | "salah"
    reflection_text = Column(String, nullable=True)
    nafs_ratings = Column(JSON)
    date = Column(Date)  # frontend always sends "YYYY-MM-DD"


# ---------- Chat history ----------
# New tables (additive — nothing existing changes). One ChatSession per
# conversation, each with many ChatMessages. A new session starts each day
# automatically, or whenever the user taps "New chat".
class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    title = Column(String, nullable=True)  # first question, trimmed
    date = Column(Date)  # the user's local date this chat belongs to
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), index=True)
    role = Column(String)  # "user" or "assistant"
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)