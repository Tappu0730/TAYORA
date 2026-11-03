import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.security import hash_password, verify_password


def test_password_hash_round_trip():
    encoded = hash_password("correct-horse-battery-staple")
    assert encoded != "correct-horse-battery-staple"
    assert verify_password("correct-horse-battery-staple", encoded)
    assert not verify_password("wrong-password", encoded)
