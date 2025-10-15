Visual Product Matcher (Vite + Express + FastAPI/CLIP/FAISS)

Structure
- frontend/  (Vite + React + CSS)
- backend/   (Express proxy to Python service)
- python_service/ (FastAPI + CLIP ViT-B/32 + FAISS + Mongo)
- scripts/   (catalog embedding script)

Step-by-step
1) Python service
   - cd python_service
   - python -m venv .venv && .venv\\Scripts\\activate (Windows) or source .venv/bin/activate (Unix)
   - pip install -r requirements.txt
   - Set env: MONGO_URI, MONGO_DB=visual_matcher, MONGO_COLLECTION=products
   - uvicorn app:app --host 0.0.0.0 --port 8001 --reload

2) Catalog embeddings (one time or when data changes)
   - Put images under data/catalog (or your path)
   - python scripts/catalog_embed.py --images_dir data/catalog --mongo_uri "mongodb://localhost:27017" --db visual_matcher --collection products
   - POST http://localhost:8001/reindex (or restart service) to rebuild FAISS

3) Backend (Express)
   - cd backend && npm install
   - set PY_SERVICE_URL=http://localhost:8001 (Windows) or export PY_SERVICE_URL=http://localhost:8001
   - npm start (runs on :8080)

4) Frontend (Vite)
   - cd frontend && npm install
   - npm run dev (Vite on :5173, proxy /api to :8080)

APIs
- Python
  - GET /health
  - POST /reindex
  - POST /search (multipart with file OR JSON { image_url, top_k, category })
- Backend
  - GET /api/health
  - POST /api/reindex
  - POST /api/search/url
  - POST /api/search/upload

Notes
- CLIP ViT-B/32 (~432MB) downloads on first run.
- FAISS index lives in-memory in the Python service.


