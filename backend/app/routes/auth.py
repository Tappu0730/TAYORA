import re

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.models import User
from app.security import create_access_token, get_current_user, get_db, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class AccountCredentials(BaseModel):
    email: str = Field(..., min_length=3, max_length=254)
    password: str = Field(..., min_length=8, max_length=128)


def normalize_email(email: str) -> str:
    normalized = email.strip().lower()
    if not EMAIL_PATTERN.fullmatch(normalized):
        raise HTTPException(status_code=422, detail="Enter a valid email address.")
    return normalized


def auth_response(user: User) -> dict:
    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email},
    }


@router.post("/register")
def register(credentials: AccountCredentials, db: Session = Depends(get_db)):
    email = normalize_email(credentials.email)
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    user = User(email=email, password_hash=hash_password(credentials.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return auth_response(user)


@router.post("/login")
def login(credentials: AccountCredentials, db: Session = Depends(get_db)):
    email = normalize_email(credentials.email)
    user = db.query(User).filter(User.email == email).first()
    if user is None or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_response(user)


@router.get("/me")
def current_account(user: User = Depends(get_current_user)):
    return {"user": {"id": user.id, "email": user.email}}
