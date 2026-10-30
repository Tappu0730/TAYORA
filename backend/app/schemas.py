
from pydantic import BaseModel, Field
from typing import Optional


class ProfileInput(BaseModel):
    age: Optional[int] = Field(default=None, ge=13, le=120)
    gender: Optional[str] = None
    skin_type: Optional[str] = None
    hair_type: Optional[str] = None
    face_shape: Optional[str] = None
    concerns: Optional[str] = None
    style_preferences: Optional[str] = None
    budget: Optional[float] = Field(default=None, ge=0)



class RecommendationInput(ProfileInput):
    face_shape: str | None = None

