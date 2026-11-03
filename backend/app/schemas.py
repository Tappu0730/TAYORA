
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


class ScanPreferences(BaseModel):
    budget: Optional[float] = Field(default=None, ge=0)
    style: Optional[str] = Field(default=None, max_length=40)


class ScanRecommendationInput(BaseModel):
    face_shape: Optional[str] = Field(default=None, max_length=40)
    face_shape_source: Optional[str] = Field(default=None, max_length=40)
    skin_observations: list[str] = Field(default_factory=list, max_length=8)
    hair_type: Optional[str] = Field(default=None, max_length=40)
    hair_observations: list[str] = Field(default_factory=list, max_length=8)
    body_profile: Optional[str] = Field(default=None, max_length=60)
    posture_observations: list[str] = Field(default_factory=list, max_length=8)
    preferences: ScanPreferences = Field(default_factory=ScanPreferences)


class FashionRecommendationInput(BaseModel):
    occasion: str = Field(..., min_length=1, max_length=30)
    colour: str = Field(..., min_length=1, max_length=30)
    budget: float = Field(..., gt=0)
    comfort: str = Field(..., min_length=1, max_length=30)

