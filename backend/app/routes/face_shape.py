
from pathlib import Path
from io import BytesIO

import mediapipe as mp
import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image, ImageOps, ImageStat, UnidentifiedImageError

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

    # Validate uploaded file type
    if photo.content_type not in {
        "image/jpeg",
        "image/png",
        "image/webp",
    }:
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG, PNG, or WebP image.",
        )

    # Read uploaded image
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

    # Process image
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

        image_array = np.ascontiguousarray(
            np.asarray(image, dtype=np.uint8)
        )

    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
        Image.DecompressionBombError,
    ):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image.",
        )

    # Check MediaPipe model
    if not MODEL_PATH.is_file():
        raise HTTPException(
            status_code=500,
            detail="The face-landmark model file was not found.",
        )

    # Run MediaPipe face landmark detection
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

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Face-landmark analysis failed: "
                f"{type(exc).__name__}: {exc}"
            ),
        ) from exc

    # Check whether a face was detected
    if not result.face_landmarks:
        return {
            "analysis_status": "completed",
            "face_detected": False,
            "quality": {
                "ready": False,
                "lighting": "unknown",
                "framing": "no_face",
                "pose": "unknown",
                "messages": ["Use a clear, front-facing photo with the full face visible."],
            },
            "message": (
                "No face detected. Try a clear, front-facing photo."
            ),
        }

    landmarks = result.face_landmarks[0]

    # Basic capture-quality checks keep a single poor frame from producing a
    # confident-looking style label. These are quality gates, not identity or
    # health inferences.
    xs = [landmark.x for landmark in landmarks]
    ys = [landmark.y for landmark in landmarks]
    min_x, max_x = max(0.0, min(xs)), min(1.0, max(xs))
    min_y, max_y = max(0.0, min(ys)), min(1.0, max(ys))
    face_width = max_x - min_x
    face_height = max_y - min_y
    face_center_x = (min_x + max_x) / 2
    face_center_y = (min_y + max_y) / 2

    gray_image = ImageOps.grayscale(image)
    crop_box = (
        int(min_x * gray_image.width),
        int(min_y * gray_image.height),
        max(int(max_x * gray_image.width), 1),
        max(int(max_y * gray_image.height), 1),
    )
    face_brightness = ImageStat.Stat(gray_image.crop(crop_box)).mean[0]
    eye_mid_x = (landmarks[33].x + landmarks[263].x) / 2
    eye_distance = (
        (landmarks[33].x - landmarks[263].x) ** 2
        + (landmarks[33].y - landmarks[263].y) ** 2
    ) ** 0.5
    nose_offset = (
        abs(landmarks[1].x - eye_mid_x) / eye_distance
        if eye_distance > 0
        else 1.0
    )

    quality_messages = []
    lighting_ok = 40 <= face_brightness <= 230
    framing_ok = (
        face_width >= 0.18
        and face_height >= 0.22
        and 0.12 <= face_center_x <= 0.88
        and 0.12 <= face_center_y <= 0.88
    )
    pose_ok = nose_offset <= 0.24
    if not lighting_ok:
        quality_messages.append("Use even light without strong glare or shadows.")
    if not framing_ok:
        quality_messages.append("Move closer and keep the full face inside the frame.")
    if not pose_ok:
        quality_messages.append("Look straight at the camera for a more reliable estimate.")
    quality_ready = lighting_ok and framing_ok and pose_ok
    quality = {
        "ready": quality_ready,
        "lighting": "ok" if lighting_ok else "needs_better_light",
        "framing": "ok" if framing_ok else "face_too_small_or_off_center",
        "pose": "front_facing" if pose_ok else "turned_or_tilted",
        "messages": quality_messages,
    }

    # Calculate distances between facial landmarks
    def distance(point_a, point_b):
        dx = landmarks[point_a].x - landmarks[point_b].x
        dy = landmarks[point_a].y - landmarks[point_b].y
        return (dx * dx + dy * dy) ** 0.5

    face_length = distance(10, 152)
    forehead_width = distance(103, 332)
    cheekbone_width = distance(234, 454)
    jaw_width = distance(172, 397)

    # Estimate face shape
    if min(
        face_length,
        forehead_width,
        cheekbone_width,
        jaw_width,
    ) <= 0:
        face_shape = "undetermined"

    else:
        length_ratio = face_length / cheekbone_width
        forehead_ratio = forehead_width / cheekbone_width
        jaw_ratio = jaw_width / cheekbone_width

        # Use several proportions instead of face length alone. This keeps a
        # close camera crop from making every face look rectangular or oval.
        if length_ratio > 1.58 and jaw_ratio < 0.95:
            face_shape = "rectangular"

        elif forehead_ratio >= 1.00 and jaw_ratio <= 0.82:
            face_shape = "heart"

        elif jaw_ratio >= 0.88 and length_ratio < 1.30:
            face_shape = "round"

        elif jaw_ratio >= 0.88 and length_ratio < 1.55:
            face_shape = "square"

        elif forehead_ratio < 0.90 and jaw_ratio < 0.84:
            face_shape = "diamond"

        elif length_ratio >= 1.22:
            face_shape = "oval"

        else:
            face_shape = "uncertain"

    if not quality_ready:
        face_shape = "uncertain"

    # Return analysis result
    return {
        "analysis_status": "completed",
        "face_detected": True,
        "landmark_count": len(landmarks),
        "estimate_method": "MediaPipe landmarks with geometric ratio rules",
        "estimated_face_shape": face_shape,
        "quality": quality,
        "message": (
            "Face landmarks detected and a preliminary face-shape estimate "
            "generated. This is a style estimate, not a diagnosis."
            if quality_ready
            else "Face detected, but the frame quality is not reliable enough "
            "for a shape estimate."
        ),
    }
