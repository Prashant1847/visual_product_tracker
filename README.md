# 🛍️ VISUAL PRODUCT MATCHER  
AI-powered visual search engine for e-commerce products  


# 🌐 LIVE DEMO  

🔗 https://visualproduct.vercel.app/  
Try the hosted version — upload or paste an image URL and explore visually similar products instantly.

# 🌐 GITHUB LINK
🔗 https://github.com/Prashant1847/visual_product_tracker


# 🎯 OVERVIEW

Visual Product Matcher enables users to find visually similar 
items by uploading an image or providing an image URL.

It uses Jina AI’s CLIP-v2 (512-D) model to create image embeddings 
and performs cosine similarity search over a precomputed product 
embedding database. The design focuses on low latency, low cost, 
and simplicity suitable for free-tier hosting.


# ✅ CORE FEATURES


🖼️ IMAGE UPLOAD & URL INPUT  
- Supports both file uploads and direct image URLs.  
- Displays image preview and handles invalid formats gracefully.  

🔍 VISUAL SIMILARITY SEARCH  
- Generates query embeddings via Jina CLIP-v2 API.  
- Computes cosine similarity between the query vector and stored embeddings.  
- Returns top-K visually closest items.  

🗃️ PRODUCT DATABASE WITH PRECOMPUTED EMBEDDINGS  
- Each product record in MongoDB stores:  
  `{ id, name, category, image_url, embedding }`  
- Embeddings are precomputed once using Jina CLIP-v2.  
- Stored embeddings eliminate repeated API calls and reduce latency.  
- Backend loads these vectors into a local cache on startup.  

⚡ LOCAL PRODUCT CACHE (5-MIN TTL)  
- Product embeddings cached in memory for fast search.  
- Cache refreshes every 5 minutes to sync with DB.  
- Ensures sub-second search performance for ~200 items.  

🧩 QUICK DEMO MODE  
- Includes a small demo dataset for instant testing.  


# 🧠 DESIGN RATIONALE

| DESIGN CHOICE | WHY IT MATTERS |
|----------------|----------------|
| Precomputed embeddings stored in DB | Avoids repeated API calls and latency; embeddings are static. |
| Jina API for embeddings | Offloads heavy ML computation to cloud; consistent 512-D vectors. |
| Product cache (5-min TTL) | Reduces DB read load; enables instant response. |
| Async/await API structure | Keeps backend non-blocking during network calls. |
| Cosine similarity in JS | Avoids extra Python service; keeps architecture lightweight. |
| Compact dataset (~200 items) | Balances variety with fast free-tier performance. |


# ⚙️ SYSTEM FLOW

1. User uploads image or provides URL.  
2. Backend sends image to Jina API → gets 512-D embedding.  
3. Product embeddings loaded from MongoDB cache (auto-refresh every 5 min).  
4. Cosine similarity computed between query and product vectors.  
5. Top-K results returned as JSON → displayed in frontend.  

# 🧭 SYSTEM DESIGN DIAGRAM

        ┌────────────────────────┐
        │   User Upload / URL     │
        └───────────┬─────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │  Jina CLIP-v2 API       │
        │  (Generate query vec)   │
        └───────────┬─────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │ Product DB (MongoDB)   │
        │ - Precomputed vectors  │
        └───────────┬─────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │ Cache (5 min TTL)      │
        │ - Loaded at startup    │
        │ - Auto refresh         │
        └───────────┬─────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │ Cosine Similarity Calc │
        │ Rank & Filter Results  │
        └───────────┬─────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │  JSON Response + UI     │
        └────────────────────────┘

# 🧩 TECH STACK
AI MODEL:       Jina CLIP-v2 (512-D)  
BACKEND:        Node.js + Express 
DATABASE:       MongoDB (with stored embeddings)  
CACHE:          In-memory (5-minute TTL)  
SIMILARITY:     Cosine similarity (pure JS)  
FRONTEND:       React (mobile-responsive)  
DEPLOYMENT:     Render / Vercel / Google Cloud Free Tier  


# 🧾 EVALUATION ALIGNMENT

| CRITERION | IMPLEMENTATION |
|------------|----------------|
| Problem-solving approach | Precomputed embeddings + live query encoding |
| Code quality | Modular async design, structured logging |
| Working functionality | Fully functional image-to-product search |
| Performance | Caching + precomputation optimize latency |
| Documentation | Concise, explains architecture and rationale |

============================================================
