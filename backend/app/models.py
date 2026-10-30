from sqlalchemy import Column, Float, Integer, String

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
