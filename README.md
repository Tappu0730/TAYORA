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
- Face analysis uploads a JPG, PNG, or WebP image up to 5 MB. The API estimates face shape with MediaPipe landmarks and returns hairstyle and grooming ideas. Images are processed for the request and are not saved by the app.
- Live Personal Scan provides an optional camera preview, local frame-lighting checks, one temporary face-shape estimate, and editable skin, hair, body-proportion, and posture observations. Confirmed labels are sent to `POST /api/scan/recommendations`; camera frames are not stored.
- Product cards are illustrative suggestions with approximate prices. Retailer availability and other product details are not verified.

## Current limits

- Profiles and assessment results stay in browser storage. There is no account system, cloud sync, or connected profile database yet.
- Recommendations use simple rules; Gemini/Groq and other AI integrations are not connected.
- Face-shape results are approximate style prompts, not reliable measurements or medical advice. Users can edit the estimate in their profile.
- The first Live Personal Scan version intentionally keeps skin, hair, body-proportion, and posture observations editable instead of claiming automatic diagnosis. It uses the camera for preview and face-shape estimation, while the user confirms the other observations.
- Product catalog entries and prices are examples, not live inventory.
- Configure deployment, HTTPS, API access controls, and production data handling before making the app public.

## Project map

```text
frontend/       Static HTML, CSS, and JavaScript interface
backend/        FastAPI recommendation and image-analysis API
database/       Draft SQLite schema for a future account-backed version
tests/          Starter API test
```
