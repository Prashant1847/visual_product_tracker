
function cosineSimilarity(vecA, vecB) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10); // add small epsilon to avoid div by zero
}


export function computeSimilarity(queryEmbedding, products, topK = 5) {
  if (!Array.isArray(products) || products.length === 0) return [];

  // Compute similarity for each product
  const scoredProducts = products.map(product => {
    if (!product.embedding || !Array.isArray(product.embedding)) return null;
    const score = cosineSimilarity(queryEmbedding, product.embedding);
    return { ...product, similarity: score };
  }).filter(p => p !== null);

  // Sort by similarity descending
  scoredProducts.sort((a, b) => b.similarity - a.similarity);

  // Return top K
  return scoredProducts.slice(0, topK);
}
