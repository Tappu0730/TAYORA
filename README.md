# TAYORA

TAYORA is a personal grooming and style guide. This local MVP includes a browser-saved profile, skin and hair assessments, rule-based recommendations, product discovery cards, and optional face-shape estimation from a photo.

## Run locally on Windows

1. Install Python 3.11 or newer and open this folder in VS Code.
2. In a terminal at the project root, create and activate a virtual environment, then install the dependencies:

   ```powershell
   py -m venv .venv
   .venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

3. Start the API from the `backend` folder:

   ```powershell
   cd backend
   uvicorn main:app --reload
   ```

   The API documentation is at `http://127.0.0.1:8000/docs`.

4. Open `frontend/index.html` with VS Code Live Server. The checked-in [config.js](frontend/js/config.js) points to the deployed Render API. For a local backend, change `apiBaseUrl` to `http://127.0.0.1:8000/api`.

The API allows the default Live Server origins on port 5500. If your frontend uses a different port, set `CORS_ORIGINS` in `backend/.env` using the format shown in `backend/.env.example`.

## Publish the frontend on GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` publishes only the `frontend/` folder whenever `main` changes. In the GitHub repository, open **Settings → Pages**, set the source to **GitHub Actions**, and wait for the workflow to finish. The project site URL will be:

```text
https://tappu0730.github.io/TAYORA/
```

The frontend is configured to call the deployed Render API. If the Render service has an explicit `CORS_ORIGINS` environment variable, include `https://tappu0730.github.io` there as well.

## What works

- Profile preferences save in the current browser and appear on the dashboard.
- Skin-care and hair-care assessments save locally and provide general routine suggestions.
- The dashboard requests personalized starter ideas from the FastAPI recommendation endpoint.
- The Fashion page sends occasion, colour, style, and budget to `POST /api/fashion/recommendations`; the FastAPI service returns two rule-based outfit ideas as JSON.
- Face analysis uploads a JPG, PNG, or WebP image up to 5 MB. The API estimates one of six style categories (oval, round, square, rectangular, heart, or diamond) with MediaPipe landmarks and can return an uncertain result when proportions are ambiguous. Images are processed for the request and are not saved by the app.
- Live Personal Scan provides an optional camera preview, three-frame face-shape smoothing, basic lighting/framing/pose quality gates, an optional temporary photo upload, and editable skin, hair, body-proportion, and posture observations. Confirmed labels are sent to `POST /api/scan/recommendations`; camera frames and uploaded photos are not stored.
- Product cards are illustrative suggestions with approximate prices. Retailer availability and other product details are not verified.

## Current limits

- Profiles and assessment results stay in browser storage. There is no account system, cloud sync, or connected profile database yet.
- Recommendations use simple rules; Gemini/Groq and other AI integrations are not connected.
- Face-shape results are approximate style prompts, not reliable measurements or medical advice. Users can edit the estimate in their profile.
- The first Live Personal Scan version intentionally keeps skin, hair, body-proportion, and posture observations editable instead of claiming automatic diagnosis. It uses the camera for preview and face-shape estimation, while the user confirms the other observations.
- Product catalog entries and prices are examples, not live inventory.
- Configure deployment, HTTPS, API access controls, and production data handling before making the app public.

## Design references

TAYORA uses these public projects as architecture references, not copied code:

- [Face Lab](https://github.com/tommy1data/face-lab): browser-side MediaPipe face landmarks, photo upload, and live-frame analysis patterns.
- [PostureGuard](https://github.com/Yoadkk/postureGuard): local-first MediaPipe pose heuristics, calibration, and temporal smoothing ideas.
- [Skin Condition Detector AI](https://github.com/Ahmad1765/Skin-Condition-Detector-AI): region-based skin metrics and upload/webcam workflow; its medical-style model outputs are not enabled in TAYORA.
- [Hair Coloring App](https://github.com/Ys-sudo/hair-coloring-app): local image upload and MediaPipe hair-segmentation approach.

The current upload flow automatically estimates face shape only. Skin, hair, body-proportion, and posture observations remain user-confirmed until separate models are validated and added with their own privacy and license review.

## Project map

```text
frontend/       Static HTML, CSS, and JavaScript interface
backend/        FastAPI recommendation and image-analysis API
database/       Draft SQLite schema for a future account-backed version
tests/          Starter API test
```
