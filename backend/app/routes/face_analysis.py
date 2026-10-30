
from io import BytesIO

import cv2
import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

router = APIRouter(prefix="/face-analysis", tags=["Face Analysis"])

MAX_FILE_SIZE = 5 * 1024 * 1024
MAX_IMAGE_PIXELS = 20_000_000
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}


@router.post("/detect")
async def detect_face(photo: UploadFile = File(...)):
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
        image.verify()

        image = Image.open(BytesIO(image_bytes))
        image_format = image.format

        if image_format not in ALLOWED_FORMATS:
            raise HTTPException(
                status_code=400,
                detail="Please upload a valid JPG, PNG, or WebP image.",
            )

        width, height = image.size
        if width * height > MAX_IMAGE_PIXELS:
            raise HTTPException(
                status_code=413,
                detail="Image dimensions must be 20 megapixels or smaller.",
            )

        # Convert the uploaded image into an OpenCV format.
        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if frame is None:
            raise HTTPException(
                status_code=400,
                detail="Could not read the uploaded image.",
            )

        # Load the built-in frontal-face detector.
        cascade_path = (
            cv2.data.haarcascades
            + "haarcascade_frontalface_default.xml"
        )
        face_detector = cv2.CascadeClassifier(cascade_path)

        if face_detector.empty():
            raise HTTPException(
                status_code=500,
                detail="Face detector could not be loaded.",
            )

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = face_detector.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(40, 40),
        )

        face_count = len(faces)

    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image.",
        )

    return {
        "message": (
            "Face detected successfully."
            if face_count > 0
            else "No face detected. Please try a clear, front-facing photo."
        ),
        "analysis_status": "completed",
        "face_detected": face_count > 0,
        "face_count": face_count,
        "image_dimensions": {
            "width": width,
            "height": height,
        },
        "next_step": (
            "Face-shape estimation and grooming suggestions are available "
            "through the face-shape analysis endpoint."
        ),
    }
