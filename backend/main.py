from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_
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


# ---------- Signup (no token needed — user doesn't have one yet) ----------
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


# ---------- Login (no token needed — this is where token is created) ----------
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


# ---------- Guest Signup (no token needed — creates a throwaway account) ----------
@app.post("/guest-signup", status_code=201)
def guest_signup(db: Session = Depends(get_db)):
    """
    Creates a throwaway account behind the scenes so guests get a real
    user_id + JWT and can use every existing route (chat, habit-log,
    muhasaba-log, etc.) exactly like a signed-up user, with zero backend
    changes needed anywhere else.
    """
    guest_id = secrets.token_hex(8)
    guest_email = f"guest_{guest_id}@rise.local"
    guest_password = secrets.token_urlsafe(16)  # random, unusable, unknown to anyone

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


# ---------- Claim Account (protected — upgrades a guest to a real account) ----------
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


# ---------- Set Mode (protected) ----------
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


# ---------- Onboarding (protected) ----------
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


# ---------- Habit Log (protected) ----------
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

    for h in data.habits:
        cleaned_name = h.habit_name.strip().lower()
        db.add(HabitLog(
            user_id=data.user_id,
            date=data.date,
            habit_name=cleaned_name,
            done=h.done,
            note=h.note
        ))
        status_text = "done" if h.done else "not done"
        text_to_embed = f"On {data.date}, habit '{cleaned_name}' was {status_text}. Note: {h.note}"
        store_log(user_id=data.user_id, mode=current_user.mode, text=text_to_embed, log_type="habit_log")

    db.commit()
    return {"user_id": data.user_id, "date": data.date, "saved_count": len(data.habits)}


# ---------- Reflection Log: Muhasaba / Nafs Tracker / Tawbah (protected) ----------
class MuhasabaRequest(BaseModel):
    user_id: int
    date: str
    log_type: str = "muhasaba"   # "muhasaba" | "nafs_check" | "tawbah"
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

    db.add(MuhasabaLog(
        user_id=data.user_id,
        date=data.date,
        log_type=data.log_type,
        reflection_text=data.reflection_text,
        nafs_ratings=data.nafs_ratings
    ))

    text_to_embed = f"[{data.log_type}] On {data.date}, reflection: {data.reflection_text}. Nafs ratings: {data.nafs_ratings}"
    store_log(user_id=data.user_id, mode=current_user.mode, text=text_to_embed, log_type=data.log_type)

    db.commit()
    return {"user_id": data.user_id, "date": data.date, "log_type": data.log_type, "status": "saved"}


# ---------- Chat (protected) ----------
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


# ---------- Dashboard (protected) ----------
@app.get("/dashboard/{user_id}")
def get_dashboard(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this user")

    total_logs = db.query(HabitLog).filter(HabitLog.user_id == user_id).count()

    logged_dates = db.query(HabitLog.date).filter(
        HabitLog.user_id == user_id
    ).distinct().all()
    logged_dates = set(d[0] for d in logged_dates)

    streak = 0
    current_day = date.today()
    while str(current_day) in logged_dates:
        streak += 1
        current_day -= timedelta(days=1)

    recent_logs = db.query(HabitLog).filter(
        HabitLog.user_id == user_id
    ).order_by(HabitLog.date.desc()).limit(5).all()

    recent_activity = [
        {"date": log.date, "habit_name": log.habit_name, "done": log.done}
        for log in recent_logs
    ]

    return {
        "user_id": user_id,
        "streak": streak,
        "total_logs": total_logs,
        "recent_activity": recent_activity
    }