import os
from pathlib import Path
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
DEFAULT_DATABASE_PATH = BACKEND_DIR / "tayora.db"
load_dotenv(BACKEND_DIR / ".env")

APP_NAME = os.getenv("APP_NAME", "TAYORA API")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-development-secret-key-please")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{DEFAULT_DATABASE_PATH.as_posix()}",
)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
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
