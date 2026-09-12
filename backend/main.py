from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, date
import os
import secrets

from backend.db import SessionLocal
from backend.models import User, OnboardingAnswer, HabitLog, MuhasabaLog
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
    """Every page sends date as 'YYYY-MM-DD'. Centralized so every route
    parses it the same way and errors clearly if the format is ever wrong."""
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


# ---------- Guest Signup ----------
@app.post("/guest-signup", status_code=201)
def guest_signup(db: Session = Depends(get_db)):
    guest_id = secrets.token_hex(8)
    guest_email = f"guest_{guest_id}@rise.local"
    guest_password = secrets.token_urlsafe(16)

    hashed_pw = pwd_context.hash(guest_password)
    user = User(
        user_name="Guest",
        email=guest_email,
        password_hash=hashed_pw,
        is_guest=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return {"access_token": token, "user_id": user.id, "name": user.user_name, "is_guest": True}


# ---------- Claim Account ----------
class ClaimAccountRequest(BaseModel):
    user_id: int
    name: str
    email: str
    password: str

@app.post("/claim-account")
def claim_account(
    data: ClaimAccountRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != data.user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this user")
    if not current_user.is_guest:
        raise HTTPException(status_code=400, detail="This account is not a guest account")

    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    current_user.user_name = data.name
    current_user.email = data.email
    current_user.password_hash = pwd_context.hash(data.password)
    current_user.is_guest = False
    db.commit()

    token = create_access_token(current_user.id)
    return {"access_token": token, "user_id": current_user.id, "name": current_user.user_name, "email": current_user.email}


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

        # Upsert: if this habit already has a row for this date, update it
        # instead of inserting a duplicate — otherwise toggling a habit on/off
        # repeatedly in one day creates multiple rows and breaks today's count.
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


# ---------- Reflection Log: Muhasaba / Nafs Tracker / Tawbah ----------
class MuhasabaRequest(BaseModel):
    user_id: int
    date: str
    log_type: str = "muhasaba"
    reflection_text: str = ""
    nafs_ratings: dict[str, int] = {}

VALID_LOG_TYPES = ("muhasaba", "nafs_check", "tawbah")

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


# ---------- Chat ----------
class ChatRequest(BaseModel):
    user_id: int
    question: str

@app.post("/chat")
def chat(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != data.user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this user")

    try:
        answer = answer_question(
            user_id=data.user_id,
            mode=current_user.mode,
            question=data.question
        )
        return {"answer": answer, "sources_used": 1}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Could not generate an answer. Please try again. ({str(e)})"
        )


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
        # ---- Tazkiya dashboard data ----
        muhasaba_today = db.query(MuhasabaLog).filter(
            MuhasabaLog.user_id == user_id,
            MuhasabaLog.log_type == "muhasaba",
            MuhasabaLog.date == today,
        ).first() is not None

        muhasaba_streak = 0
        day = today
        while True:
            exists = db.query(MuhasabaLog).filter(
                MuhasabaLog.user_id == user_id,
                MuhasabaLog.log_type == "muhasaba",
                MuhasabaLog.date == day,
            ).first() is not None
            if exists:
                muhasaba_streak += 1
                day -= timedelta(days=1)
            elif day == today:
                # today not done yet shouldn't zero out yesterday's streak
                day -= timedelta(days=1)
                continue
            else:
                break

        return {
            "user_id": user_id,
            "mode": "tazkiya",
            "muhasaba_today": muhasaba_today,
            "muhasaba_streak": muhasaba_streak,
        }

    # ---- Habit dashboard data ----
    # Distinct habit names this user has ever logged — this doubles as the
    # "habit list" since there's no separate habit-definitions table.
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