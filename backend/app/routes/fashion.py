from fastapi import APIRouter

from app.schemas import FashionRecommendationInput
from app.services.recommendation_service import build_fashion_recommendations

router = APIRouter(prefix="/fashion", tags=["Fashion"])


@router.post("/recommendations")
def fashion_recommendations(request: FashionRecommendationInput):
    return {
        "source": "fashion_rules",
        "recommendations": build_fashion_recommendations(request.model_dump()),
    }
