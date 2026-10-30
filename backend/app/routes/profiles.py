
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Profile
from app.schemas import ProfileInput

router = APIRouter(prefix="/profiles", tags=["profiles"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def create_profile(
    profile: ProfileInput,
    db: Session = Depends(get_db)
):
    profile_data = profile.model_dump()

    db_profile = Profile(**profile_data)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)

    return {
        "message": "Profile saved successfully",
        "profile": {
            "id": db_profile.id,
            **profile_data
        }
    }


@router.get("/")
def get_profiles(db: Session = Depends(get_db)):
    profiles = db.query(Profile).all()

    return {
        "profiles": [
            {
                "id": p.id,
                "age": p.age,
                "gender": p.gender,
                "skin_type": p.skin_type,
                "hair_type": p.hair_type,
                "face_shape": p.face_shape,
                "concerns": p.concerns,
                "style_preferences": p.style_preferences,
                "budget": p.budget
            }
            for p in profiles
        ]
    }
