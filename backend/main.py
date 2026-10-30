from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.health import router as health_router
from app.routes.recommendations import router as recommendations_router
from app.routes.face_analysis import router as face_analysis_router
from app.routes.face_shape import router as face_shape_router
from app.config import APP_NAME, CORS_ORIGINS

app = FastAPI(title=APP_NAME, version="0.2.0", description="API for TAYORA grooming and style recommendations.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(face_analysis_router, prefix="/api")
app.include_router(face_shape_router, prefix="/api")
@app.get("/")
def root():
    return {"message": "Welcome to TAYORA API", "docs": "/docs"}
