from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text

from app.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    skin_type = Column(String, nullable=True)
    hair_type = Column(String, nullable=True)
    face_shape = Column(String, nullable=True)
    concerns = Column(String, nullable=True)
    style_preferences = Column(String, nullable=True)
    budget = Column(Float, nullable=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(254), unique=True, nullable=False, index=True)
    password_hash = Column(String(512), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class AccountProfile(Base):
    __tablename__ = "account_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    skin_type = Column(String, nullable=True)
    hair_type = Column(String, nullable=True)
    face_shape = Column(String, nullable=True)
    concerns = Column(String, nullable=True)
    style_preferences = Column(String, nullable=True)
    budget = Column(Float, nullable=True)


class WardrobeItem(Base):
    __tablename__ = "wardrobe_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(60), nullable=False)
    category = Column(String(30), nullable=False)
    colour = Column(String(30), nullable=False)
    occasion = Column(String(30), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class SavedLook(Base):
    __tablename__ = "saved_looks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)
    details = Column(Text, nullable=False)
    preferences_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
