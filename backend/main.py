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

from backend.db import SessionLocal
from backend.models import User, OnboardingAnswer, HabitLog, MuhasabaLog
from backend.rag_pipeline import answer_question

app = FastAPI()

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://rise-app-six.vercel.app",
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
    answers: list[OnboardingAnswerIn]

@app.post("/onboarding", status_code=201)
def save_onboarding(
    data: OnboardingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != data.user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this user")

    for a in data.answers:
        db.add(OnboardingAnswer(
            user_id=data.user_id,
            question=a.question,
            answer=a.answer
        ))
    db.commit()
    return {"user_id": data.user_id, "saved_count": len(data.answers)}


# ---------- Habit Log (protected) ----------
class HabitIn(BaseModel):
    habit_name: str
    done: bool
    note: str = ""

class HabitLogRequest(BaseModel):
    user_id: int
    date: str  # format: "YYYY-MM-DD"
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
    db.commit()
    return {"user_id": data.user_id, "date": data.date, "saved_count": len(data.habits)}


# ---------- Muhasaba Log (protected) ----------
class MuhasabaRequest(BaseModel):
    user_id: int
    date: str
    reflection_text: str
    nafs_ratings: dict[str, int]

@app.post("/muhasaba-log", status_code=201)
def save_muhasaba_log(
    data: MuhasabaRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != data.user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this user")

    db.add(MuhasabaLog(
        user_id=data.user_id,
        date=data.date,
        reflection_text=data.reflection_text,
        nafs_ratings=data.nafs_ratings
    ))
    db.commit()
    return {"user_id": data.user_id, "date": data.date, "status": "saved"}


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
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Could not generate an answer. Please try again."
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