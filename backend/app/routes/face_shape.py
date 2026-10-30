
from pathlib import Path

import mediapipe as mp
import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from io import BytesIO
from PIL import Image, ImageOps, UnidentifiedImageError

router = APIRouter(prefix="/face-shape", tags=["Face Shape"])

MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "models"
    / "face_landmarker.task"
)

MAX_FILE_SIZE = 5 * 1024 * 1024
MAX_IMAGE_PIXELS = 20_000_000
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}


@router.post("/analyze")
async def analyze_face_shape(photo: UploadFile = File(...)):
    if photo.content_type not in {
        "image/jpeg",
        "image/png",
        "image/webp",
    }:
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG, PNG, or WebP image.",
        )

    image_bytes = await photo.read(MAX_FILE_SIZE + 1)

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image must be 5 MB or smaller.",
        )

    try:
        image = Image.open(BytesIO(image_bytes))
        if image.format not in ALLOWED_FORMATS:
            raise HTTPException(
                status_code=400,
                detail="Please upload a valid JPG, PNG, or WebP image.",
            )
        if image.width * image.height > MAX_IMAGE_PIXELS:
            raise HTTPException(
                status_code=413,
                detail="Image dimensions must be 20 megapixels or smaller.",
            )
        image = ImageOps.exif_transpose(image).convert("RGB")
        image_array = np.array(image)
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image.",
        )

    if not MODEL_PATH.is_file():
        raise HTTPException(
            status_code=500,
            detail="The face-landmark model file was not found.",
        )

    try:
        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=image_array,
        )

        options = mp.tasks.vision.FaceLandmarkerOptions(
            base_options=mp.tasks.BaseOptions(
                model_asset_path=str(MODEL_PATH)
            ),
            running_mode=mp.tasks.vision.RunningMode.IMAGE,
            num_faces=1,
        )

        with mp.tasks.vision.FaceLandmarker.create_from_options(
            options
        ) as landmarker:
            result = landmarker.detect(mp_image)

    except (RuntimeError, ValueError, OSError) as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Face-landmark analysis failed: {exc}",
        )

    if not result.face_landmarks:
        return {
            "analysis_status": "completed",
            "face_detected": False,
            "message": (
                "No face detected. Try a clear, front-facing photo."
            ),
        }

    
    landmarks = result.face_landmarks[0]

    # Measure the face at several approximate landmark positions.
    # MediaPipe landmark coordinates are normalized to the image size.
    def distance(point_a, point_b):
        dx = landmarks[point_a].x - landmarks[point_b].x
        dy = landmarks[point_a].y - landmarks[point_b].y
        return (dx * dx + dy * dy) ** 0.5

    face_length = distance(10, 152)
    forehead_width = distance(103, 332)
    cheekbone_width = distance(234, 454)
    jaw_width = distance(172, 397)

    if min(face_length, forehead_width, cheekbone_width, jaw_width) <= 0:
        face_shape = "undetermined"
    else:
        length_ratio = face_length / cheekbone_width
        forehead_ratio = forehead_width / cheekbone_width
        jaw_ratio = jaw_width / cheekbone_width

        if length_ratio > 1.45:
            face_shape = "oblong"
        elif length_ratio < 1.15 and jaw_ratio > 0.85:
            face_shape = "round or square"
        elif forehead_ratio > 1.05 and jaw_ratio < 0.80:
            face_shape = "heart"
        elif jaw_ratio > 0.90 and length_ratio >= 1.15:
            face_shape = "square"
        elif length_ratio >= 1.25:
            face_shape = "oval"
        else:
            face_shape = "round or oval"

    return {
        "analysis_status": "completed",
        "face_detected": True,
        "landmark_count": len(landmarks),
        "estimated_face_shape": face_shape,
        "message": (
            "Face landmarks detected and a preliminary face-shape "
            "estimate generated. This estimate may be inaccurate."
        ),
    }
