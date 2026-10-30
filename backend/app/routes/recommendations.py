from fastapi import APIRouter
from app.schemas import RecommendationInput
from app.services.recommendation_service import build_recommendations
router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.post("/")
def recommendations(profile: RecommendationInput):
    # Rule-based starter logic, not an AI model or medical assessment.
    return {"source": "demo_rules", "recommendations": build_recommendations(profile.model_dump())}
