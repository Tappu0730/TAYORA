import os
from pathlib import Path
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
DEFAULT_DATABASE_PATH = BACKEND_DIR / "tayora.db"
load_dotenv(BACKEND_DIR / ".env")

APP_NAME = os.getenv("APP_NAME", "TAYORA API")
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{DEFAULT_DATABASE_PATH.as_posix()}",
)
configured_cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

# Keep the production frontend reachable even when an older Render
# environment variable overrides the local default value.
required_cors_origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://tappu0730.github.io",
}
CORS_ORIGINS = sorted(set(configured_cors_origins) | required_cors_origins)
