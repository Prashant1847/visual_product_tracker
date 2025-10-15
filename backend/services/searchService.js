import { generateEmbeddingFromUrl, generateEmbeddingFromBuffer } from './embeddingService.js';
import { getAllProducts, connectToMongo } from './mongoService.js';
import { computeSimilarity } from './similarityService.js';

// Cache configuration
let productsCache = null;
let cacheTimestamp = null;
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes cache


export async function searchByImageUrl(imageUrl, topK = 5, category = null) {
  const startTime = Date.now();

  try {
    const queryEmbedding = await generateEmbeddingFromUrl(imageUrl);

    const products = await getProducts();
  
    const similarProducts = computeSimilarity(
      queryEmbedding, 
      products, 
      topK
    );


    const results = similarProducts.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      image_url: product.image_url,
      score: product.similarity
    }));

    const elapsedMs = Date.now() - startTime;
   
    return {
      results: results,
      elapsed_ms: elapsedMs,
      total_products_searched: products.length,
      query_image_url: imageUrl,
      category_filter: category
    };

  } catch (error) {
    console.error('[ERROR] Search by image URL failed:', error);
    throw error;
  }
}


export async function searchByImageFile(imageBuffer, mimeType, topK = 5, category = null) {
  const startTime = Date.now();

  try {
    
    const queryEmbedding = await generateEmbeddingFromBuffer(imageBuffer, mimeType);
    const products = await getProducts();
    
    const similarProducts = computeSimilarity(
      queryEmbedding, 
      products,
      topK
    );

    // Step 5: Format results
    const results = similarProducts.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      image_url: product.image_url,
      score: product.similarity
    }));

    const elapsedMs = Date.now() - startTime;

    return {
      results: results,
      elapsed_ms: elapsedMs,
      total_products_searched: products.length,
      query_image_type: mimeType,
      category_filter: category
    };
    
  } catch (error) {
    console.error('[ERROR] Search by image file failed:', error);
    throw error;
  }
}


export async function getProducts() {
  const now = Date.now();
  
  // Check if cache is valid
  if (productsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_TIMEOUT) {
    return productsCache;
  }

  productsCache = await getAllProducts();
  cacheTimestamp = now;
  
  return productsCache;
}




export async function initializeSearchService() {
  try {
    await connectToMongo();
  } catch (error) {
    throw error;
  }
}