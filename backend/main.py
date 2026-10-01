from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, date
from typing import Optional
import os
import json

from backend.db import SessionLocal
from backend.models import User, OnboardingAnswer, HabitLog, MuhasabaLog, ChatSession, ChatMessage
from backend.rag_pipeline import answer_question
from backend.pinecone_store import store_log

app = FastAPI()

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://rise-app-six.vercel.app",
        "https://rise-app-nu.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Setup ----------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(user_id: int):
    expire = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def parse_date(date_str: str) -> date:
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=422, detail=f"Invalid date format: '{date_str}'. Expected YYYY-MM-DD.")


# ---------- Token Verification ----------
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# ---------- Existing route ----------
@app.get("/")
def read_root():
    return {"message": "Rise Backend Alive!",
    "greetings": "Hellooooo Feelaaz!"}


# ---------- Signup ----------
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

@app.post("/signup", status_code=201)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = pwd_context.hash(data.password)
    user = User(user_name=data.name, email=data.email, password_hash=hashed_pw)
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"user_id": user.id, "name": user.user_name, "email": user.email}


# ---------- Login ----------
class LoginRequest(BaseModel):
    identifier: str
    password: str

@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        or_(User.email == data.identifier, User.user_name == data.identifier)
    ).first()

    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email/username or password")

    token = create_access_token(user.id)
    return {"access_token": token, "user_id": user.id, "name": user.user_name, "email": user.email}


# ---------- Set Mode ----------
class SetModeRequest(BaseModel):
    user_id: int
    mode: str

@app.post("/set-mode")
def set_mode(
    data: SetModeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != data.user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this user")
    if data.mode not in ("habit", "tazkiya"):
        raise HTTPException(status_code=422, detail="Invalid mode")

    current_user.mode = data.mode
    db.commit()
    return {"user_id": current_user.id, "mode": current_user.mode}


# ---------- Onboarding ----------
class OnboardingAnswerIn(BaseModel):
    question: str
    answer: str

class OnboardingRequest(BaseModel):
    user_id: int
    mode: str
    answers: list[OnboardingAnswerIn]

@app.post("/onboarding", status_code=201)
def save_onboarding(
    data: OnboardingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != data.user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this user")

    if data.mode not in ("habit", "tazkiya"):
        raise HTTPException(status_code=422, detail="Invalid mode")

    for a in data.answers:
        db.add(OnboardingAnswer(
            user_id=data.user_id,
            mode=data.mode,
            question=a.question,
            answer=a.answer
        ))
        text_to_embed = f"{a.question}: {a.answer}"
        store_log(user_id=data.user_id, mode=data.mode, text=text_to_embed, log_type="onboarding")

    db.commit()
    return {"user_id": data.user_id, "saved_count": len(data.answers)}


# ---------- Onboarding: read back / delete ----------
# Added so the frontend can check "has this user already onboarded for this
# mode?" against real saved data, instead of a local flag that can vanish
# (cleared browser, new device) even though the answers are safely here.
class OnboardingAnswerOut(BaseModel):
    id: int
    mode: str
    question: str
    answer: str

@app.get("/onboarding/{user_id}", response_model=list[OnboardingAnswerOut])
def get_onboarding_answers(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this user")

    answers = db.query(OnboardingAnswer).filter(OnboardingAnswer.user_id == user_id).all()
    return [
        OnboardingAnswerOut(id=a.id, mode=a.mode, question=a.question, answer=a.answer)
        for a in answers
    ]

@app.delete("/onboarding/{answer_id}", status_code=204)
def delete_onboarding_answer(
    answer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    answer = db.query(OnboardingAnswer).filter(OnboardingAnswer.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Not found")
    if answer.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized for this entry")

    db.delete(answer)
    db.commit()
    return None


# ---------- Habit Log ----------
class HabitIn(BaseModel):
    habit_name: str
    done: bool
    note: str = ""

class HabitLogRequest(BaseModel):
    user_id: int
    date: str
    habits: list[HabitIn]

@app.post("/habit-log", status_code=201)
def save_habit_log(
    data: HabitLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != data.user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this user")

    log_date = parse_date(data.date)

    for h in data.habits:
        cleaned_name = h.habit_name.strip().lower()

        existing = db.query(HabitLog).filter(
            HabitLog.user_id == data.user_id,
            HabitLog.habit_name == cleaned_name,
            HabitLog.date == log_date,
        ).first()

        if existing:
            existing.done = h.done
            existing.note = h.note
        else:
            db.add(HabitLog(
                user_id=data.user_id,
                date=log_date,
                habit_name=cleaned_name,
                done=h.done,
                note=h.note
            ))

        status_text = "done" if h.done else "not done"
        text_to_embed = f"On {data.date}, habit '{cleaned_name}' was {status_text}. Note: {h.note}"
        store_log(user_id=data.user_id, mode=current_user.mode, text=text_to_embed, log_type="habit_log")

    db.commit()
    return {"user_id": data.user_id, "date": data.date, "saved_count": len(data.habits)}


# ---------- Reflection Log: Muhasaba / Nafs Tracker / Tawbah / Salah ----------
class MuhasabaRequest(BaseModel):
    user_id: int
    date: str
    log_type: str = "muhasaba"
    reflection_text: str = ""
    nafs_ratings: dict[str, int] = {}

VALID_LOG_TYPES = ("muhasaba", "nafs_check", "tawbah", "salah")

@app.post("/muhasaba-log", status_code=201)
def save_muhasaba_log(
    data: MuhasabaRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != data.user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this user")

    if data.log_type not in VALID_LOG_TYPES:
        raise HTTPException(status_code=422, detail=f"Invalid log_type. Must be one of {VALID_LOG_TYPES}")

    log_date = parse_date(data.date)

    # FIX: this used to always insert a new row, even when one already
    # existed for this user/log_type/date. For salah specifically — toggled
    # multiple times per day — that meant every tap created another row,
    # and the dashboard's .first() query kept returning the OLDEST one for
    # today, not the latest. Same upsert pattern save_habit_log already
    # used correctly.
    existing = db.query(MuhasabaLog).filter(
        MuhasabaLog.user_id == data.user_id,
        MuhasabaLog.log_type == data.log_type,
        MuhasabaLog.date == log_date,
    ).first()

    if existing:
        existing.reflection_text = data.reflection_text
        existing.nafs_ratings = data.nafs_ratings
    else:
        db.add(MuhasabaLog(
            user_id=data.user_id,
            date=log_date,
            log_type=data.log_type,
            reflection_text=data.reflection_text,
            nafs_ratings=data.nafs_ratings
        ))

    text_to_embed = f"[{data.log_type}] On {data.date}, reflection: {data.reflection_text}. Nafs ratings: {data.nafs_ratings}"
    store_log(user_id=data.user_id, mode=current_user.mode, text=text_to_embed, log_type=data.log_type)

    db.commit()
    return {"user_id": data.user_id, "date": data.date, "log_type": data.log_type, "status": "saved"}


# ---------- Habit: real delete ----------
# Previously the frontend's Delete button only removed a habit from the
# current screen — nothing backend-side, so it reappeared on next reload
# since all its HabitLog history was still there. This removes it for real.
@app.delete("/habit/{habit_name}", status_code=204)
def delete_habit(
    habit_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cleaned_name = habit_name.strip().lower()
    db.query(HabitLog).filter(
        HabitLog.user_id == current_user.id,
        HabitLog.habit_name == cleaned_name,
    ).delete()
    db.commit()
    return None


# ---------- Reflection history ----------
# Returns a user's past entries for one log type (muhasaba by default),
# newest first. The Muhasaba page uses this both to show past reflections
# and to reload today's answers — no browser storage involved.
@app.get("/muhasaba-log/{user_id}")
def get_muhasaba_history(
    user_id: int,
    log_type: str = "muhasaba",
    limit: int = 60,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this user")
    if log_type not in VALID_LOG_TYPES:
        raise HTTPException(status_code=422, detail=f"Invalid log_type. Must be one of {VALID_LOG_TYPES}")

    rows = (
        db.query(MuhasabaLog)
        .filter(MuhasabaLog.user_id == user_id, MuhasabaLog.log_type == log_type)
        .order_by(MuhasabaLog.date.desc(), MuhasabaLog.id.desc())
        .limit(min(max(limit, 1), 365))
        .all()
    )
    return [
        {
            "id": r.id,
            "date": r.date.isoformat() if r.date else None,
            "log_type": r.log_type,
            "reflection_text": r.reflection_text,
            "nafs_ratings": r.nafs_ratings,
        }
        for r in rows
    ]


# ---------- Chat ----------
# Conversations are now saved as sessions with messages in the database,
# so past chats can be reopened on any device. Each day starts a fresh
# chat automatically; "New chat" can also start one any time.
class ChatRequest(BaseModel):
    user_id: int
    question: str
    session_id: Optional[int] = None
    date: Optional[str] = None  # user's local date, YYYY-MM-DD


class NewSessionRequest(BaseModel):
    date: Optional[str] = None


def _chat_day(date_str: Optional[str]) -> date:
    return parse_date(date_str) if date_str else date.today()


def _owned_session(db: Session, session_id: int, user_id: int) -> ChatSession:
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session or session.user_id != user_id:
        raise HTTPException(status_code=404, detail="Chat not found")
    return session


@app.get("/chat/sessions")
def list_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.date.desc(), ChatSession.id.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "id": s.id,
            "title": s.title,
            "date": s.date.isoformat() if s.date else None,
        }
        for s in sessions
    ]


@app.post("/chat/sessions", status_code=201)
def create_chat_session(
    data: NewSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = ChatSession(user_id=current_user.id, date=_chat_day(data.date))
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"id": session.id, "title": session.title, "date": session.date.isoformat()}


@app.get("/chat/sessions/{session_id}/messages")
def get_chat_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _owned_session(db, session_id, current_user.id)
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.id.asc())
        .all()
    )
    return [{"role": m.role, "content": m.content} for m in messages]


@app.delete("/chat/sessions/{session_id}", status_code=204)
def delete_chat_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = _owned_session(db, session_id, current_user.id)
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    db.delete(session)
    db.commit()
    return None


@app.post("/chat")
def chat(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != data.user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this user")

    day = _chat_day(data.date)

    # Use the chat the user is in; otherwise today's latest chat;
    # otherwise start today's chat.
    if data.session_id:
        session = _owned_session(db, data.session_id, current_user.id)
    else:
        session = (
            db.query(ChatSession)
            .filter(ChatSession.user_id == current_user.id, ChatSession.date == day)
            .order_by(ChatSession.id.desc())
            .first()
        )
        if not session:
            session = ChatSession(user_id=current_user.id, date=day)
            db.add(session)
            db.flush()

    try:
        answer = answer_question(
            user_id=data.user_id,
            mode=current_user.mode,
            question=data.question
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Could not generate an answer. Please try again. ({str(e)})"
        )

    if not session.title:
        session.title = data.question.strip()[:60]
    db.add(ChatMessage(session_id=session.id, role="user", content=data.question))
    db.add(ChatMessage(session_id=session.id, role="assistant", content=answer))
    db.commit()

    # Also embed the exchange so future answers can draw on past conversations
    try:
        store_log(
            user_id=data.user_id,
            mode=current_user.mode,
            text=f"User asked: {data.question} | Rise replied: {answer}",
            log_type="chat_history"
        )
    except Exception:
        pass

    return {"answer": answer, "session_id": session.id, "sources_used": 1}


# ---------- Dashboard ----------
@app.get("/dashboard/{user_id}")
def get_dashboard(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this user")

    today = date.today()

    if current_user.mode == "tazkiya":
        muhasaba_today = db.query(MuhasabaLog).filter(
            MuhasabaLog.user_id == user_id,
            MuhasabaLog.log_type == "muhasaba",
            MuhasabaLog.date == today,
        ).first() is not None

        muhasaba_streak = 0
        day = today
        while True:
            # Any of the three Tazkiya practices counts as showing up
            # for the day — muhasaba, a nafs check-in, or tawbah.
            exists = db.query(MuhasabaLog).filter(
                MuhasabaLog.user_id == user_id,
                MuhasabaLog.log_type.in_(("muhasaba", "nafs_check", "tawbah")),
                MuhasabaLog.date == day,
            ).first() is not None
            if exists:
                muhasaba_streak += 1
                day -= timedelta(days=1)
            elif day == today:
                day -= timedelta(days=1)
                continue
            else:
                break

        # --- Salah: today's logged prayers ---
        today_salah_log = db.query(MuhasabaLog).filter(
            MuhasabaLog.user_id == user_id,
            MuhasabaLog.log_type == "salah",
            MuhasabaLog.date == today,
        ).first()
        salah_today = []
        if today_salah_log and today_salah_log.reflection_text:
            try:
                salah_today = json.loads(today_salah_log.reflection_text).get("prayers", [])
            except Exception:
                salah_today = []

        # --- Salah: last 7 days, prayer count per day, oldest to newest ---
        # Lets the frontend notice a real change (e.g. "3/5 to 1/5 this
        # week"), not just today's single number.
        salah_week = []
        for i in range(6, -1, -1):
            day_i = today - timedelta(days=i)
            log = db.query(MuhasabaLog).filter(
                MuhasabaLog.user_id == user_id,
                MuhasabaLog.log_type == "salah",
                MuhasabaLog.date == day_i,
            ).first()
            count = 0
            if log and log.reflection_text:
                try:
                    count = len(json.loads(log.reflection_text).get("prayers", []))
                except Exception:
                    count = 0
            salah_week.append(count)

        # --- Nafs: diseases rated 4-5 in the most recent check-in (today,
        # or the last day one was actually logged, up to 3 days back) ---
        severe_nafs = []
        for i in range(3):
            day_i = today - timedelta(days=i)
            log = db.query(MuhasabaLog).filter(
                MuhasabaLog.user_id == user_id,
                MuhasabaLog.log_type == "nafs_check",
                MuhasabaLog.date == day_i,
            ).first()
            if log and log.nafs_ratings:
                severe_nafs = sorted(
                    (
                        {"key": k, "value": v}
                        for k, v in log.nafs_ratings.items()
                        if isinstance(v, (int, float)) and v >= 4
                    ),
                    key=lambda x: x["value"],
                    reverse=True,
                )
                break

        return {
            "user_id": user_id,
            "mode": "tazkiya",
            "muhasaba_today": muhasaba_today,
            "muhasaba_streak": muhasaba_streak,
            "salah_today": salah_today,
            "salah_week": salah_week,
            "severe_nafs": severe_nafs,
        }

    habit_names = [
        row[0] for row in
        db.query(HabitLog.habit_name).filter(HabitLog.user_id == user_id).distinct().all()
    ]
    habits = [{"id": name, "name": name} for name in habit_names]

    today_logs = db.query(HabitLog).filter(
        HabitLog.user_id == user_id,
        HabitLog.date == today,
        HabitLog.done == True,
    ).all()
    today_log = [row.habit_name for row in today_logs]

    today_rate = round((len(today_log) / len(habits)) * 100) if habits else 0

    week_rates = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_done = db.query(HabitLog).filter(
            HabitLog.user_id == user_id,
            HabitLog.date == day,
            HabitLog.done == True,
        ).count()
        rate = round((day_done / len(habits)) * 100) if habits else 0
        week_rates.append(rate)

    best_streak = 0
    day = today
    while True:
        day_done = db.query(HabitLog).filter(
            HabitLog.user_id == user_id,
            HabitLog.date == day,
            HabitLog.done == True,
        ).count()
        if day_done > 0:
            best_streak += 1
            day -= timedelta(days=1)
        elif day == today:
            day -= timedelta(days=1)
            continue
        else:
            break

    return {
        "user_id": user_id,
        "mode": "habit",
        "best_streak": best_streak,
        "today_rate": today_rate,
        "week_rates": week_rates,
        "habits": habits,
        "today_log": today_log,
    }