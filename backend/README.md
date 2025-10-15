# Visual Product Matcher Backend

A Node.js backend service for visual product matching using CLIP embeddings and cosine similarity search.

## Features

- **Image Search by URL**: Upload an image URL and find similar products
- **Image Search by File**: Upload an image file and find similar products
- **MongoDB Integration**: Store and retrieve product embeddings from MongoDB
- **Hugging Face CLIP**: Generate embeddings using the `openai/clip-vit-base-patch32` model
- **Python Similarity**: Fast cosine similarity computation using NumPy
- **Raw Embeddings**: No normalization in Node.js - handled in Python for efficiency
- **Caching**: Product data caching for improved performance
- **Health Monitoring**: Health check endpoint for service monitoring

## Architecture

The service follows a modular KISS (Keep It Simple, Stupid) architecture using **function-based modules** for maximum reusability:

```
backend/
├── services/
│   ├── embeddingService.js         # Hugging Face CLIP embedding generation functions
│   ├── mongoService.js             # MongoDB operation functions
│   ├── pythonSimilarityService.js  # Python similarity service interface
│   └── searchService.js            # Main orchestration functions
├── python/
│   ├── similarity.py               # Python NumPy similarity computation
│   └── test_similarity.py          # Python function tests
├── scripts/
│   └── migrateToMongo.js           # Data migration functions
├── examples/
│   └── usage-examples.js           # Examples of using individual functions
└── server.js                       # Express server with API endpoints
```

### Function-Based Design

Each service module exports individual functions that can be imported and used independently:

```javascript
// Import specific functions you need
import { generateEmbeddingFromUrl } from './services/embeddingService.js';
import { getAllProducts } from './services/mongoService.js';
import { computeSimilarityWithPython } from './services/pythonSimilarityService.js';

// Use them directly
const embedding = await generateEmbeddingFromUrl(imageUrl);  // Raw embedding (no normalization)
const products = await getAllProducts();
const results = await computeSimilarityWithPython(embedding, products, 5);  // Python handles normalization
```

### Available Functions

#### Embedding Service (`embeddingService.js`)
- `generateEmbeddingFromUrl(imageUrl)` - Generate raw embedding from image URL (no normalization)
- `generateEmbeddingFromBuffer(imageBuffer, mimeType)` - Generate raw embedding from image buffer (no normalization)
- `normalizeEmbedding(embedding)` - Normalize embedding vector (utility function)
- `validateEmbedding(embedding)` - Validate embedding dimensions

#### MongoDB Service (`mongoService.js`)
- `connectToMongo()` - Connect to MongoDB
- `disconnectFromMongo()` - Disconnect from MongoDB
- `getAllProducts()` - Get all products from database
- `getProductById(productId)` - Get specific product by ID
- `getProductsByIds(productIds)` - Get multiple products by IDs
- `getCollectionStats()` - Get collection statistics
- `validateProduct(product)` - Validate product document

#### Python Similarity Service (`pythonSimilarityService.js`)
- `computeSimilarityWithPython(queryEmbedding, products, topK)` - Compute similarity using Python/NumPy
- `testPythonService()` - Test if Python service is working

#### Search Service (`searchService.js`)
- `searchByImageUrl(imageUrl, topK, category)` - Search by image URL
- `searchByImageFile(imageBuffer, mimeType, topK, category)` - Search by image file
- `getProducts()` - Get products with caching
- `clearCache()` - Clear products cache
- `getHealthStatus()` - Get service health status
- `initializeSearchService()` - Initialize the service
- `cleanupSearchService()` - Cleanup resources

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory:

```env
# MongoDB Configuration
MONGO_CONNECTION_STRING=mongodb://localhost:27017/visual-product-matcher

# Hugging Face API Configuration
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Server Configuration
NODE_PORT=8080
```

### 3. Setup Python Environment

Install Python and numpy for similarity computation:

```bash
# Install Python (if not already installed)
# Windows: Download from python.org
# macOS: brew install python
# Linux: sudo apt install python3 python3-pip

# Install numpy (from backend directory)
cd backend
pip install -r requirements.txt
```

### 4. Get Hugging Face API Key

1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account and get your API key
3. Add it to your `.env` file

### 5. Setup MongoDB

Make sure MongoDB is running on your system. The service will connect to the `visual-product-matcher` database and `products` collection.

### 6. Migrate Data

Run the migration script to load products from JSON to MongoDB:

```bash
# Check existing data
node scripts/migrateToMongo.js check

# Migrate data
node scripts/migrateToMongo.js
```

### 7. Test Python Integration

Test if the Python similarity service is working:

```bash
# Test Python service
npm run test-python

# Test Python functions directly
cd backend/python
python test_similarity.py
```

### 8. Start the Server

```bash
npm start
```

The server will start on port 8080 (or the port specified in your `.env` file).

## API Endpoints

### POST /api/search/url

Search for similar products using an image URL.

**Request Body:**
```json
{
  "image_url": "https://example.com/image.jpg",
  "top_k": 5,
  "category": "Apparel"
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "15970",
      "name": "Turtle Check Men Navy Blue Shirt",
      "category": "Apparel",
      "image_url": "http://assets.myntassets.com/v1/images/style/properties/7a5b82d1372a7a5c6de67ae7a314fd91_images.jpg",
      "score": 0.8542
    }
  ],
  "elapsed_ms": 1250,
  "total_products_searched": 2000,
  "query_image_url": "https://example.com/image.jpg",
  "category_filter": "Apparel"
}
```

### POST /api/search/upload

Search for similar products using an uploaded image file.

**Request:** Multipart form data with:
- `file`: Image file
- `top_k`: Number of results (optional, default: 5)
- `category`: Category filter (optional)

**Response:** Same format as `/api/search/url`

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "mongodb_connected": true,
  "products_count": 2000,
  "cache_status": "cached",
  "cache_age_ms": 30000
}
```

## Data Schema

Products in MongoDB should have the following structure:

```json
{
  "id": "15970",
  "name": "Turtle Check Men Navy Blue Shirt",
  "category": "Apparel",
  "image_url": "http://assets.myntassets.com/v1/images/style/properties/7a5b82d1372a7a5c6de67ae7a314fd91_images.jpg",
  "embedding": [0.005688815377652645, 0.009083188138902187, ...] // 512 dimensions
}
```

## How It Works

1. **Image Processing**: The service receives an image URL or file upload
2. **Embedding Generation**: Uses Hugging Face CLIP model to generate a 512-dimensional **raw embedding** (no normalization)
3. **Database Query**: Retrieves all product embeddings from MongoDB
4. **Python Similarity**: Sends raw embeddings to Python service for fast NumPy-based similarity computation
5. **Normalization & Ranking**: Python normalizes embeddings and computes cosine similarity using optimized NumPy operations
6. **Results**: Returns the top-k most similar products

### Python Similarity Implementation

The Python service uses the exact approach you specified:

```python
import numpy as np

# Normalize query embedding
query = np.array(query_embedding)
query = query / np.linalg.norm(query)

# Normalize database embeddings
db_embeddings = np.array(product_embeddings)
db_embeddings = db_embeddings / np.linalg.norm(db_embeddings, axis=1, keepdims=True)

# Compute cosine similarity (dot product since all normalized)
similarities = np.dot(db_embeddings, query)

# Get top-k most similar
top_indices = np.argsort(similarities)[::-1][:top_k]
```

## Performance

- **Caching**: Product data is cached for 5 minutes to reduce database queries
- **Python NumPy**: Fast vectorized operations for similarity computation
- **Raw Embeddings**: No unnecessary normalization in Node.js - handled efficiently in Python
- **Batch Processing**: All similarity computations are done in memory using optimized NumPy operations

## Error Handling

The service includes comprehensive error handling:
- Input validation
- API key validation
- Database connection errors
- File upload validation
- Embedding generation errors

## Development

### Running in Development Mode

```bash
npm run dev
```

### Logging

The service includes detailed logging with different levels:
- `[DEBUG]`: Detailed operation information
- `[WARNING]`: Non-critical issues
- `[ERROR]`: Critical errors

### Testing

You can test the endpoints using curl:

```bash
# Test URL search
curl -X POST http://localhost:8080/api/search/url \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/image.jpg", "top_k": 5}'

# Test health check
curl http://localhost:8080/api/health
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string in `.env`

2. **Hugging Face API Error**
   - Verify API key is correct
   - Check API quota limits

3. **No Products Found**
   - Run the migration script to load data
   - Check MongoDB collection has data

4. **File Upload Issues**
   - Ensure file is a valid image
   - Check file size limits

## License

This project is part of the Visual Product Matcher application.
