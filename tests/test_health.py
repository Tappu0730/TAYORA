import sys
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from app.routes.health import health
from app.routes.scan import scan_recommendations
from app.schemas import ScanRecommendationInput

def test_health():
    assert health() == {"status": "ok", "service": "TAYORA API"}


def test_scan_recommendations_include_skin_ingredient_guidance():
    request = ScanRecommendationInput.model_validate({
            "skin_observations": ["possible acne-prone areas"],
            "hair_type": "Curly",
            "posture_observations": ["possible rounded shoulders"],
            "preferences": {"budget": 1500, "style": "Casual"},
        })
    response = scan_recommendations(request)

    assert response["source"] == "scan_rules"
    assert any(
        "salicylic acid" in item.get("ingredients", [])
        for item in response["recommendations"]
    )
    assert any(item["category"] == "posture" for item in response["recommendations"])


def test_scan_recommendations_reject_negative_budget():
    with pytest.raises(ValueError):
        ScanRecommendationInput.model_validate({"preferences": {"budget": -1}})


def test_scan_recommendations_preserve_face_shape_source():
    request = ScanRecommendationInput.model_validate({
        "face_shape": "Oval",
        "face_shape_source": "uploaded photo",
    })
    response = scan_recommendations(request)
    assert response["scan_summary"]["face_shape_source"] == "uploaded photo"
