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

4. Open `frontend/index.html` with VS Code Live Server. The frontend expects the API at `http://127.0.0.1:8000/api`; change `apiBaseUrl` in [config.js](frontend/js/config.js) if your setup uses another address.

The API allows the default Live Server origins on port 5500. If your frontend uses a different port, set `CORS_ORIGINS` in `backend/.env` using the format shown in `backend/.env.example`.

## What works

- Profile preferences save in the current browser and appear on the dashboard.
- Skin-care and hair-care assessments save locally and provide general routine suggestions.
- The dashboard requests personalized starter ideas from the FastAPI recommendation endpoint.
- Face analysis uploads a JPG, PNG, or WebP image up to 5 MB. The API estimates face shape with MediaPipe landmarks and returns hairstyle and grooming ideas. Images are processed for the request and are not saved by the app.
- Product cards are illustrative suggestions with approximate prices. Retailer availability and other product details are not verified.

## Current limits

- Profiles and assessment results stay in browser storage. There is no account system, cloud sync, or connected profile database yet.
- Recommendations use simple rules; Gemini/Groq and other AI integrations are not connected.
- Face-shape results are approximate style prompts, not reliable measurements or medical advice. Users can edit the estimate in their profile.
- Product catalog entries and prices are examples, not live inventory.
- Configure deployment, HTTPS, API access controls, and production data handling before making the app public.

## Project map

```text
frontend/       Static HTML, CSS, and JavaScript interface
backend/        FastAPI recommendation and image-analysis API
database/       Draft SQLite schema for a future account-backed version
tests/          Starter API test
```
