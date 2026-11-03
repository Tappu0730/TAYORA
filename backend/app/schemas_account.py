from pydantic import BaseModel, Field
from typing import Optional


class AccountProfileInput(BaseModel):
    age: Optional[int] = Field(default=None, ge=13, le=120)
    gender: Optional[str] = Field(default=None, max_length=40)
    skin_type: Optional[str] = Field(default=None, max_length=40)
    hair_type: Optional[str] = Field(default=None, max_length=40)
    face_shape: Optional[str] = Field(default=None, max_length=40)
    concerns: Optional[str] = Field(default=None, max_length=200)
    style_preferences: Optional[str] = Field(default=None, max_length=60)
    budget: Optional[float] = Field(default=None, ge=0)


class WardrobeItemInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=60)
    category: str = Field(..., min_length=1, max_length=30)
    colour: str = Field(..., min_length=1, max_length=30)
    occasion: str = Field(..., min_length=1, max_length=30)


class SavedLookInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    description: str = Field(..., max_length=1000)
    details: str = Field(..., max_length=300)
    preferences: Optional[dict] = None
