from fastapi import APIRouter

from app.schemas import ScanRecommendationInput
from app.services.recommendation_service import build_scan_recommendations

router = APIRouter(prefix="/scan", tags=["Live scan"])


@router.post("/recommendations")
def scan_recommendations(scan: ScanRecommendationInput):
    payload = scan.model_dump()
    return {
        "source": "scan_rules",
        "scan_summary": payload,
        "recommendations": build_scan_recommendations(payload),
        "disclaimer": (
            "These are general suggestions based on user-confirmed or uncertain visual observations, "
            "not a medical diagnosis."
        ),
    }
